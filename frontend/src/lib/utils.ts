import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"
import type { Currency } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Number formatting ────────────────────────────────────────────────────────

export function formatCurrency(amount: number, currency: Currency = "USD"): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatRate(bps: number): string {
  return `${(bps / 100).toFixed(2)}%`
}

export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

// ── Date formatting ──────────────────────────────────────────────────────────

export function fmtDate(iso: string): string {
  try { return format(parseISO(iso), "dd MMM yyyy") }
  catch { return iso }
}

export function fmtDateShort(iso: string): string {
  try { return format(parseISO(iso), "MMM yyyy") }
  catch { return iso }
}

export function daysUntil(iso: string): number {
  const now = new Date()
  const target = parseISO(iso)
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

// ── Loan math ────────────────────────────────────────────────────────────────

export function bpsToPercent(bps: number): number {
  return bps / 100
}

export function ltvRatio(principal: number, collateralValue: number): string {
  if (!collateralValue) return "N/A"
  return `${((principal / collateralValue) * 100).toFixed(0)}%`
}

export function repaymentProgress(amountRepaid: number, schedule: { totalDue: number }[]): number {
  const total = schedule.reduce((s, e) => s + e.totalDue, 0)
  if (!total) return 0
  return Math.min(100, (amountRepaid / total) * 100)
}

// ── Status colours ───────────────────────────────────────────────────────────

export function proposalStatusColor(status: string) {
  return {
    OPEN:      "text-success bg-success/10 border-success/20",
    FUNDED:    "text-primary bg-primary/10 border-primary/20",
    CANCELLED: "text-danger  bg-danger/10  border-danger/20",
    EXPIRED:   "text-ink-muted bg-muted border-border",
  }[status] ?? "text-ink-muted bg-muted border-border"
}

export function loanStatusColor(status: string) {
  return {
    ACTIVE:   "text-success  bg-success/10  border-success/20",
    REPAID:   "text-accent   bg-accent/10   border-accent/20",
    DEFAULTED:"text-danger   bg-danger/10   border-danger/20",
  }[status] ?? "text-ink-muted bg-muted border-border"
}

export function offerStatusColor(status: string) {
  return {
    PENDING:  "text-warning  bg-warning/10  border-warning/20",
    ACCEPTED: "text-success  bg-success/10  border-success/20",
    REJECTED: "text-danger   bg-danger/10   border-danger/20",
    WITHDRAWN:"text-ink-muted bg-muted border-border",
  }[status] ?? "text-ink-muted bg-muted border-border"
}

// ── Canton template IDs ──────────────────────────────────────────────────────

export const TEMPLATE_IDS = {
  LoanProposal: "Lex.LoanProposal:LoanProposal",
  LoanOffer:    "Lex.LoanOffer:LoanOffer",
  ActiveLoan:   "Lex.ActiveLoan:ActiveLoan",
  Collateral:   "Lex.Collateral:CollateralLock",
  Operator:     "Lex.Operator:MarketplaceOperator",
} as const
