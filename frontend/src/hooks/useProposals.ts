"use client"

import { useMemo, useState } from "react"
import { useParty } from "@/context/PartyContext"
import { proposalsForParty } from "@/lib/mock-data"
import type { ProposalWithId, LoanProposal } from "@/types"

const MOCK = process.env.NEXT_PUBLIC_MOCK_MODE === "true"

// ── Read ──────────────────────────────────────────────────────────────────────

export function useProposals() {
  const { activeParty } = useParty()

  const proposals = useMemo<ProposalWithId[]>(
    () => (MOCK ? proposalsForParty(activeParty.id, activeParty.role) : []),
    [activeParty]
  )

  const open    = useMemo(() => proposals.filter(p => p.payload.status === "OPEN"),    [proposals])
  const funded  = useMemo(() => proposals.filter(p => p.payload.status === "FUNDED"),  [proposals])
  const closed  = useMemo(() => proposals.filter(p => p.payload.status !== "OPEN" && p.payload.status !== "FUNDED"), [proposals])

  return { proposals, open, funded, closed, loading: false }
}

export function useProposal(ref: string) {
  const { proposals } = useProposals()
  return proposals.find(p => p.payload.proposalRef === ref) ?? null
}

// ── Mutations (mock layer) ────────────────────────────────────────────────────

let mockProposals: ProposalWithId[] = [] // shared mutable mock store

export function useCreateProposal() {
  const { activeParty } = useParty()
  const [loading, setLoading] = useState(false)

  async function createProposal(payload: Omit<LoanProposal, "borrower" | "operator" | "status">): Promise<void> {
    setLoading(true)
    await new Promise(r => setTimeout(r, 800)) // simulate network
    // In real mode: await createContract(TEMPLATE_IDS.LoanProposal, activeParty.id, { ...payload, borrower: activeParty.id })
    setLoading(false)
  }

  return { createProposal, loading }
}

export function useAddLender() {
  const [loading, setLoading] = useState(false)

  async function addLender(contractId: string, newLender: string): Promise<void> {
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    setLoading(false)
  }

  return { addLender, loading }
}

export function useAcceptOffer() {
  const [loading, setLoading] = useState(false)

  async function acceptOffer(
    proposalContractId: string,
    offerContractId: string,
    settlementDate: string
  ): Promise<{ loanRef: string } | null> {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200)) // simulate atomic settlement
    setLoading(false)
    return { loanRef: "LEX-SETTLED" }
  }

  return { acceptOffer, loading }
}
