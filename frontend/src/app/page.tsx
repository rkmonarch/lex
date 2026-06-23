"use client"

import Link from "next/link"
import { useRef, useEffect, useState } from "react"
import { ArrowRight, Lock, Zap, Shield, Eye, TrendingUp } from "lucide-react"
import { ProposalCard } from "@/components/ProposalCard"
import { ALL_PROPOSALS } from "@/lib/mock-data"
import { formatCurrency, formatRate } from "@/lib/utils"
import { cn } from "@/lib/utils"

function useScrollY() {
  const [scrollY, setScrollY] = useState(0)
  useEffect(() => {
    const handler = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])
  return scrollY
}

const FEATURES = [
  {
    title: "Cryptographic offer confidentiality",
    body: "Competing lenders submit rates without seeing each other's bids. Canton enforces this at the cryptographic layer — NDAs are not required.",
  },
  {
    title: "Atomic settlement in one transaction",
    body: "Offer acceptance, loan activation, and collateral locking execute in a single Canton transaction. No counterparty risk window.",
  },
  {
    title: "Role-based privacy without a trusted intermediary",
    body: "Each party sees only the contracts they are signatories or observers of. The broker has no privileged view.",
  },
]

function FeatureAccordion() {
  const [open, setOpen] = useState(0)
  return (
    <div className="divide-y divide-[var(--border)]">
      {FEATURES.map((f, i) => (
        <button
          key={i}
          onClick={() => setOpen(i === open ? -1 : i)}
          className="w-full text-left py-5 flex items-start justify-between gap-4 group"
        >
          <div>
            <p className={cn(
              "font-medium text-sm transition-colors",
              open === i ? "text-ink" : "text-ink-muted group-hover:text-ink"
            )}>
              {f.title}
            </p>
            <div className={cn(
              "overflow-hidden transition-all duration-300",
              open === i ? "max-h-40 opacity-100 mt-3" : "max-h-0 opacity-0"
            )}>
              <p className="text-sm text-ink-muted leading-relaxed">{f.body}</p>
            </div>
          </div>
          <span className={cn(
            "shrink-0 w-5 h-5 rounded-full border border-[var(--border-strong)] flex items-center justify-center text-ink-muted mt-0.5 transition-transform duration-200",
            open === i ? "rotate-45" : ""
          )}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </span>
        </button>
      ))}
    </div>
  )
}

function LiveMarketPanel() {
  const proposals = ALL_PROPOSALS.filter(p => p.payload.status === "OPEN").slice(0, 3)
  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-xs font-medium text-ink-muted uppercase tracking-widest">Live market</span>
        </div>
        <span className="text-2xs text-ink-faint font-mono">DEMO</span>
      </div>
      <div className="divide-y divide-[var(--border)]">
        {proposals.map(p => (
          <Link key={p.contractId} href={`/proposals/${p.payload.proposalRef}`}>
            <div className="px-5 py-4 hover:bg-[var(--bg-secondary)] transition-colors group">
              <div className="flex items-center justify-between mb-1">
                <span className="text-2xs font-mono text-ink-faint">{p.payload.proposalRef}</span>
                <span className="text-sm font-mono font-semibold text-ink group-hover:text-primary transition-colors">
                  {formatRate(p.payload.terms.interestRateBps)}
                </span>
              </div>
              <p className="text-sm text-ink line-clamp-1 mb-2">{p.payload.purpose}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-muted font-mono">
                  {formatCurrency(p.payload.terms.principal, p.payload.terms.currency)}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-ink-faint group-hover:text-primary transition-colors" />
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="px-5 py-3 border-t border-[var(--border)] bg-[var(--bg-secondary)]">
        <Link href="/proposals" className="text-xs text-ink-muted hover:text-ink flex items-center justify-center gap-1.5 transition-colors">
          View all proposals <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const scrollY = useScrollY()
  const sectionRef = useRef<HTMLDivElement>(null)

  const sectionTop = sectionRef.current?.offsetTop ?? 600
  const relativeScroll = Math.max(0, scrollY - sectionTop + 300)
  const card0Y = Math.min(relativeScroll * 0.25, 80)
  const card1Y = Math.min(relativeScroll * 0.15, 50)
  const card2Y = Math.min(relativeScroll * 0.35, 110)

  return (
    <div>
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="max-w-[1400px] mx-auto px-6 pt-28 pb-24">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-16 xl:gap-24 items-center min-h-[78vh]">

          {/* Left: editorial copy */}
          <div>
            <div className="inline-flex items-center gap-2 text-xs text-ink-muted border border-[var(--border)] rounded-full px-3 py-1 mb-10">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              Canton Network — Encode Club Hackathon 2024
            </div>

            <h1 className="display-heading text-ink mb-6">
              The confidential<br />
              private credit<br />
              marketplace.
            </h1>

            <p className="text-lg text-ink-muted max-w-[480px] leading-relaxed mb-10">
              Institutional-grade loan origination where competing lenders never
              see each other&apos;s bids. Canton enforces privacy cryptographically —
              not contractually.
            </p>

            <div className="flex items-center gap-3 mb-12">
              <Link href="/proposals" className="btn-black">
                Explore marketplace <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/privacy-demo" className="btn-outline">
                Privacy demo
              </Link>
            </div>

            {/* Platform stats — horizontal strip */}
            <div className="flex items-center gap-8">
              {[
                { value: "£7.5B+", label: "Target AUM" },
                { value: "3",      label: "Active deals" },
                { value: "6",      label: "Institutions" },
                { value: "1 tx",   label: "Settlement" },
              ].map((s, i, arr) => (
                <div key={s.label} className="flex items-center gap-8">
                  <div>
                    <p className="font-mono text-base font-semibold text-ink tracking-tight">{s.value}</p>
                    <p className="text-xs text-ink-muted mt-0.5">{s.label}</p>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="w-px h-7 bg-[var(--border)]" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: live market panel */}
          <div className="hidden xl:block">
            <LiveMarketPanel />
          </div>
        </div>
      </section>

      {/* ── Scroll carousel section ─────────────────────────────────── */}
      <section ref={sectionRef} className="border-t border-[var(--border)] max-w-[1400px] mx-auto px-6 py-24">
        <div className="flex gap-16 lg:gap-24">
          <div className="flex-1 scroll-sticky-left">
            <p className="text-xs text-ink-faint uppercase tracking-widest mb-4">How it works</p>
            <h2 className="section-heading text-ink mb-4">
              Confidential deal flow
            </h2>
            <p className="text-ink-muted text-sm leading-relaxed mb-8 max-w-sm">
              Browse live proposals across asset classes. Lenders see only the
              deals they&apos;ve been invited to. Competing offers are invisible to
              each other.
            </p>
            <FeatureAccordion />

            <Link
              href="/proposals"
              className="inline-flex items-center gap-2 mt-8 text-sm font-medium text-ink hover:text-primary transition-colors"
            >
              View all proposals <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Parallax cards */}
          <div className="hidden lg:block relative w-[420px] shrink-0 h-[700px]">
            <div
              className="absolute top-0 right-0 w-[320px] z-10"
              style={{ transform: `translateY(${card0Y}px)`, transition: "transform 0.1s linear" }}
            >
              <ProposalCard proposal={ALL_PROPOSALS[0]} highlight />
            </div>
            <div
              className="absolute top-[200px] left-0 w-[300px] z-20"
              style={{ transform: `translateY(${card1Y}px)`, transition: "transform 0.1s linear" }}
            >
              <ProposalCard proposal={ALL_PROPOSALS[2]} highlight />
            </div>
            <div
              className="absolute top-[400px] right-[20px] w-[310px] z-10"
              style={{ transform: `translateY(${card2Y}px)`, transition: "transform 0.1s linear" }}
            >
              <ProposalCard proposal={ALL_PROPOSALS[1]} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Three-column feature strip ──────────────────────────────── */}
      <section className="border-t border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="max-w-[1400px] mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--border)]">
          {[
            { icon: Lock,         title: "Offer confidentiality",    body: "Each lender's rate is a Canton contract observed only by the borrower. Zero information leakage between competitors." },
            { icon: Zap,          title: "Atomic settlement",         body: "Proposal + offer + active loan + collateral lock in a single transaction. Roll back or commit — together." },
            { icon: Shield,       title: "On-chain compliance trail", body: "Every repayment, default, and collateral event is an immutable Canton record for auditors and regulators." },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="px-8 py-10">
              <div className="w-8 h-8 rounded border border-[var(--border)] flex items-center justify-center mb-5">
                <Icon className="w-4 h-4 text-ink-muted" />
              </div>
              <h3 className="font-medium text-ink mb-2 text-sm">{title}</h3>
              <p className="text-sm text-ink-muted leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="max-w-[1400px] mx-auto px-6 py-28 text-center">
        <p className="text-xs text-ink-faint uppercase tracking-widest mb-4">Get started</p>
        <h2 className="section-heading text-ink mb-4">
          Ready to originate?
        </h2>
        <p className="text-ink-muted mb-10 max-w-md mx-auto text-sm leading-relaxed">
          Select your party above and explore the marketplace from a borrower&apos;s,
          lender&apos;s, or operator&apos;s perspective.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/dashboard" className="btn-black">
            Open dashboard <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/privacy-demo" className="btn-outline">
            <Eye className="w-4 h-4" />
            Privacy demo
          </Link>
        </div>
      </section>
    </div>
  )
}
