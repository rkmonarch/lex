"use client"

import Link from "next/link"
import { ArrowRight, TrendingUp, FileText, Banknote, Lock, Plus } from "lucide-react"
import { useParty } from "@/context/PartyContext"
import { useProposals } from "@/hooks/useProposals"
import { useOffers } from "@/hooks/useOffers"
import { useActiveLoans } from "@/hooks/useActiveLoans"
import { ProposalCard } from "@/components/ProposalCard"
import { OfferCard } from "@/components/OfferCard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, fmtDate, repaymentProgress } from "@/lib/utils"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const { activeParty } = useParty()
  const { open, funded }  = useProposals()
  const { offers }        = useOffers()
  const { active: activeLoans } = useActiveLoans()

  const isBorrower = activeParty.role === "borrower"
  const isLender   = activeParty.role === "lender"

  const totalExposure = activeLoans.reduce((s, l) => s + l.payload.principal, 0)
  const openOffers    = offers.filter(o => o.payload.status === "PENDING")

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="text-xs text-ink-muted mb-1 font-mono">{activeParty.role.toUpperCase()}</p>
          <h1 className="section-heading text-ink">{activeParty.displayName}</h1>
          <p className="text-ink-muted text-sm mt-1">
            {isBorrower && "Your loan proposals and active facilities"}
            {isLender   && "Deals you're invited to and your outstanding offers"}
            {activeParty.role === "operator" && "Platform overview — all participants and activity"}
          </p>
        </div>
        {isBorrower && (
          <Link href="/proposals/new">
            <Button variant="default">
              <Plus className="w-4 h-4" /> New proposal
            </Button>
          </Link>
        )}
      </div>

      {/* ── Stat strip ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          icon={FileText}
          label={isBorrower ? "Open proposals" : "Visible proposals"}
          value={String(open.length)}
          sub={`${funded.length} funded`}
        />
        <StatCard
          icon={Banknote}
          label="Active offers"
          value={String(openOffers.length)}
          sub="pending response"
        />
        <StatCard
          icon={TrendingUp}
          label="Active loans"
          value={String(activeLoans.length)}
          sub={activeLoans.length > 0 ? `${formatCurrency(totalExposure, "GBP")} total` : "—"}
        />
        <StatCard
          icon={Lock}
          label="Collateral locked"
          value={String(activeLoans.length)}
          sub="in escrow"
        />
      </div>

      {/* ── Two-column content ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Proposals column */}
        <section>
          <SectionHeader
            title={isBorrower ? "Your proposals" : "Marketplace"}
            href="/proposals"
            cta="View all"
          />
          {open.length === 0 ? (
            <EmptyState
              message={isBorrower ? "No open proposals." : "No proposals visible to you."}
              action={isBorrower ? { href: "/proposals/new", label: "Create your first proposal" } : undefined}
            />
          ) : (
            <div className="flex flex-col gap-4">
              {open.slice(0, 3).map(p => (
                <ProposalCard key={p.contractId} proposal={p} />
              ))}
            </div>
          )}
        </section>

        {/* Offers / Loans column */}
        <section>
          {isLender ? (
            <>
              <SectionHeader title="Your recent offers" href="/proposals" cta="Browse proposals" />
              {openOffers.length === 0 ? (
                <EmptyState message="No pending offers." action={{ href: "/proposals", label: "Browse open proposals" }} />
              ) : (
                <div className="flex flex-col gap-4">
                  {openOffers.slice(0, 3).map(o => (
                    <OfferCard key={o.contractId} offer={o} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <SectionHeader title="Active loans" href="/loans" cta="View all" />
              {activeLoans.length === 0 ? (
                <EmptyState message="No active loans yet." />
              ) : (
                <div className="flex flex-col gap-4">
                  {activeLoans.map(l => (
                    <LoanRow key={l.contractId} loan={l} />
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub }: {
  icon: React.ElementType; label: string; value: string; sub: string
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-ink-muted uppercase tracking-wider">{label}</p>
        <Icon className="w-4 h-4 text-ink-faint" />
      </div>
      <p className="text-2xl font-mono font-semibold text-ink tracking-tight">{value}</p>
      <p className="text-xs text-ink-muted mt-1">{sub}</p>
    </div>
  )
}

function SectionHeader({ title, href, cta }: { title: string; href: string; cta: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-medium text-ink">{title}</h2>
      <Link href={href} className="text-xs text-ink-muted hover:text-ink flex items-center gap-1 transition-colors">
        {cta} <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  )
}

function EmptyState({ message, action }: {
  message: string
  action?: { href: string; label: string }
}) {
  return (
    <div className="card p-8 text-center">
      <p className="text-sm text-ink-muted">{message}</p>
      {action && (
        <Link href={action.href} className="inline-flex items-center gap-1 mt-3 text-sm text-primary hover:underline">
          {action.label} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  )
}

function LoanRow({ loan }: { loan: import("@/types").LoanWithId }) {
  const l = loan.payload
  const pct = repaymentProgress(l.amountRepaid, l.repaymentSchedule)

  return (
    <Link href={`/loans/${l.loanRef}`}>
      <div className="card card-hover p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-mono text-ink-muted">{l.loanRef}</p>
          <Badge variant={l.status === "ACTIVE" ? "success" : "outline"} dot>{l.status}</Badge>
        </div>
        <div className="flex items-end justify-between mb-3">
          <p className="font-mono font-semibold text-ink">{formatCurrency(l.principal, l.currency)}</p>
          <p className="text-xs text-ink-muted">Matures {fmtDate(l.maturityDate)}</p>
        </div>
        {/* Progress bar */}
        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-success rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-2xs text-ink-muted mt-1">{pct.toFixed(0)}% repaid</p>
      </div>
    </Link>
  )
}
