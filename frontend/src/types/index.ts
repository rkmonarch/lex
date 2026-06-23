// TypeScript mirror of Daml contract types + Canton JSON API shapes

// ── Enumerations ────────────────────────────────────────────────────────────

export type Currency = "USD" | "EUR" | "GBP" | "CHF" | "SGD"
export type RepaymentType = "Bullet" | "Monthly" | "Quarterly"
export type PartyRole = "operator" | "borrower" | "lender"

// ── Party (frontend concept) ─────────────────────────────────────────────────

export interface DemoParty {
  id: string            // Canton party ID (e.g. "AlphaBank::...")
  displayName: string
  shortName: string
  role: PartyRole
  avatar: string        // initials
  color: string         // tailwind color class for avatar bg
  jwt?: string          // JWT for ledger auth (real mode)
}

// ── Daml contract payload types ──────────────────────────────────────────────

export interface LoanTerms {
  principal: number
  currency: Currency
  interestRateBps: number
  termMonths: number
  repaymentType: RepaymentType
  covenants: string[]
}

export interface OfferTerms {
  offeredPrincipal: number
  currency: Currency
  offeredRateBps: number
  conditions: string[]
  validUntilDate: string  // ISO date
}

export interface RepaymentEntry {
  dueDate: string
  principal: number
  interest: number
  totalDue: number
  paidAmount: number
  isPaid: boolean
}

// ── LoanProposal ─────────────────────────────────────────────────────────────

export interface LoanProposal {
  borrower: string
  operator: string
  terms: LoanTerms
  collateralDescription: string
  collateralValue: number
  purpose: string
  authorizedLenders: string[]
  proposalRef: string
  createdAt: string
  expiresAt: string
  status: "OPEN" | "FUNDED" | "CANCELLED" | "EXPIRED"
}

// ── LoanOffer ────────────────────────────────────────────────────────────────

export interface LoanOffer {
  lender: string
  borrower: string
  operator: string
  proposalRef: string
  terms: OfferTerms
  specialConditions: string[]
  submittedAt: string
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN"
}

// ── ActiveLoan ───────────────────────────────────────────────────────────────

export interface ActiveLoan {
  borrower: string
  lender: string
  operator: string
  principal: number
  currency: Currency
  interestRateBps: number
  startDate: string
  maturityDate: string
  repaymentSchedule: RepaymentEntry[]
  amountRepaid: number
  status: "ACTIVE" | "REPAID" | "DEFAULTED"
  conditions: string[]
  loanRef: string
}

// ── CollateralLock ───────────────────────────────────────────────────────────

export interface CollateralLock {
  borrower: string
  lender: string
  operator: string
  assetDescription: string
  assetValue: number
  currency: Currency
  lockedAt: string
  maturityDate: string
  loanRef: string
  status: "LOCKED" | "RELEASED" | "LIQUIDATED"
}

// ── Canton JSON API shapes ───────────────────────────────────────────────────

export interface CantonContract<T> {
  templateId: string
  contractId: string
  payload: T
  createdAt?: string
}

export interface CantonResponse<T> {
  status: number
  result: CantonContract<T>[]
}

export interface CreateResponse<T> {
  status: number
  result: CantonContract<T>
}

// ── UI state ─────────────────────────────────────────────────────────────────

export interface ProposalWithId {
  contractId: string
  payload: LoanProposal
}

export interface OfferWithId {
  contractId: string
  payload: LoanOffer
}

export interface LoanWithId {
  contractId: string
  payload: ActiveLoan
}

export interface CollateralWithId {
  contractId: string
  payload: CollateralLock
}

// ── Form schemas ─────────────────────────────────────────────────────────────

export interface CreateProposalFormValues {
  principal: number
  currency: Currency
  interestRateBps: number
  termMonths: number
  repaymentType: RepaymentType
  covenants: string
  collateralDescription: string
  collateralValue: number
  purpose: string
  proposalRef: string
  expiresAt: string
}

export interface SubmitOfferFormValues {
  offeredPrincipal: number
  offeredRateBps: number
  conditions: string
  validUntilDate: string
  specialConditions: string
}
