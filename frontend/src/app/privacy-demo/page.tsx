"use client"

import { useState } from "react"
import { Eye, EyeOff, Lock, CheckCircle2, XCircle, ArrowRight } from "lucide-react"
import { ALL_PROPOSALS, ALL_OFFERS, DEMO_PARTIES, proposalsForParty, offersForParty } from "@/lib/mock-data"
import { formatCurrency, formatRate, fmtDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// ── The crown jewel page — side-by-side view of what each party sees ─────────

const DEMO_REF = "LEX-2024-001"

const proposal = ALL_PROPOSALS.find(p => p.payload.proposalRef === DEMO_REF)!
const offerAlpha = ALL_OFFERS.find(o => o.payload.proposalRef === DEMO_REF && o.payload.lender.startsWith("Alpha"))!
const offerBeta  = ALL_OFFERS.find(o => o.payload.proposalRef === DEMO_REF && o.payload.lender.startsWith("Beta"))!

export default function PrivacyDemoPage() {
  const [revealed, setRevealed] = useState(false)
  const [step, setStep] = useState(0)

  const steps = [
    "AcmeCorp creates a proposal — visible only to AlphaBank and BetaFund",
    "AlphaBank submits offer at 4.25% — only AcmeCorp can see it",
    "BetaFund submits offer at 4.60% — only AcmeCorp can see it",
    "AcmeCorp sees both, accepts AlphaBank — atomic settlement on Canton",
  ]

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">

      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 text-xs text-primary border border-primary/20 bg-primary/5 rounded-full px-3 py-1 mb-4">
          <Lock className="w-3 h-3" /> Canton privacy enforcement demo
        </div>
        <h1 className="section-heading text-ink mb-3">Who sees what?</h1>
        <p className="text-ink-muted max-w-2xl">
          This is the core value proposition of Lex. The same deal — four parties — four completely different views.
          Canton enforces this cryptographically, not via access control lists.
        </p>
      </div>

      {/* Step navigator */}
      <div className="mb-10 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {steps.map((s, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium transition-all border",
                step === i
                  ? "bg-ink text-[var(--bg)] border-ink"
                  : "border-[var(--border)] text-ink-muted hover:text-ink hover:bg-muted"
              )}
            >
              <span className={cn(
                "w-4 h-4 rounded-full text-2xs flex items-center justify-center shrink-0",
                step === i ? "bg-[var(--bg)] text-ink" : "bg-muted text-ink-muted"
              )}>
                {i + 1}
              </span>
              <span className="hidden sm:block max-w-[180px] text-left leading-tight">{s}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Four-party privacy grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-12">
        <PartyView
          party={DEMO_PARTIES.find(p => p.shortName === "Operator")!}
          step={step}
          canSeeProposal={true}
          canSeeAlphaOffer={false}
          canSeeBetaOffer={false}
          note="Operator sees proposals for governance but CANNOT see confidential offers."
        />
        <PartyView
          party={DEMO_PARTIES.find(p => p.shortName === "AcmeCorp")!}
          step={step}
          canSeeProposal={true}
          canSeeAlphaOffer={step >= 1}
          canSeeBetaOffer={step >= 2}
          note="Borrower sees their own proposal and ALL incoming offers — full information."
          highlight
        />
        <PartyView
          party={DEMO_PARTIES.find(p => p.shortName === "AlphaBank")!}
          step={step}
          canSeeProposal={true}
          canSeeAlphaOffer={step >= 1}
          canSeeBetaOffer={false}
          note="AlphaBank sees the proposal (invited) and only their own offer. BetaFund's rate is invisible."
        />
        <PartyView
          party={DEMO_PARTIES.find(p => p.shortName === "BetaFund")!}
          step={step}
          canSeeProposal={true}
          canSeeAlphaOffer={false}
          canSeeBetaOffer={step >= 2}
          note="BetaFund sees the proposal and only their own offer. AlphaBank's rate is invisible."
        />
      </div>

      {/* Atomic settlement explainer */}
      {step === 3 && (
        <div className="card border-success/30 p-6 animate-fade-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-success" />
            </div>
            <h3 className="font-medium text-ink">Atomic settlement — one Canton transaction</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "LoanProposal",    action: "ARCHIVED",  color: "text-danger" },
              { label: "LoanOffer (Alpha)", action: "CONSUMED", color: "text-danger" },
              { label: "ActiveLoan",      action: "CREATED",   color: "text-success" },
              { label: "CollateralLock",  action: "CREATED",   color: "text-success" },
            ].map(item => (
              <div key={item.label} className="bg-muted rounded-lg p-3 text-center">
                <p className="text-xs text-ink-muted mb-1">{item.label}</p>
                <p className={cn("text-xs font-mono font-semibold", item.color)}>{item.action}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-ink-muted mt-4">
            All four ledger operations committed atomically. BetaFund's offer remains pending (borrower can reject it separately).
          </p>
        </div>
      )}

      {/* Canton privacy explanation */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-medium text-ink mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            How Canton enforces this
          </h3>
          <ul className="space-y-3 text-sm text-ink-muted">
            {[
              "Every contract is encrypted and stored on Canton sub-ledgers.",
              "A contract's payload is only decrypted for its signatories and observers.",
              "LoanOffer has observer: borrower ONLY — no other party's node receives the ciphertext.",
              "There is no trusted intermediary. The encryption is enforced at the protocol layer.",
              "A lender cannot query another lender's offer even with direct DB access.",
            ].map((t, i) => (
              <li key={i} className="flex items-start gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-6">
          <h3 className="font-medium text-ink mb-3">Daml contract privacy rules</h3>
          <div className="font-mono text-xs space-y-3">
            <CodeBlock>
              {`template LoanOffer
  with
    lender   : Party
    borrower : Party
    ...
  where
    signatory lender   -- creates the offer
    observer  borrower -- ONLY the borrower
                       -- no other lender!`}
            </CodeBlock>
            <CodeBlock highlight>
              {`template LoanProposal
  where
    signatory borrower
    observer  operator
           :: authorizedLenders
              -- only invited lenders`}
            </CodeBlock>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Party view card ───────────────────────────────────────────────────────────

function PartyView({
  party, step, canSeeProposal, canSeeAlphaOffer, canSeeBetaOffer, note, highlight
}: {
  party: typeof DEMO_PARTIES[0]
  step: number
  canSeeProposal: boolean
  canSeeAlphaOffer: boolean
  canSeeBetaOffer: boolean
  note: string
  highlight?: boolean
}) {
  const p = proposal.payload

  return (
    <div className={cn(
      "card rounded-xl overflow-hidden",
      highlight && "border-primary/30 shadow-glow"
    )}>
      {/* Party header */}
      <div className={cn(
        "px-4 py-3 border-b border-[var(--border)] flex items-center gap-2.5",
        highlight && "bg-primary/5"
      )}>
        <span className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0",
          party.color
        )}>
          {party.avatar}
        </span>
        <div>
          <p className="text-xs font-medium text-ink">{party.shortName}</p>
          <p className="text-2xs text-ink-muted capitalize">{party.role}</p>
        </div>
        {highlight && <Badge variant="primary" className="ml-auto text-2xs">Full view</Badge>}
      </div>

      {/* Content — what this party sees */}
      <div className="p-4 space-y-3">
        {/* Proposal */}
        <ContractRow
          label="LoanProposal"
          ref_={p.proposalRef}
          visible={canSeeProposal}
          content={`${formatCurrency(p.terms.principal, p.terms.currency)} · ${p.terms.termMonths}mo`}
        />

        {/* AlphaBank offer */}
        <ContractRow
          label="AlphaBank offer"
          ref_={offerAlpha.contractId}
          visible={canSeeAlphaOffer}
          content={`Rate: ${formatRate(offerAlpha.payload.terms.offeredRateBps)}`}
          sensitive
        />

        {/* BetaFund offer */}
        <ContractRow
          label="BetaFund offer"
          ref_={offerBeta.contractId}
          visible={canSeeBetaOffer}
          content={`Rate: ${formatRate(offerBeta.payload.terms.offeredRateBps)}`}
          sensitive
        />

        {/* ActiveLoan (only after step 3) */}
        <ContractRow
          label="ActiveLoan"
          ref_="LEX-2024-001"
          visible={step === 3 && (canSeeAlphaOffer || party.role === "operator")}
          content="GBP 5M @ 4.25%"
        />
      </div>

      <div className="px-4 pb-4 pt-1">
        <p className="text-2xs text-ink-faint leading-relaxed">{note}</p>
      </div>
    </div>
  )
}

function ContractRow({
  label, ref_, visible, content, sensitive
}: {
  label: string; ref_: string; visible: boolean; content: string; sensitive?: boolean
}) {
  return (
    <div className={cn(
      "rounded-md border p-2.5 transition-all duration-500",
      visible
        ? "border-[var(--border)] bg-[var(--bg-secondary)] opacity-100"
        : "border-dashed border-[var(--border)] opacity-40"
    )}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-2xs font-mono text-ink-muted">{label}</p>
        {visible
          ? <CheckCircle2 className={cn("w-3 h-3", sensitive ? "text-accent" : "text-success")} />
          : <XCircle className="w-3 h-3 text-danger" />
        }
      </div>
      <div className={cn(
        "text-xs text-ink font-mono transition-all duration-500",
        !visible && "privacy-redacted select-none"
      )}>
        {visible ? content : "████████████"}
      </div>
      <p className="text-2xs text-ink-faint mt-1 font-mono truncate">{ref_.slice(0, 12)}…</p>
    </div>
  )
}

function CodeBlock({ children, highlight }: { children: string; highlight?: boolean }) {
  return (
    <pre className={cn(
      "p-3 rounded-md text-2xs leading-relaxed overflow-x-auto",
      highlight
        ? "bg-primary/10 text-primary border border-primary/20"
        : "bg-muted text-ink-muted border border-[var(--border)]"
    )}>
      {children}
    </pre>
  )
}
