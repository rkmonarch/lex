"use client"

import { useMemo, useTransition } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useParty } from "@/context/PartyContext"
import { offersForParty } from "@/lib/mock-data"
import { getOffers, submitOffer as dbSubmit, withdrawOffer as dbWithdraw, rejectOffer as dbReject } from "@/lib/actions/offers"
import type { OfferWithId } from "@/types"

const MOCK = process.env.NEXT_PUBLIC_MOCK_MODE === "true"

export function useOffers(proposalRef?: string) {
  const { activeParty } = useParty()

  const mockData = useMemo<OfferWithId[]>(() => {
    const all = MOCK ? offersForParty(activeParty.id, activeParty.role) : []
    return proposalRef ? all.filter(o => o.payload.proposalRef === proposalRef) : all
  }, [activeParty, proposalRef])

  const { data: dbData = [], isLoading } = useQuery({
    queryKey: ["offers", activeParty.id, activeParty.role, proposalRef ?? "all"],
    queryFn:  () => getOffers(activeParty.id, activeParty.role, proposalRef),
    enabled:  !MOCK,
  })

  return { offers: MOCK ? mockData : dbData, loading: MOCK ? false : isLoading }
}

export function useSubmitOffer() {
  const { activeParty } = useParty()
  const qc = useQueryClient()
  const [isPending, startTransition] = useTransition()

  async function submitOffer(
    proposalRef:      string,
    borrower:         string,
    offeredRateBps:   number,
    offeredPrincipal: number,
    conditions:       string[],
    validUntilDate:   string,
    specialConditions:string[]
  ): Promise<void> {
    if (MOCK) { await new Promise(r => setTimeout(r, 900)); return }

    await dbSubmit({
      proposalRef,
      lender:           activeParty.id,
      borrower,
      operator:         "Operator",
      offeredPrincipal,
      currency:         "GBP",
      offeredRateBps,
      conditions,
      specialConditions,
      validUntilDate,
    })

    await qc.invalidateQueries({ queryKey: ["offers"] })
  }

  return { submitOffer, loading: isPending }
}

export function useWithdrawOffer() {
  const qc = useQueryClient()
  const [isPending] = useTransition()

  async function withdrawOffer(offerId: string): Promise<void> {
    if (MOCK) { await new Promise(r => setTimeout(r, 600)); return }
    await dbWithdraw(offerId)
    await qc.invalidateQueries({ queryKey: ["offers"] })
  }

  return { withdrawOffer, loading: isPending }
}

export function useRejectOffer() {
  const qc = useQueryClient()
  const [isPending] = useTransition()

  async function rejectOffer(offerId: string): Promise<void> {
    if (MOCK) { await new Promise(r => setTimeout(r, 600)); return }
    await dbReject(offerId)
    await qc.invalidateQueries({ queryKey: ["offers"] })
  }

  return { rejectOffer, loading: isPending }
}
