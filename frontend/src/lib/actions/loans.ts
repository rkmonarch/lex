"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import type { LoanWithId, CollateralWithId, Currency, RepaymentType, PartyRole } from "@/types"
import type { ActiveLoan, CollateralLock, RepaymentEntry } from "@prisma/client"

type LoanWithRelations = ActiveLoan & {
  repaymentSchedule: RepaymentEntry[]
  collateral:        CollateralLock | null
}

function loanToFrontend(l: LoanWithRelations): LoanWithId {
  return {
    contractId: l.id,
    payload: {
      loanRef:         l.loanRef,
      borrower:        l.borrower,
      lender:          l.lender,
      operator:        l.operator,
      principal:       l.principal,
      currency:        l.currency as Currency,
      interestRateBps: l.interestRateBps,
      startDate:       l.startDate.toISOString(),
      maturityDate:    l.maturityDate.toISOString(),
      amountRepaid:    l.amountRepaid,
      conditions:      l.conditions,
      status:          l.status as "ACTIVE" | "REPAID" | "DEFAULTED",
      repaymentSchedule: l.repaymentSchedule
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(e => ({
          id:         e.id,
          dueDate:    e.dueDate.toISOString(),
          principal:  e.principal,
          interest:   e.interest,
          totalDue:   e.totalDue,
          paidAmount: e.paidAmount,
          isPaid:     e.isPaid,
        })),
    },
  }
}

function collateralToFrontend(c: CollateralLock): CollateralWithId {
  return {
    contractId: c.id,
    payload: {
      loanRef:          c.loanRef,
      borrower:         c.borrower,
      lender:           c.lender,
      operator:         c.operator,
      assetDescription: c.assetDescription,
      assetValue:       c.assetValue,
      currency:         c.currency as Currency,
      lockedAt:         c.lockedAt.toISOString(),
      maturityDate:     c.maturityDate.toISOString(),
      status:           c.status as "LOCKED" | "RELEASED" | "LIQUIDATED",
    },
  }
}

export async function getLoans(partyId: string, role: PartyRole): Promise<LoanWithId[]> {
  const where =
    role === "borrower" ? { borrower: partyId } :
    role === "lender"   ? { lender:   partyId } :
    {}

  const rows = await db.activeLoan.findMany({
    where,
    include: { repaymentSchedule: true, collateral: true },
    orderBy: { createdAt: "desc" },
  })

  return rows.map(loanToFrontend)
}

export async function getLoan(loanRef: string): Promise<LoanWithId | null> {
  const row = await db.activeLoan.findUnique({
    where:   { loanRef },
    include: { repaymentSchedule: true, collateral: true },
  })
  return row ? loanToFrontend(row) : null
}

export async function getCollateral(partyId: string, role: PartyRole, loanRef?: string): Promise<CollateralWithId[]> {
  const partyFilter =
    role === "borrower" ? { borrower: partyId } :
    role === "lender"   ? { lender:   partyId } :
    {}

  const rows = await db.collateralLock.findMany({
    where: { ...partyFilter, ...(loanRef ? { loanRef } : {}) },
  })
  return rows.map(collateralToFrontend)
}

export async function makeRepayment(
  loanRef:       string,
  entryId:       string,
  paymentAmount: number
): Promise<void> {
  await db.$transaction(async tx => {
    await tx.repaymentEntry.update({
      where: { id: entryId },
      data: {
        paidAmount: paymentAmount,
        isPaid:     true,
      },
    })

    const loan = await tx.activeLoan.findUnique({ where: { loanRef } })
    if (!loan) return

    const newAmountRepaid = loan.amountRepaid + paymentAmount

    const remaining = await tx.repaymentEntry.count({
      where: { loanRef, isPaid: false },
    })

    await tx.activeLoan.update({
      where: { loanRef },
      data: {
        amountRepaid: newAmountRepaid,
        status: remaining === 0 ? "REPAID" : "ACTIVE",
      },
    })

    if (remaining === 0) {
      await tx.collateralLock.update({
        where: { loanRef },
        data:  { status: "RELEASED" },
      })
    }
  })

  revalidatePath(`/loans/${loanRef}`)
  revalidatePath("/loans")
  revalidatePath("/dashboard")
}
