"use client"

import { useMemo, useTransition } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useParty } from "@/context/PartyContext"
import { loansForParty, collateralForParty } from "@/lib/mock-data"
import { getLoans, getLoan, getCollateral, makeRepayment as dbMakeRepayment } from "@/lib/actions/loans"
import type { LoanWithId, CollateralWithId } from "@/types"

const MOCK = process.env.NEXT_PUBLIC_MOCK_MODE === "true"

export function useActiveLoans() {
  const { activeParty } = useParty()

  const mockData = useMemo<LoanWithId[]>(
    () => (MOCK ? loansForParty(activeParty.id, activeParty.role) : []),
    [activeParty]
  )

  const { data: dbData = [], isLoading } = useQuery({
    queryKey: ["loans", activeParty.id, activeParty.role],
    queryFn:  () => getLoans(activeParty.id, activeParty.role),
    enabled:  !MOCK,
  })

  const loans     = MOCK ? mockData : dbData
  const active    = useMemo(() => loans.filter(l => l.payload.status === "ACTIVE"),    [loans])
  const repaid    = useMemo(() => loans.filter(l => l.payload.status === "REPAID"),    [loans])
  const defaulted = useMemo(() => loans.filter(l => l.payload.status === "DEFAULTED"), [loans])

  return { loans, active, repaid, defaulted, loading: MOCK ? false : isLoading }
}

export function useLoan(ref: string) {
  const { loans } = useActiveLoans()

  const fromList = loans.find(l => l.payload.loanRef === ref) ?? null

  const { data: fromDb = null } = useQuery({
    queryKey: ["loan", ref],
    queryFn:  () => getLoan(ref),
    enabled:  !MOCK && !fromList,
  })

  return fromList ?? fromDb
}

export function useCollateral(loanRef?: string) {
  const { activeParty } = useParty()

  const mockData = useMemo<CollateralWithId[]>(() => {
    const all = MOCK ? collateralForParty(activeParty.id, activeParty.role) : []
    return loanRef ? all.filter(c => c.payload.loanRef === loanRef) : all
  }, [activeParty, loanRef])

  const { data: dbData = [], isLoading } = useQuery({
    queryKey: ["collateral", activeParty.id, activeParty.role, loanRef ?? "all"],
    queryFn:  () => getCollateral(activeParty.id, activeParty.role, loanRef),
    enabled:  !MOCK,
  })

  return { collateral: MOCK ? mockData : dbData, loading: MOCK ? false : isLoading }
}

export function useMakeRepayment() {
  const qc = useQueryClient()
  const [isPending] = useTransition()

  async function makeRepayment(
    loanRef:       string,
    entryId:       string,
    paymentAmount: number,
    _paymentDate:  string
  ): Promise<void> {
    if (MOCK) { await new Promise(r => setTimeout(r, 1000)); return }
    await dbMakeRepayment(loanRef, entryId, paymentAmount)
    await qc.invalidateQueries({ queryKey: ["loans"] })
    await qc.invalidateQueries({ queryKey: ["loan", loanRef] })
    await qc.invalidateQueries({ queryKey: ["collateral"] })
  }

  return { makeRepayment, loading: isPending }
}
