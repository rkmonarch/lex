"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { markProposalFunded } from "./proposals"
import type { OfferWithId, LoanWithId, Currency, RepaymentType, PartyRole } from "@/types"
import type { Offer } from "@prisma/client"

function toFrontend(o: Offer): OfferWithId {
  return {
    contractId: o.id,
    payload: {
      lender:   o.lender,
      borrower: o.borrower,
      operator: o.operator,
      proposalRef: o.proposalRef,
      terms: {
        offeredPrincipal: o.offeredPrincipal,
        currency:         o.currency as Currency,
        offeredRateBps:   o.offeredRateBps,
        conditions:       o.conditions,
        validUntilDate:   o.validUntilDate.toISOString(),
      },
      specialConditions: o.specialConditions,
      submittedAt:       o.submittedAt.toISOString(),
      status: o.status as "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN",
    },
  }
}

export async function getOffers(
  partyId:     string,
  role:        PartyRole,
  proposalRef?: string
): Promise<OfferWithId[]> {
  let rows: Offer[]

  const refFilter = proposalRef ? { proposalRef } : {}

  if (role === "operator") {
    rows = await db.offer.findMany({ where: { ...refFilter }, orderBy: { submittedAt: "desc" } })
  } else if (role === "borrower") {
    rows = await db.offer.findMany({
      where: { borrower: partyId, ...refFilter },
      orderBy: { submittedAt: "desc" },
    })
  } else {
    // Lender only sees their own offers — Canton privacy model
    rows = await db.offer.findMany({
      where: { lender: partyId, ...refFilter },
      orderBy: { submittedAt: "desc" },
    })
  }

  return rows.map(toFrontend)
}

export async function submitOffer(data: {
  proposalRef:      string
  lender:           string
  borrower:         string
  operator:         string
  offeredPrincipal: number
  currency:         string
  offeredRateBps:   number
  conditions:       string[]
  specialConditions:string[]
  validUntilDate:   string
}): Promise<OfferWithId> {
  const row = await db.offer.create({
    data: {
      proposalRef:      data.proposalRef,
      lender:           data.lender,
      borrower:         data.borrower,
      operator:         data.operator,
      offeredPrincipal: data.offeredPrincipal,
      currency:         data.currency,
      offeredRateBps:   data.offeredRateBps,
      conditions:       data.conditions,
      specialConditions:data.specialConditions,
      validUntilDate:   new Date(data.validUntilDate),
      status:           "PENDING",
    },
  })

  revalidatePath(`/proposals/${data.proposalRef}`)
  return toFrontend(row)
}

export async function withdrawOffer(offerId: string): Promise<void> {
  const offer = await db.offer.findUnique({ where: { id: offerId } })
  if (!offer) return

  await db.offer.update({
    where: { id: offerId },
    data:  { status: "WITHDRAWN" },
  })
  revalidatePath(`/proposals/${offer.proposalRef}`)
}

export async function rejectOffer(offerId: string): Promise<void> {
  const offer = await db.offer.findUnique({ where: { id: offerId } })
  if (!offer) return

  await db.offer.update({
    where: { id: offerId },
    data:  { status: "REJECTED" },
  })
  revalidatePath(`/proposals/${offer.proposalRef}`)
}

// ── Atomic settlement — mirrors Canton AcceptOffer choice ─────────────────────
export async function acceptOffer(
  proposalRef:   string,
  offerId:       string,
  settlementDate:string
): Promise<{ loanRef: string }> {
  const [proposal, offer] = await Promise.all([
    db.proposal.findUnique({ where: { proposalRef } }),
    db.offer.findUnique({ where: { id: offerId } }),
  ])

  if (!proposal || !offer) throw new Error("Proposal or offer not found")
  if (offer.status !== "PENDING")  throw new Error("Offer is no longer pending")
  if (proposal.status !== "OPEN")  throw new Error("Proposal is already funded or closed")

  const loanCount = await db.activeLoan.count()
  const loanRef = `LEX-LN-${String(loanCount + 1).padStart(3, "0")}`

  const startDate    = new Date(settlementDate)
  const maturityDate = new Date(startDate)
  maturityDate.setMonth(maturityDate.getMonth() + proposal.termMonths)

  // Build repayment schedule
  const rate       = offer.offeredRateBps / 10000
  const principal  = offer.offeredPrincipal
  const months     = proposal.termMonths
  const schedule   = buildSchedule(proposal.repaymentType, principal, rate, months, startDate)

  await db.$transaction(async tx => {
    // 1. Create active loan
    await tx.activeLoan.create({
      data: {
        loanRef,
        proposalRef,
        borrower:        proposal.borrower,
        lender:          offer.lender,
        operator:        proposal.operator,
        principal:       offer.offeredPrincipal,
        currency:        offer.currency,
        interestRateBps: offer.offeredRateBps,
        startDate,
        maturityDate,
        conditions:      offer.conditions,
        status:          "ACTIVE",
      },
    })

    // 2. Insert repayment schedule
    for (const [i, entry] of schedule.entries()) {
      await tx.repaymentEntry.create({
        data: { loanRef, sortOrder: i, ...entry },
      })
    }

    // 3. Lock collateral
    await tx.collateralLock.create({
      data: {
        loanRef,
        borrower:         proposal.borrower,
        lender:           offer.lender,
        operator:         proposal.operator,
        assetDescription: proposal.collateralDescription,
        assetValue:       proposal.collateralValue,
        currency:         proposal.currency,
        maturityDate,
        status:           "LOCKED",
      },
    })

    // 4. Mark offer accepted, all others rejected
    await tx.offer.update({ where: { id: offerId }, data: { status: "ACCEPTED" } })
    await tx.offer.updateMany({
      where: { proposalRef, id: { not: offerId }, status: "PENDING" },
      data:  { status: "REJECTED" },
    })

    // 5. Mark proposal funded
    await tx.proposal.update({ where: { proposalRef }, data: { status: "FUNDED" } })
  })

  revalidatePath(`/proposals/${proposalRef}`)
  revalidatePath("/proposals")
  revalidatePath("/loans")
  revalidatePath("/dashboard")

  return { loanRef }
}

// ── Schedule helpers ──────────────────────────────────────────────────────────

type ScheduleEntry = {
  dueDate:   Date
  principal: number
  interest:  number
  totalDue:  number
  paidAmount:number
  isPaid:    boolean
}

function buildSchedule(
  type:      string,
  principal: number,
  annualRate:number,
  months:    number,
  start:     Date
): ScheduleEntry[] {
  const entries: ScheduleEntry[] = []
  const periodRate = annualRate / 12

  if (type === "Bullet") {
    const totalInterest = principal * annualRate * (months / 12)
    const due = addMonths(start, months)
    entries.push({ dueDate: due, principal, interest: round(totalInterest), totalDue: round(principal + totalInterest), paidAmount: 0, isPaid: false })

  } else if (type === "Quarterly") {
    const periods = Math.ceil(months / 3)
    const principalPerPeriod = principal / periods
    let remaining = principal
    for (let i = 1; i <= periods; i++) {
      const interest = remaining * periodRate * 3
      entries.push({ dueDate: addMonths(start, i * 3), principal: round(principalPerPeriod), interest: round(interest), totalDue: round(principalPerPeriod + interest), paidAmount: 0, isPaid: false })
      remaining -= principalPerPeriod
    }

  } else {
    // Monthly amortising
    const monthlyPayment = principal * (periodRate * Math.pow(1 + periodRate, months)) / (Math.pow(1 + periodRate, months) - 1)
    let remaining = principal
    for (let i = 1; i <= months; i++) {
      const interest = remaining * periodRate
      const princ    = monthlyPayment - interest
      entries.push({ dueDate: addMonths(start, i), principal: round(princ), interest: round(interest), totalDue: round(monthlyPayment), paidAmount: 0, isPaid: false })
      remaining -= princ
    }
  }

  return entries
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

function round(n: number): number {
  return Math.round(n * 100) / 100
}
