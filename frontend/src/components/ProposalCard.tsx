"use client"

import Link from "next/link"
import { ArrowRight, Lock, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatRate, fmtDate, ltvRatio } from "@/lib/utils"
import type { ProposalWithId } from "@/types"
import { cn } from "@/lib/utils"

interface ProposalCardProps {
  proposal: ProposalWithId
  highlight?: boolean
  style?: React.CSSProperties
}

const STATUS_CONFIG: Record<string, { badge: "success" | "primary" | "outline" | "warning"; accent: string }> = {
  OPEN:      { badge: "success", accent: "bg-success" },
  FUNDED:    { badge: "primary", accent: "bg-primary" },
  CANCELLED: { badge: "outline", accent: "bg-[var(--border-strong)]" },
  EXPIRED:   { badge: "outline", accent: "bg-[var(--border-strong)]" },
}

export function ProposalCard({ proposal, highlight, style }: ProposalCardProps) {
  const p = proposal.payload
  const ltv = ltvRatio(p.terms.principal, p.collateralValue)
  const cfg = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.EXPIRED

  return (
    <Link href={`/proposals/${p.proposalRef}`} style={style}>
      <article className={cn(
        "card card-hover flex flex-col overflow-hidden",
        highlight && "shadow-float"
      )}>
        {/* Accent bar */}
        <div className={cn("h-[3px] w-full shrink-0", cfg.accent)} />

        <div className="p-5 flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-2xs font-mono text-ink-faint mb-1">{p.proposalRef}</p>
              <h3 className="font-medium text-ink text-sm leading-snug line-clamp-2">
                {p.purpose}
              </h3>
            </div>
            <Badge variant={cfg.badge} dot>
              {p.status}
            </Badge>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-4 py-4 border-y border-[var(--border)]">
            <Metric label="Principal" value={formatCurrency(p.terms.principal, p.terms.currency)} />
            <Metric label="Rate (guide)" value={formatRate(p.terms.interestRateBps)} />
            <Metric label="Term" value={`${p.terms.termMonths}mo`} />
          </div>

          {/* Collateral + footer */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-ink-muted">
              <Lock className="w-3 h-3 shrink-0 text-ink-faint" />
              <span className="truncate flex-1">{p.collateralDescription}</span>
              <span className="shrink-0 font-mono text-xs font-medium text-ink bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded">
                LTV {ltv}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-ink-muted">
                <Calendar className="w-3 h-3" />
                Expires {fmtDate(p.expiresAt)}
              </span>
              <span className="flex items-center gap-1 text-primary font-medium group-hover:gap-2 transition-all">
                View deal <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-2xs text-ink-faint uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-semibold font-mono text-ink">{value}</p>
    </div>
  )
}
