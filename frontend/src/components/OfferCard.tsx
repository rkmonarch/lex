"use client"

import { Check, X, Eye, EyeOff, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatRate, fmtDate } from "@/lib/utils"
import type { OfferWithId } from "@/types"
import { useParty } from "@/context/PartyContext"
import { cn } from "@/lib/utils"

interface OfferCardProps {
  offer: OfferWithId
  onAccept?: (contractId: string) => void
  onReject?: (contractId: string) => void
  isAccepting?: boolean
  privacyMode?: boolean  // when true, shows "hidden from others" banner
}

export function OfferCard({ offer, onAccept, onReject, isAccepting, privacyMode }: OfferCardProps) {
  const { activeParty } = useParty()
  const o = offer.payload
  const isBorrower = activeParty.role === "borrower"
  const isOwnOffer = activeParty.id === o.lender

  return (
    <div className={cn(
      "card p-5 flex flex-col gap-4 animate-fade-up",
      privacyMode && isOwnOffer && "border-accent/40"
    )}>
      {/* Privacy banner */}
      {privacyMode && (
        <div className={cn(
          "flex items-center gap-2 text-xs px-3 py-1.5 rounded-md",
          isOwnOffer
            ? "bg-accent/10 text-accent border border-accent/20"
            : "bg-danger/10 text-danger border border-danger/20"
        )}>
          {isOwnOffer
            ? <><Eye className="w-3 h-3" /> Visible to you + borrower only</>
            : <><EyeOff className="w-3 h-3" /> This offer is hidden from competing lenders</>
          }
        </div>
      )}

      {/* Lender + status */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xs text-ink-muted mb-0.5 font-mono">{o.proposalRef}</p>
          <p className="text-sm font-medium text-ink">
            {isBorrower ? `From ${o.lender.split("::")[0]}` : "Your offer"}
          </p>
        </div>
        <Badge variant={
          o.status === "PENDING"  ? "warning" :
          o.status === "ACCEPTED" ? "success" :
          o.status === "REJECTED" ? "danger"  : "outline"
        } dot>
          {o.status}
        </Badge>
      </div>

      {/* Rate highlight — the number judges watch during the demo */}
      <div className="bg-muted rounded-lg p-4 text-center">
        <p className="text-3xl font-mono font-semibold text-ink tracking-tight">
          {formatRate(o.terms.offeredRateBps)}
        </p>
        <p className="text-xs text-ink-muted mt-0.5">Annual interest rate</p>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <Detail label="Principal" value={formatCurrency(o.terms.offeredPrincipal, o.terms.currency)} mono />
        <Detail label="Valid until" value={fmtDate(o.terms.validUntilDate)} />
        <Detail label="Currency" value={o.terms.currency} mono />
        <Detail label="Submitted" value={fmtDate(o.submittedAt)} />
      </div>

      {/* Conditions */}
      {o.terms.conditions.length > 0 && (
        <div className="border-t border-[var(--border)] pt-3">
          <p className="text-2xs text-ink-muted uppercase tracking-wider mb-2">Conditions</p>
          <ul className="space-y-1">
            {o.terms.conditions.map((c, i) => (
              <li key={i} className="text-xs text-ink flex gap-2">
                <span className="text-ink-faint mt-0.5">·</span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions — borrower only, pending offers */}
      {isBorrower && o.status === "PENDING" && onAccept && onReject && (
        <div className="flex gap-2 pt-1 border-t border-[var(--border)]">
          <Button
            size="sm"
            variant="success"
            className="flex-1"
            onClick={() => onAccept(offer.contractId)}
            loading={isAccepting}
          >
            <Check className="w-3.5 h-3.5" />
            Accept — Settle atomically
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onReject(offer.contractId)}
          >
            <X className="w-3.5 h-3.5" />
            Reject
          </Button>
        </div>
      )}
    </div>
  )
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-2xs text-ink-muted uppercase tracking-wider mb-0.5">{label}</p>
      <p className={cn("text-sm text-ink font-medium", mono && "font-mono")}>{value}</p>
    </div>
  )
}
