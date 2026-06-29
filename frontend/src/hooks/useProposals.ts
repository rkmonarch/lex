"use client"

import { useMemo, useTransition } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useParty } from "@/context/PartyContext"
import { proposalsForParty } from "@/lib/mock-data"
import { getProposals, getProposal, createProposal, addAuthorizedLender } from "@/lib/actions/proposals"
import { acceptOffer as dbAcceptOffer } from "@/lib/actions/offers"
import type { ProposalWithId, LoanProposal } from "@/types"

const MOCK = process.env.NEXT_PUBLIC_MOCK_MODE === "true"

// ── Read ──────────────────────────────────────────────────────────────────────

export function useProposals() {
  const { activeParty } = useParty()

  const mockData = useMemo<ProposalWithId[]>(
    () => (MOCK ? proposalsForParty(activeParty.id, activeParty.role) : []),
    [activeParty]
  )

  const { data: dbData = [], isLoading } = useQuery({
    queryKey: ["proposals", activeParty.id, activeParty.role],
    queryFn:  () => getProposals(activeParty.id, activeParty.role),
    enabled:  !MOCK,
  })

  const proposals = MOCK ? mockData : dbData
  const open      = useMemo(() => proposals.filter(p => p.payload.status === "OPEN"),    [proposals])
  const funded    = useMemo(() => proposals.filter(p => p.payload.status === "FUNDED"),  [proposals])
  const closed    = useMemo(() => proposals.filter(p => p.payload.status !== "OPEN" && p.payload.status !== "FUNDED"), [proposals])

  return { proposals, open, funded, closed, loading: MOCK ? false : isLoading }
}

export function useProposal(ref: string) {
  const { activeParty } = useParty()
  const { proposals } = useProposals()

  // Fast path: if already in the list (from useProposals cache)
  const fromList = proposals.find(p => p.payload.proposalRef === ref) ?? null

  const { data: fromDb = null } = useQuery({
    queryKey: ["proposal", ref],
    queryFn:  () => getProposal(ref),
    enabled:  !MOCK && !fromList,
  })

  return fromList ?? fromDb
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useCreateProposal() {
  const { activeParty } = useParty()
  const qc = useQueryClient()
  const [isPending, startTransition] = useTransition()

  async function create(payload: Omit<LoanProposal, "borrower" | "operator" | "status" | "authorizedLenders" | "proposalRef" | "createdAt" | "expiresAt"> & { expiresAt: string }): Promise<string> {
    if (MOCK) {
      await new Promise(r => setTimeout(r, 800))
      return "LEX-MOCK"
    }

    const result = await createProposal({
      borrower:             activeParty.id,
      operator:             "Operator",
      purpose:              payload.purpose,
      principal:            payload.terms.principal,
      currency:             payload.terms.currency,
      interestRateBps:      payload.terms.interestRateBps,
      termMonths:           payload.terms.termMonths,
      repaymentType:        payload.terms.repaymentType,
      covenants:            payload.terms.covenants,
      collateralDescription:payload.collateralDescription,
      collateralValue:      payload.collateralValue,
      expiresAt:            payload.expiresAt,
    })

    await qc.invalidateQueries({ queryKey: ["proposals"] })
    return result.payload.proposalRef
  }

  return { createProposal: create, loading: isPending }
}

export function useAddLender() {
  const qc = useQueryClient()
  const [isPending, startTransition] = useTransition()

  async function addLender(proposalRef: string, lenderPartyId: string): Promise<void> {
    if (MOCK) { await new Promise(r => setTimeout(r, 600)); return }
    await addAuthorizedLender(proposalRef, lenderPartyId)
    await qc.invalidateQueries({ queryKey: ["proposal", proposalRef] })
    await qc.invalidateQueries({ queryKey: ["proposals"] })
  }

  return { addLender, loading: isPending }
}

export function useAcceptOffer() {
  const qc = useQueryClient()
  const [isPending, startTransition] = useTransition()

  async function acceptOffer(
    proposalRef:    string,
    offerId:        string,
    settlementDate: string
  ): Promise<{ loanRef: string } | null> {
    if (MOCK) {
      await new Promise(r => setTimeout(r, 1200))
      return { loanRef: "LEX-LN-MOCK" }
    }

    const result = await dbAcceptOffer(proposalRef, offerId, settlementDate)
    await qc.invalidateQueries({ queryKey: ["proposals"] })
    await qc.invalidateQueries({ queryKey: ["offers"] })
    await qc.invalidateQueries({ queryKey: ["loans"] })
    return result
  }

  return { acceptOffer, loading: isPending }
}
