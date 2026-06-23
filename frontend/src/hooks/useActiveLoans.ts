"use client"

import { useMemo, useState } from "react"
import { useParty } from "@/context/PartyContext"
import { loansForParty, collateralForParty } from "@/lib/mock-data"
import type { LoanWithId, CollateralWithId } from "@/types"

const MOCK = process.env.NEXT_PUBLIC_MOCK_MODE === "true"

export function useActiveLoans() {
  const { activeParty } = useParty()

  const loans = useMemo<LoanWithId[]>(
    () => (MOCK ? loansForParty(activeParty.id, activeParty.role) : []),
    [activeParty]
  )

  const active   = useMemo(() => loans.filter(l => l.payload.status === "ACTIVE"),   [loans])
  const repaid   = useMemo(() => loans.filter(l => l.payload.status === "REPAID"),   [loans])
  const defaulted= useMemo(() => loans.filter(l => l.payload.status === "DEFAULTED"),[loans])

  return { loans, active, repaid, defaulted, loading: false }
}

export function useLoan(ref: string) {
  const { loans } = useActiveLoans()
  return loans.find(l => l.payload.loanRef === ref) ?? null
}

export function useCollateral(loanRef?: string) {
  const { activeParty } = useParty()

  const collateral = useMemo<CollateralWithId[]>(() => {
    const all = MOCK ? collateralForParty(activeParty.id, activeParty.role) : []
    return loanRef ? all.filter(c => c.payload.loanRef === loanRef) : all
  }, [activeParty, loanRef])

  return { collateral, loading: false }
}

export function useMakeRepayment() {
  const [loading, setLoading] = useState(false)

  async function makeRepayment(
    contractId: string,
    scheduleIndex: number,
    paymentAmount: number,
    paymentDate: string
  ): Promise<void> {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setLoading(false)
  }

  return { makeRepayment, loading }
}
