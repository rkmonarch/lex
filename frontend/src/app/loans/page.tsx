"use client"

import Link from "next/link"
import { ArrowRight, TrendingUp } from "lucide-react"
import { useActiveLoans } from "@/hooks/useActiveLoans"
import { useParty } from "@/context/PartyContext"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatRate, fmtDate, repaymentProgress } from "@/lib/utils"
import { cn } from "@/lib/utils"

export default function LoansPage() {
  const { activeParty } = useParty()
  const { loans, active, repaid, defaulted } = useActiveLoans()

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="section-heading text-ink">Active loans</h1>
        <p className="text-ink-muted text-sm mt-1">
          {activeParty.role === "borrower" ? "Your borrowing facilities" : "Your lending portfolio"}
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Active",   count: active.length,    color: "text-success" },
          { label: "Repaid",   count: repaid.length,    color: "text-accent"  },
          { label: "Defaulted",count: defaulted.length, color: "text-danger"  },
        ].map(s => (
          <div key={s.label} className="card p-5 text-center">
            <p className={cn("text-2xl font-mono font-semibold", s.color)}>{s.count}</p>
            <p className="text-xs text-ink-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Loans table */}
      {loans.length === 0 ? (
        <div className="card p-16 text-center text-sm text-ink-muted">
          No loans visible to {activeParty.shortName}.
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="lex-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Principal</th>
                <th>Rate</th>
                <th>Maturity</th>
                <th>Progress</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loans.map(l => {
                const loan = l.payload
                const pct  = repaymentProgress(loan.amountRepaid, loan.repaymentSchedule)
                return (
                  <tr key={l.contractId}>
                    <td className="font-mono text-xs">{loan.loanRef}</td>
                    <td className="font-mono font-medium">{formatCurrency(loan.principal, loan.currency)}</td>
                    <td className="font-mono">{formatRate(loan.interestRateBps)}</td>
                    <td className="text-ink-muted">{fmtDate(loan.maturityDate)}</td>
                    <td className="w-32">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-success rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-2xs text-ink-muted font-mono">{pct.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td>
                      <Badge variant={
                        loan.status === "ACTIVE"    ? "success" :
                        loan.status === "REPAID"    ? "accent"  : "danger"
                      } dot>
                        {loan.status}
                      </Badge>
                    </td>
                    <td>
                      <Link href={`/loans/${loan.loanRef}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                        View <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
