"use client"

import { useMemo, useState } from "react"
import { useParty } from "@/context/PartyContext"
import { offersForParty } from "@/lib/mock-data"
import type { OfferWithId } from "@/types"

const MOCK = process.env.NEXT_PUBLIC_MOCK_MODE === "true"

export function useOffers(proposalRef?: string) {
  const { activeParty } = useParty()

  const offers = useMemo<OfferWithId[]>(() => {
    const all = MOCK ? offersForParty(activeParty.id, activeParty.role) : []
    return proposalRef ? all.filter(o => o.payload.proposalRef === proposalRef) : all
  }, [activeParty, proposalRef])

  return { offers, loading: false }
}

export function useSubmitOffer() {
  const { activeParty } = useParty()
  const [loading, setLoading] = useState(false)

  async function submitOffer(
    proposalRef: string,
    borrower: string,
    offeredRateBps: number,
    offeredPrincipal: number,
    conditions: string[],
    validUntilDate: string,
    specialConditions: string[]
  ): Promise<void> {
    setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    // Real: createContract(TEMPLATE_IDS.LoanOffer, activeParty.id, { lender: activeParty.id, borrower, proposalRef, ... })
    setLoading(false)
  }

  return { submitOffer, loading }
}

export function useWithdrawOffer() {
  const [loading, setLoading] = useState(false)

  async function withdrawOffer(contractId: string): Promise<void> {
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    setLoading(false)
  }

  return { withdrawOffer, loading }
}

export function useRejectOffer() {
  const [loading, setLoading] = useState(false)

  async function rejectOffer(contractId: string): Promise<void> {
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    setLoading(false)
  }

  return { rejectOffer, loading }
}
