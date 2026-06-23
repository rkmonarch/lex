"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, Plus, Lock, Users, Zap } from "lucide-react"
import { toast } from "sonner"
import { useProposal } from "@/hooks/useProposals"
import { useOffers } from "@/hooks/useOffers"
import { useParty } from "@/context/PartyContext"
import { useAcceptOffer } from "@/hooks/useProposals"
import { useSubmitOffer } from "@/hooks/useOffers"
import { OfferCard } from "@/components/OfferCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { formatCurrency, formatRate, fmtDate, ltvRatio } from "@/lib/utils"
import { DEMO_PARTIES } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export default function ProposalDetailPage({ params }: { params: { ref: string } }) {
  const { ref } = params
  const proposal = useProposal(ref)
  const { offers } = useOffers(ref)
  const { activeParty } = useParty()
  const { acceptOffer, loading: accepting } = useAcceptOffer()
  const { submitOffer, loading: submitting } = useSubmitOffer()

  const [offerDialogOpen, setOfferDialogOpen] = useState(false)
  const [settleTarget, setSettleTarget]       = useState<string | null>(null)

  // Offer form state
  const [offeredRate, setOfferedRate]   = useState("")
  const [conditions, setConditions]     = useState("")
  const [validUntil, setValidUntil]     = useState("")

  if (!proposal) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-24 text-center">
        <p className="text-ink-muted">Proposal not found or not visible to {activeParty.shortName}.</p>
        <Link href="/proposals" className="mt-3 text-sm text-primary hover:underline block">Back to marketplace</Link>
      </div>
    )
  }

  const p = proposal.payload
  const isBorrower = activeParty.role === "borrower"
  const isLender   = activeParty.role === "lender"
  const canOffer   = isLender && p.status === "OPEN"
  const hasOffer   = offers.some(o => o.payload.lender === activeParty.id)

  async function handleAccept(offerContractId: string) {
    setSettleTarget(offerContractId)
    const result = await acceptOffer(proposal!.contractId, offerContractId, new Date().toISOString().split("T")[0])
    if (result) {
      toast.success("Settlement complete — ActiveLoan + CollateralLock created atomically on Canton")
    }
    setSettleTarget(null)
  }

  async function handleSubmitOffer() {
    await submitOffer(ref, p.borrower, Number(offeredRate), p.terms.principal, conditions.split("\n").filter(Boolean), validUntil, [])
    toast.success("Offer submitted. Only the borrower can see it.")
    setOfferDialogOpen(false)
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">

      {/* Back nav */}
      <Link href="/proposals" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Marketplace
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Left: proposal detail ───────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-mono text-ink-muted mb-1">{p.proposalRef}</p>
              <h1 className="section-heading text-ink leading-tight">{p.purpose}</h1>
              <p className="text-sm text-ink-muted mt-2">
                {DEMO_PARTIES.find(d => d.id === p.borrower)?.displayName ?? p.borrower}
              </p>
            </div>
            <Badge variant={p.status === "OPEN" ? "success" : "outline"} dot>
              {p.status}
            </Badge>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Principal",   value: formatCurrency(p.terms.principal, p.terms.currency), mono: true },
              { label: "Guide rate",  value: formatRate(p.terms.interestRateBps), mono: true },
              { label: "Term",        value: `${p.terms.termMonths} months`, mono: true },
              { label: "Structure",   value: p.terms.repaymentType },
            ].map(m => (
              <div key={m.label} className="card p-4">
                <p className="text-2xs text-ink-muted uppercase tracking-wider mb-1">{m.label}</p>
                <p className={cn("font-semibold text-ink text-sm", m.mono && "font-mono")}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Collateral */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-4 h-4 text-ink-muted" />
              <h3 className="font-medium text-sm text-ink">Collateral</h3>
              <span className="ml-auto text-xs font-mono text-ink">
                LTV {ltvRatio(p.terms.principal, p.collateralValue)}
              </span>
            </div>
            <p className="text-sm text-ink-muted">{p.collateralDescription}</p>
            <p className="text-xs font-mono text-ink mt-2">
              Value: {formatCurrency(p.collateralValue, p.terms.currency)}
            </p>
          </div>

          {/* Covenants */}
          {p.terms.covenants.length > 0 && (
            <div className="card p-5">
              <h3 className="font-medium text-sm text-ink mb-3">Financial covenants</h3>
              <ul className="space-y-2">
                {p.terms.covenants.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-ink-muted">
                    <span className="mt-1 w-1 h-1 rounded-full bg-ink-faint shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Authorized lenders */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-ink-muted" />
              <h3 className="font-medium text-sm text-ink">Authorized lenders</h3>
              <Badge variant="outline">{p.authorizedLenders.length}</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {p.authorizedLenders.map(lid => {
                const party = DEMO_PARTIES.find(d => d.id === lid)
                return (
                  <span key={lid} className="px-2.5 py-1 border border-[var(--border)] rounded text-xs text-ink-muted">
                    {party?.shortName ?? lid.split("::")[0]}
                  </span>
                )
              })}
              {p.authorizedLenders.length === 0 && (
                <p className="text-xs text-ink-faint">No lenders invited yet</p>
              )}
            </div>
          </div>

          {/* Expiry */}
          <p className="text-xs text-ink-muted">
            Proposal expires: <span className="font-mono text-ink">{fmtDate(p.expiresAt)}</span>
          </p>
        </div>

        {/* ── Right: offers panel ──────────────────────────────────────── */}
        <div className="space-y-5">

          <div className="flex items-center justify-between">
            <h2 className="font-medium text-ink">
              {isBorrower ? "Competing offers" : "Your offer"}
            </h2>
            {canOffer && !hasOffer && (
              <Button size="sm" onClick={() => setOfferDialogOpen(true)}>
                <Plus className="w-3.5 h-3.5" /> Submit offer
              </Button>
            )}
          </div>

          {/* Privacy note for lenders */}
          {isLender && (
            <div className="text-xs text-ink-muted border border-[var(--border)] rounded-lg p-3 bg-muted">
              Your offer is visible only to you and the borrower. Competing lenders cannot see your rate.
            </div>
          )}

          {/* Settlement animation hint */}
          {isBorrower && offers.length > 1 && (
            <div className="flex items-center gap-2 text-xs text-primary border border-primary/20 bg-primary/5 rounded-lg p-3">
              <Zap className="w-3.5 h-3.5 shrink-0" />
              Accept any offer to trigger atomic settlement: proposal + offer archive, ActiveLoan + CollateralLock created — all in one Canton transaction.
            </div>
          )}

          {offers.length === 0 ? (
            <div className="card p-8 text-center text-sm text-ink-muted">
              {isLender ? "You haven't submitted an offer yet." : "No offers received yet."}
            </div>
          ) : (
            offers.map(o => (
              <OfferCard
                key={o.contractId}
                offer={o}
                onAccept={isBorrower ? handleAccept : undefined}
                onReject={isBorrower ? async () => toast("Offer rejected") : undefined}
                isAccepting={settleTarget === o.contractId && accepting}
                privacyMode
              />
            ))
          )}
        </div>
      </div>

      {/* ── Submit offer dialog ──────────────────────────────────────── */}
      <Dialog open={offerDialogOpen} onOpenChange={setOfferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit confidential offer</DialogTitle>
            <p className="text-sm text-ink-muted mt-1">
              Only the borrower will see your rate. Competing lenders are cryptographically blind.
            </p>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-ink block mb-1.5">Offered rate (bps)</label>
              <Input
                type="number"
                value={offeredRate}
                onChange={e => setOfferedRate(e.target.value)}
                placeholder="425  (= 4.25%)"
                suffix="bps"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink block mb-1.5">Valid until</label>
              <Input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-ink block mb-1.5">Conditions (one per line)</label>
              <textarea
                value={conditions}
                onChange={e => setConditions(e.target.value)}
                rows={3}
                placeholder="Drawdown within 10 business days…"
                className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-md text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOfferDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitOffer} loading={submitting}>
              Submit to Canton
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
