// Comprehensive mock data — powers NEXT_PUBLIC_MOCK_MODE=true demos.
// Structured to faithfully mirror Canton's privacy model: each query is
// filtered by the active party exactly as Canton would enforce it on-ledger.

import type {
  DemoParty, ProposalWithId, OfferWithId, LoanWithId, CollateralWithId,
} from "@/types"

// ── Demo parties ─────────────────────────────────────────────────────────────

export const DEMO_PARTIES: DemoParty[] = [
  {
    id: "AcmeCorp::122032a",
    displayName: "Acme Corporation Ltd",
    shortName: "AcmeCorp",
    role: "borrower",
    avatar: "AC",
    color: "bg-indigo-600",
  },
  {
    id: "NovaTech::122032b",
    displayName: "Nova Tech Holdings plc",
    shortName: "NovaTech",
    role: "borrower",
    avatar: "NT",
    color: "bg-violet-600",
  },
  {
    id: "AlphaBank::122032c",
    displayName: "Alpha Bank plc",
    shortName: "AlphaBank",
    role: "lender",
    avatar: "AB",
    color: "bg-teal-600",
  },
  {
    id: "BetaFund::122032d",
    displayName: "Beta Credit Fund LP",
    shortName: "BetaFund",
    role: "lender",
    avatar: "BF",
    color: "bg-emerald-600",
  },
  {
    id: "GammaCapital::122032e",
    displayName: "Gamma Capital Partners",
    shortName: "GammaCapital",
    role: "lender",
    avatar: "GC",
    color: "bg-amber-600",
  },
  {
    id: "Operator::122032f",
    displayName: "Lex Marketplace Operator",
    shortName: "Operator",
    role: "operator",
    avatar: "OP",
    color: "bg-slate-600",
  },
]

// ── Proposals ─────────────────────────────────────────────────────────────────

export const ALL_PROPOSALS: ProposalWithId[] = [
  {
    contractId: "#1:0",
    payload: {
      borrower: "AcmeCorp::122032a",
      operator: "Operator::122032f",
      terms: {
        principal: 5_000_000,
        currency: "GBP",
        interestRateBps: 450,
        termMonths: 36,
        repaymentType: "Quarterly",
        covenants: [
          "Net debt / EBITDA < 3.0x",
          "Interest coverage ratio > 3.0x",
          "No additional senior secured debt without lender consent",
        ],
      },
      collateralDescription: "First-ranking charge over Acme HQ, 1 Tech Lane, London EC1A 1AA",
      collateralValue: 8_500_000,
      purpose: "Growth capex: new manufacturing facility in Leeds",
      authorizedLenders: ["AlphaBank::122032c", "BetaFund::122032d"],
      proposalRef: "LEX-2026-001",
      createdAt: "2026-06-01",
      expiresAt: "2026-09-15",
      status: "OPEN",
    },
  },
  {
    contractId: "#2:0",
    payload: {
      borrower: "AcmeCorp::122032a",
      operator: "Operator::122032f",
      terms: {
        principal: 2_500_000,
        currency: "EUR",
        interestRateBps: 375,
        termMonths: 24,
        repaymentType: "Monthly",
        covenants: ["Minimum cash balance of EUR 500,000"],
      },
      collateralDescription: "Assignment of trade receivables (EUR 3.5M book)",
      collateralValue: 3_500_000,
      purpose: "Working capital: seasonal inventory build",
      authorizedLenders: ["AlphaBank::122032c", "GammaCapital::122032e"],
      proposalRef: "LEX-2026-002",
      createdAt: "2026-06-05",
      expiresAt: "2026-08-28",
      status: "OPEN",
    },
  },
  {
    contractId: "#3:0",
    payload: {
      borrower: "NovaTech::122032b",
      operator: "Operator::122032f",
      terms: {
        principal: 10_000_000,
        currency: "USD",
        interestRateBps: 520,
        termMonths: 60,
        repaymentType: "Bullet",
        covenants: [
          "Minimum EBITDA of USD 4M p.a.",
          "No material acquisition without lender consent",
          "Key-person clause: CEO + CTO",
        ],
      },
      collateralDescription: "Pledge over IP portfolio and registered patents (15 patents)",
      collateralValue: 18_000_000,
      purpose: "Series B bridge: pre-IPO growth financing",
      authorizedLenders: ["BetaFund::122032d", "GammaCapital::122032e"],
      proposalRef: "LEX-2026-003",
      createdAt: "2026-06-10",
      expiresAt: "2026-10-31",
      status: "OPEN",
    },
  },
  {
    contractId: "#4:0",
    payload: {
      borrower: "NovaTech::122032b",
      operator: "Operator::122032f",
      terms: {
        principal: 3_000_000,
        currency: "GBP",
        interestRateBps: 290,
        termMonths: 12,
        repaymentType: "Bullet",
        covenants: [],
      },
      collateralDescription: "Debenture over NovaTech assets",
      collateralValue: 4_200_000,
      purpose: "Invoice financing: government contract receivable",
      authorizedLenders: ["AlphaBank::122032c"],
      proposalRef: "LEX-2026-004",
      createdAt: "2026-01-10",
      expiresAt: "2026-02-10",
      status: "FUNDED",
    },
  },
]

// ── Offers ────────────────────────────────────────────────────────────────────
// KEY PRIVACY: offers are only visible to the specific lender + borrower pair.

export const ALL_OFFERS: OfferWithId[] = [
  {
    contractId: "#10:0",
    payload: {
      lender: "AlphaBank::122032c",
      borrower: "AcmeCorp::122032a",
      operator: "Operator::122032f",
      proposalRef: "LEX-2026-001",
      terms: {
        offeredPrincipal: 5_000_000,
        currency: "GBP",
        offeredRateBps: 425,
        conditions: ["Drawdown within 10 business days of acceptance"],
        validUntilDate: "2026-08-31",
      },
      specialConditions: ["Quarterly financial statements within 45 days of period end"],
      submittedAt: "2026-06-10",
      status: "PENDING",
    },
  },
  {
    contractId: "#11:0",
    payload: {
      lender: "BetaFund::122032d",
      borrower: "AcmeCorp::122032a",
      operator: "Operator::122032f",
      proposalRef: "LEX-2026-001",
      terms: {
        offeredPrincipal: 5_000_000,
        currency: "GBP",
        offeredRateBps: 460,
        conditions: ["Escrow account required for 6-month debt service reserve"],
        validUntilDate: "2026-08-31",
      },
      specialConditions: [],
      submittedAt: "2026-06-12",
      status: "PENDING",
    },
  },
  {
    contractId: "#12:0",
    payload: {
      lender: "AlphaBank::122032c",
      borrower: "AcmeCorp::122032a",
      operator: "Operator::122032f",
      proposalRef: "LEX-2026-002",
      terms: {
        offeredPrincipal: 2_500_000,
        currency: "EUR",
        offeredRateBps: 350,
        conditions: [],
        validUntilDate: "2026-08-20",
      },
      specialConditions: [],
      submittedAt: "2026-06-14",
      status: "PENDING",
    },
  },
  {
    contractId: "#13:0",
    payload: {
      lender: "AlphaBank::122032c",
      borrower: "NovaTech::122032b",
      operator: "Operator::122032f",
      proposalRef: "LEX-2026-004",
      terms: {
        offeredPrincipal: 3_000_000,
        currency: "GBP",
        offeredRateBps: 290,
        conditions: [],
        validUntilDate: "2026-02-05",
      },
      specialConditions: [],
      submittedAt: "2026-01-12",
      status: "ACCEPTED",
    },
  },
]

// ── Active loans ──────────────────────────────────────────────────────────────

export const ALL_LOANS: LoanWithId[] = [
  {
    contractId: "#20:0",
    payload: {
      borrower: "NovaTech::122032b",
      lender: "AlphaBank::122032c",
      operator: "Operator::122032f",
      principal: 3_000_000,
      currency: "GBP",
      interestRateBps: 290,
      startDate: "2026-01-15",
      maturityDate: "2027-01-15",
      repaymentSchedule: [
        { dueDate: "2027-01-15", principal: 3_000_000, interest: 87_000, totalDue: 3_087_000, paidAmount: 0, isPaid: false },
      ],
      amountRepaid: 0,
      status: "ACTIVE",
      conditions: [],
      loanRef: "LEX-2026-004",
    },
  },
]

// ── Collateral ────────────────────────────────────────────────────────────────

export const ALL_COLLATERAL: CollateralWithId[] = [
  {
    contractId: "#30:0",
    payload: {
      borrower: "NovaTech::122032b",
      lender: "AlphaBank::122032c",
      operator: "Operator::122032f",
      assetDescription: "Debenture over NovaTech assets",
      assetValue: 4_200_000,
      currency: "GBP",
      lockedAt: "2026-01-15",
      maturityDate: "2027-01-15",
      loanRef: "LEX-2026-004",
      status: "LOCKED",
    },
  },
]

// ── Privacy-filtered query helpers ────────────────────────────────────────────
// These replicate Canton's ledger visibility rules in mock mode.

export function proposalsForParty(partyId: string, role: string): ProposalWithId[] {
  if (role === "operator") return ALL_PROPOSALS
  if (role === "borrower") return ALL_PROPOSALS.filter(p => p.payload.borrower === partyId)
  if (role === "lender")   return ALL_PROPOSALS.filter(p => p.payload.authorizedLenders.includes(partyId))
  return []
}

export function offersForParty(partyId: string, role: string): OfferWithId[] {
  if (role === "borrower") return ALL_OFFERS.filter(o => o.payload.borrower === partyId)
  // Lender ONLY sees their OWN offers — never another lender's
  if (role === "lender")   return ALL_OFFERS.filter(o => o.payload.lender === partyId)
  if (role === "operator") return []  // operator cannot see confidential offers
  return []
}

export function loansForParty(partyId: string, role: string): LoanWithId[] {
  if (role === "operator") return ALL_LOANS
  if (role === "borrower") return ALL_LOANS.filter(l => l.payload.borrower === partyId)
  if (role === "lender")   return ALL_LOANS.filter(l => l.payload.lender === partyId)
  return []
}

export function collateralForParty(partyId: string, role: string): CollateralWithId[] {
  if (role === "operator") return ALL_COLLATERAL
  if (role === "borrower") return ALL_COLLATERAL.filter(c => c.payload.borrower === partyId)
  if (role === "lender")   return ALL_COLLATERAL.filter(c => c.payload.lender === partyId)
  return []
}
