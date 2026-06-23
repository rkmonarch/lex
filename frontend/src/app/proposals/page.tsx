"use client"

import Link from "next/link"
import { Plus, Search, SlidersHorizontal } from "lucide-react"
import { useState, useMemo } from "react"
import { useProposals } from "@/hooks/useProposals"
import { useParty } from "@/context/PartyContext"
import { ProposalCard } from "@/components/ProposalCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Currency } from "@/types"

const CURRENCIES: Currency[] = ["GBP", "USD", "EUR", "CHF", "SGD"]

export default function ProposalsPage() {
  const { activeParty } = useParty()
  const { proposals, open, loading } = useProposals()
  const [search, setSearch]   = useState("")
  const [currency, setCurrency] = useState<Currency | "ALL">("ALL")
  const [status, setStatus]   = useState<"ALL" | "OPEN" | "FUNDED">("ALL")

  const filtered = useMemo(() =>
    proposals.filter(p => {
      const matchSearch =
        !search ||
        p.payload.proposalRef.toLowerCase().includes(search.toLowerCase()) ||
        p.payload.purpose.toLowerCase().includes(search.toLowerCase())
      const matchCurrency = currency === "ALL" || p.payload.terms.currency === currency
      const matchStatus   = status   === "ALL" || p.payload.status === status
      return matchSearch && matchCurrency && matchStatus
    }),
  [proposals, search, currency, status])

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">

      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="section-heading text-ink">Marketplace</h1>
          <p className="text-ink-muted text-sm mt-1">
            {activeParty.role === "lender"
              ? `${open.length} proposals visible to ${activeParty.shortName}`
              : activeParty.role === "borrower"
              ? `Your ${open.length} open proposal${open.length !== 1 ? "s" : ""}`
              : `${proposals.length} total proposals`}
          </p>
        </div>
        {activeParty.role === "borrower" && (
          <Link href="/proposals/new">
            <Button variant="default">
              <Plus className="w-4 h-4" /> New proposal
            </Button>
          </Link>
        )}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-8 pb-6 border-b border-[var(--border)]">
        <div className="w-64">
          <Input
            placeholder="Search proposals…"
            prefix={<Search className="w-3.5 h-3.5" />}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1.5">
          {(["ALL", "OPEN", "FUNDED"] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                status === s
                  ? "bg-ink text-[var(--bg)]"
                  : "text-ink-muted hover:text-ink hover:bg-muted"
              }`}
            >
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          <SlidersHorizontal className="w-3.5 h-3.5 text-ink-muted" />
          {(["ALL", ...CURRENCIES] as const).map(c => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
                currency === c
                  ? "bg-ink text-[var(--bg)]"
                  : "text-ink-muted hover:text-ink hover:bg-muted"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Privacy notice for lenders */}
      {activeParty.role === "lender" && (
        <div className="mb-6 card p-4 border-primary/30 bg-primary/5 text-sm text-ink-muted flex items-start gap-3">
          <span className="mt-0.5 w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="w-2 h-2 rounded-full bg-primary" />
          </span>
          <span>
            You see only proposals where <strong className="text-ink">{activeParty.shortName}</strong> has been
            granted access by the borrower. Canton enforces this cryptographically.
          </span>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <SkeletonGrid />
      ) : filtered.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-ink-muted">No proposals match your filters.</p>
          {activeParty.role === "borrower" && (
            <Link href="/proposals/new" className="mt-3 text-sm text-primary hover:underline inline-block">
              Create a proposal
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(p => (
            <ProposalCard key={p.contractId} proposal={p} />
          ))}
        </div>
      )}
    </div>
  )
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="card p-5 space-y-4">
          <div className="skeleton h-4 w-24" />
          <div className="skeleton h-6 w-full" />
          <div className="grid grid-cols-3 gap-3">
            <div className="skeleton h-8" />
            <div className="skeleton h-8" />
            <div className="skeleton h-8" />
          </div>
          <div className="skeleton h-4 w-3/4" />
        </div>
      ))}
    </div>
  )
}
