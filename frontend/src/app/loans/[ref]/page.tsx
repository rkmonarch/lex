"use client"

import Link from "next/link"
import { ArrowLeft, CheckCircle2, Clock, AlertTriangle, Lock } from "lucide-react"
import { toast } from "sonner"
import { useLoan, useCollateral, useMakeRepayment } from "@/hooks/useActiveLoans"
import { useParty } from "@/context/PartyContext"
import { DEMO_PARTIES } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatRate, fmtDate, repaymentProgress } from "@/lib/utils"
import { cn } from "@/lib/utils"

export default function LoanDetailPage({ params }: { params: { ref: string } }) {
  const { ref } = params
  const loan = useLoan(ref)
  const { collateral } = useCollateral(ref)
  const { activeParty } = useParty()
  const { makeRepayment, loading } = useMakeRepayment()

  if (!loan) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-24 text-center">
        <p className="text-ink-muted">Loan not found or not visible to {activeParty.shortName}.</p>
        <Link href="/loans" className="mt-3 text-sm text-primary hover:underline block">Back to loans</Link>
      </div>
    )
  }

  const l = loan.payload
  const pct = repaymentProgress(l.amountRepaid, l.repaymentSchedule)
  const isBorrower = activeParty.role === "borrower"

  async function handleRepayment(entryId: string, amount: number) {
    await makeRepayment(l.loanRef, entryId, amount, new Date().toISOString().split("T")[0])
    toast.success("Repayment recorded on Canton ledger")
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">
      <Link href="/loans" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Loans
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left: loan details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-mono text-ink-muted mb-1">{l.loanRef}</p>
              <h1 className="section-heading text-ink">Loan facility</h1>
            </div>
            <Badge variant={l.status === "ACTIVE" ? "success" : l.status === "REPAID" ? "accent" : "danger"} dot>
              {l.status}
            </Badge>
          </div>

          {/* Key terms */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "Principal",    value: formatCurrency(l.principal, l.currency), mono: true },
              { label: "Rate",         value: formatRate(l.interestRateBps), mono: true },
              { label: "Start date",   value: fmtDate(l.startDate) },
              { label: "Maturity",     value: fmtDate(l.maturityDate) },
              { label: "Repaid",       value: formatCurrency(l.amountRepaid, l.currency), mono: true },
              { label: "Structure",    value: `${l.repaymentSchedule.length} payments` },
            ].map(m => (
              <div key={m.label} className="card p-4">
                <p className="text-2xs text-ink-muted uppercase tracking-wider mb-1">{m.label}</p>
                <p className={cn("font-semibold text-ink text-sm", m.mono && "font-mono")}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Progress */}
          <div className="card p-5">
            <div className="flex justify-between text-xs text-ink-muted mb-3">
              <span>Repayment progress</span>
              <span className="font-mono">{pct.toFixed(1)}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-success rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-ink-muted">
              {formatCurrency(l.amountRepaid, l.currency)} repaid of{" "}
              {formatCurrency(l.repaymentSchedule.reduce((s, e) => s + e.totalDue, 0), l.currency)} total
            </p>
          </div>

          {/* Repayment schedule */}
          <div className="card overflow-hidden">
            <div className="px-5 py-3 border-b border-[var(--border)]">
              <h2 className="font-medium text-sm text-ink">Repayment schedule</h2>
            </div>
            <table className="lex-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Due date</th>
                  <th>Principal</th>
                  <th>Interest</th>
                  <th>Total due</th>
                  <th>Status</th>
                  {isBorrower && <th></th>}
                </tr>
              </thead>
              <tbody>
                {l.repaymentSchedule.map((entry, i) => (
                  <tr key={i}>
                    <td className="text-ink-muted font-mono text-xs">{String(i + 1).padStart(2, "0")}</td>
                    <td className="text-ink-muted">{fmtDate(entry.dueDate)}</td>
                    <td className="font-mono">{formatCurrency(entry.principal, l.currency)}</td>
                    <td className="font-mono text-ink-muted">{formatCurrency(entry.interest, l.currency)}</td>
                    <td className="font-mono font-medium">{formatCurrency(entry.totalDue, l.currency)}</td>
                    <td>
                      {entry.isPaid
                        ? <span className="flex items-center gap-1 text-xs text-success"><CheckCircle2 className="w-3.5 h-3.5" /> Paid</span>
                        : <span className="flex items-center gap-1 text-xs text-ink-muted"><Clock className="w-3.5 h-3.5" /> Pending</span>
                      }
                    </td>
                    {isBorrower && (
                      <td>
                        {!entry.isPaid && l.status === "ACTIVE" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRepayment(entry.id ?? String(i), entry.totalDue)}
                            loading={loading}
                          >
                            Pay
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: collateral + parties */}
        <div className="space-y-5">
          {/* Collateral */}
          {collateral.map(c => (
            <div key={c.contractId} className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-4 h-4 text-accent" />
                <h3 className="font-medium text-sm text-ink">Collateral locked</h3>
                <Badge variant="accent" dot className="ml-auto">{c.payload.status}</Badge>
              </div>
              <p className="text-sm text-ink-muted mb-3">{c.payload.assetDescription}</p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Value</span>
                  <span className="font-mono text-ink">{formatCurrency(c.payload.assetValue, c.payload.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Locked since</span>
                  <span className="text-ink">{fmtDate(c.payload.lockedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Release date</span>
                  <span className="text-ink">{fmtDate(c.payload.maturityDate)}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Parties */}
          <div className="card p-5 space-y-3">
            <h3 className="font-medium text-sm text-ink mb-1">Parties</h3>
            {[
              { label: "Borrower", id: l.borrower },
              { label: "Lender",   id: l.lender },
            ].map(({ label, id }) => {
              const party = DEMO_PARTIES.find(p => p.id === id)
              return (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-ink-muted text-xs">{label}</span>
                  <div className="flex items-center gap-2">
                    {party && (
                      <span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-white text-2xs font-bold", party.color)}>
                        {party.avatar}
                      </span>
                    )}
                    <span className="text-ink text-xs font-medium">{party?.shortName ?? id.split("::")[0]}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Conditions */}
          {l.conditions.length > 0 && (
            <div className="card p-5">
              <h3 className="font-medium text-sm text-ink mb-3">Conditions</h3>
              <ul className="space-y-2">
                {l.conditions.map((c, i) => (
                  <li key={i} className="text-xs text-ink-muted flex gap-2">
                    <span className="text-ink-faint mt-0.5">·</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
