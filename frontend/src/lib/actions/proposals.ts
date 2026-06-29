"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import type { ProposalWithId, Currency, RepaymentType, PartyRole } from "@/types"
import type { Proposal } from "@prisma/client"

function toFrontend(p: Proposal): ProposalWithId {
  return {
    contractId: p.id,
    payload: {
      proposalRef:          p.proposalRef,
      borrower:             p.borrower,
      operator:             p.operator,
      authorizedLenders:    p.authorizedLenders,
      purpose:              p.purpose,
      terms: {
        principal:        p.principal,
        currency:         p.currency as Currency,
        interestRateBps:  p.interestRateBps,
        termMonths:       p.termMonths,
        repaymentType:    p.repaymentType as RepaymentType,
        covenants:        p.covenants,
      },
      collateralDescription: p.collateralDescription,
      collateralValue:       p.collateralValue,
      expiresAt:             p.expiresAt.toISOString(),
      createdAt:             p.createdAt.toISOString(),
      status:                p.status as "OPEN" | "FUNDED" | "CANCELLED" | "EXPIRED",
    },
  }
}

export async function getProposals(partyId: string, role: PartyRole): Promise<ProposalWithId[]> {
  let rows: Proposal[]

  if (role === "operator") {
    rows = await db.proposal.findMany({ orderBy: { createdAt: "desc" } })
  } else if (role === "borrower") {
    rows = await db.proposal.findMany({
      where: { borrower: partyId },
      orderBy: { createdAt: "desc" },
    })
  } else {
    // Lender: sees only proposals where they're in authorizedLenders
    rows = await db.proposal.findMany({
      where: { authorizedLenders: { has: partyId } },
      orderBy: { createdAt: "desc" },
    })
  }

  return rows.map(toFrontend)
}

export async function getProposal(proposalRef: string): Promise<ProposalWithId | null> {
  const row = await db.proposal.findUnique({ where: { proposalRef } })
  return row ? toFrontend(row) : null
}

export async function createProposal(data: {
  borrower:             string
  operator:             string
  purpose:              string
  principal:            number
  currency:             string
  interestRateBps:      number
  termMonths:           number
  repaymentType:        string
  covenants:            string[]
  collateralDescription:string
  collateralValue:      number
  expiresAt:            string
}): Promise<ProposalWithId> {
  const count = await db.proposal.count()
  const proposalRef = `LEX-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`

  const row = await db.proposal.create({
    data: {
      proposalRef,
      borrower:             data.borrower,
      operator:             data.operator,
      purpose:              data.purpose,
      principal:            data.principal,
      currency:             data.currency,
      interestRateBps:      data.interestRateBps,
      termMonths:           data.termMonths,
      repaymentType:        data.repaymentType,
      covenants:            data.covenants,
      collateralDescription:data.collateralDescription,
      collateralValue:      data.collateralValue,
      expiresAt:            new Date(data.expiresAt),
      authorizedLenders:    [],
    },
  })

  revalidatePath("/proposals")
  revalidatePath("/dashboard")
  return toFrontend(row)
}

export async function addAuthorizedLender(proposalRef: string, lenderPartyId: string): Promise<void> {
  const proposal = await db.proposal.findUnique({ where: { proposalRef } })
  if (!proposal) throw new Error("Proposal not found")

  const lenders = proposal.authorizedLenders.includes(lenderPartyId)
    ? proposal.authorizedLenders
    : [...proposal.authorizedLenders, lenderPartyId]

  await db.proposal.update({
    where: { proposalRef },
    data:  { authorizedLenders: lenders },
  })

  revalidatePath(`/proposals/${proposalRef}`)
}

export async function cancelProposal(proposalRef: string): Promise<void> {
  await db.proposal.update({
    where: { proposalRef },
    data:  { status: "CANCELLED" },
  })
  revalidatePath("/proposals")
  revalidatePath(`/proposals/${proposalRef}`)
}

export async function markProposalFunded(proposalRef: string): Promise<void> {
  await db.proposal.update({
    where: { proposalRef },
    data:  { status: "FUNDED" },
  })
}
