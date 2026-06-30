# Lex: Private Credit Marketplace — Presentation Script
## Encode Club Hackathon · Track 1: Private DeFi · Canton Network

---

## SLIDE 1 — Title

**Headline:** Lex
**Subheadline:** Confidential Private Credit on Canton Network
**Tagline:** Institutional lending. Zero information leakage.

**Visual suggestion:** Dark minimal background, the Lex corner-bracket logo mark centred, accent dot in indigo/blue.

**Speaker notes:**
> "This is Lex — a private credit marketplace built on the Canton Network. The name comes from the Latin word for law, because every deal on Lex is governed by code, not trust. We built this for Track 1: Private DeFi."

---

## SLIDE 2 — The Problem

**Headline:** Private credit is broken by design

**Three columns:**

| Opacity | Fragmentation | Counterparty risk |
|---|---|---|
| Lenders bid blind. Borrowers can't compare terms without revealing intent. | Each deal lives in a different email thread, PDF, and Excel model. | Agreements are off-chain. Settlement is manual and slow. |

**Visual suggestion:** Three icon cards in a row — an eye crossed out, a broken chain, and a warning triangle. Use warm red/amber for these.

**Speaker notes:**
> "The private credit market is worth over $2 trillion globally. But the workflow is stuck in the 1990s — NDA-gated data rooms, phone calls, and PDF term sheets. Lenders can't see competing offers. Borrowers can't discover the best rate. And everything settles manually, days later. There is no shared source of truth."

---

## SLIDE 3 — The Market

**Headline:** $2T+ and growing — still running on email

**Stats strip (large numbers, bold):**
- **$2.1T** — Global private credit AUM (2025)
- **45 days** — Average time to close a private loan
- **0 on-chain** — Settlement infrastructure

**Visual suggestion:** A single bold stat ($2.1T) centred with a line chart showing private credit AUM growth from 2015-2025 rising steeply. Source: Preqin 2024.

**Speaker notes:**
> "Private credit has been the fastest-growing asset class for a decade. But despite the scale, there is virtually no digital infrastructure purpose-built for it. The institutions doing this work deserve better tooling."

---

## SLIDE 4 — Introducing Lex

**Headline:** A confidential marketplace where every deal is a smart contract

**Three-point value prop:**

1. **Privacy by architecture** — Lenders see only the proposals they are authorised for. Competing lenders never see each other's offers. This is enforced at the ledger level, not by the UI.

2. **Atomic settlement** — Accepting an offer simultaneously creates a loan, locks collateral, and generates a repayment schedule. One transaction, zero coordination lag.

3. **Institutional identity** — Every participant is a Canton party. Your wallet address is your ledger identity.

**Visual suggestion:** Three horizontal cards stacked on the right, each with a small icon (lock, lightning bolt, ID card). Left side: a clean mockup of the marketplace proposal list.

**Speaker notes:**
> "Lex solves all three problems. Privacy is not a UI feature — it is baked into the Daml model. Lenders are on an authorised list. Off-list participants cannot even query the existence of a proposal. Settlement is atomic — no race conditions, no reconciliation. And every party is identifiable, making compliance tractable."

---

## SLIDE 5 — How Canton Privacy Works

**Headline:** The Canton privacy model in one diagram

**Diagram (describe for Canva):**

```
Borrower creates Proposal
        │
        ▼
  ┌─────────────────────────────┐
  │  Canton Ledger              │
  │                             │
  │  Proposal contract          │
  │  ┌──────────────────────┐   │
  │  │ authorizedLenders:   │   │
  │  │  [ LenderA, LenderB ]│   │
  │  └──────────────────────┘   │
  │                             │
  │  LenderA sees ──────► YES   │
  │  LenderC sees ──────► NO    │
  │  (contract invisible)       │
  └─────────────────────────────┘
```

**Key callout:** "LenderA and LenderB submit offers. They can never see each other's offer — each offer is a separate contract visible only to its author and the borrower."

**Visual suggestion:** Two-column layout. Left: the diagram above (simplified, with arrows and colour-coded boxes). Right: two bullet points explaining Canton's sub-transaction privacy.

**Speaker notes:**
> "Canton uses a unique privacy model called sub-transaction privacy. A contract is only visible to its signatories and observers. Lex uses this to enforce strict information barriers between lenders — the same barriers you would normally pay a compliance team to maintain."

---

## SLIDE 6 — The Daml Contract Model

**Headline:** Four contracts. One complete workflow.

**Contract cards (2x2 grid):**

| LoanProposal | LoanOffer |
|---|---|
| Created by borrower with terms, collateral, and authorised lender list. Expires automatically. | Submitted by an authorised lender. Visible only to that lender and the borrower. |

| ActiveLoan | CollateralLock |
|---|---|
| Created atomically when an offer is accepted. Holds the full repayment schedule. | Cryptographic proof the collateral is reserved until the loan matures or is repaid. |

**Visual suggestion:** 2×2 grid of card tiles, each with a small icon. Use a subtle border and alternating background tints. Arrows between them showing the lifecycle flow.

**Speaker notes:**
> "These four Daml contracts capture the entire private credit lifecycle. Each one has explicit choices — the operations participants can invoke. AcceptOffer is the critical one: it atomically archives the proposal, creates the ActiveLoan, and locks the collateral. If any step fails, the whole transaction rolls back."

---

## SLIDE 7 — Product Demo

**Headline:** Built and working — live demo

**Three-panel layout (screenshots or mockup frames):**

1. **Marketplace** — Proposal cards with rate, principal, LTV, and status. Colour-coded by OPEN / FUNDED.
2. **Proposal Detail** — Full terms, authorised lender list, offer submission form.
3. **Loan Dashboard** — Active loan with repayment schedule, progress bar, and one-click repayment.

**Visual suggestion:** Three browser-frame mockups side by side, slightly angled for depth. Use the actual screenshots from the app if available.

**Speaker notes:**
> "Let me show you what we built. Borrowers post proposals. Authorised lenders see them and submit offers. The borrower accepts one — the loan settles atomically. The lender tracks repayments. The privacy demo page lets you switch between parties to see exactly what each participant can and cannot see."

---

## SLIDE 8 — Tech Stack

**Headline:** Production-grade stack, end to end

**Stack table:**

| Layer | Technology | Why |
|---|---|---|
| Smart contracts | Daml 2.9 on Canton Network | Sub-transaction privacy, atomic settlement |
| Frontend | Next.js 14 App Router + TypeScript | SSR, server actions, type safety |
| Styling | TailwindCSS + CSS variables | Consistent design tokens, dark mode |
| Database | Neon DB (serverless PostgreSQL) + Prisma | Mirrors Canton state for fast reads |
| Wallet | RainbowKit + wagmi + viem | Multi-wallet support, wallet = party identity |
| Data | React Query | Optimistic updates, stale-while-revalidate |

**Visual suggestion:** A vertical stack diagram with layer labels and logos on the right column. Clean, technical aesthetic.

**Speaker notes:**
> "The Daml layer is authoritative — it is the source of truth for all settlement. The Next.js frontend reads from a Neon DB mirror for fast queries, with server actions enforcing the same privacy rules as Canton in SQL. Connecting a wallet assigns you a Canton party ID derived from your wallet address."

---

## SLIDE 9 — Architecture

**Headline:** From wallet to Canton, in four hops

**Architecture diagram:**

```
User Wallet (MetaMask / WalletConnect)
       │  wallet address → party ID
       ▼
Next.js 14 Frontend
  ├─ Server Actions (privacy-enforced SQL)
  └─ React Query (cache + optimistic UI)
       │
       ▼
Neon DB (PostgreSQL)         Canton Ledger (Daml)
  mirrors contract state  ←──  source of truth
```

**Two callouts:**
- "Privacy rules are enforced in two places: Daml contract visibility AND SQL WHERE clauses in server actions"
- "Atomic settlement: db.$transaction mirrors Canton's AcceptOffer choice — 5 operations, all-or-nothing"

**Visual suggestion:** Horizontal flow diagram with four boxes and connecting arrows. Highlight the "privacy enforced here" points with a lock icon.

**Speaker notes:**
> "The architecture has two enforcement layers. In demo/mock mode, the server actions apply Canton-equivalent privacy rules in SQL — lenders can only query their own offers, borrowers see only their own proposals. In full Canton mode, the ledger enforces this cryptographically."

---

## SLIDE 10 — Privacy Demo

**Headline:** See what each party actually sees

**Three column layout:**

| Operator | Borrower | Lender |
|---|---|---|
| Sees all proposals, all offers, all loans. Full oversight. | Sees own proposals and the offers received on them. Cannot see other borrowers' deals. | Sees only proposals they are authorised for. Cannot see other lenders' offers. Enforced at ledger level. |

**Visual suggestion:** Three avatar circles at the top (coloured by role), with a simplified table below showing checkmarks and crosses for what each party can see.

**Speaker notes:**
> "This is the key insight of Canton that we built the whole product around. It is not access control — it is cryptographic invisibility. A lender does not get a 403 error when they try to see another lender's offer. The contract simply does not exist in their view of the ledger."

---

## SLIDE 11 — Roadmap

**Headline:** What comes after the hackathon

**Three phases:**

**Phase 1 — Now (Hackathon)**
- Four Daml contracts, complete lifecycle
- Full-stack Next.js marketplace
- Wallet connect with Canton party identity
- Mock mode for demo + live DB mode

**Phase 2 — Next (3 months)**
- Deploy to Canton Network testnet
- Real JWT authentication per party
- Multi-currency support (USD, EUR, GBP, CHF, SGD)
- Covenant monitoring with automated alerts
- Secondary market transfers (loan participations)

**Phase 3 — Production (6 months)**
- Canton mainnet deployment
- KYC/KYB integration for lender onboarding
- Credit scoring oracle integration
- Regulatory reporting module
- Institutional custody support

**Visual suggestion:** Three-column timeline cards with phase labels, icons, and bullet lists. Use a muted progression colour (grey → blue → indigo).

**Speaker notes:**
> "We have the core mechanic working. The next step is deploying to a real Canton node and wiring up JWT authentication so the ledger enforces the privacy rules directly, not just in SQL. After that, secondary market transfers — letting lenders sell participations in active loans."

---

## SLIDE 12 — Why Canton?

**Headline:** Privacy that cannot be configured away

**Two-column split:**

**Left — The problem with other blockchains:**
- Public chains: all data visible to everyone
- Private chains: need to trust the operator
- Zero-knowledge proofs: computationally expensive, limited expressiveness
- Permissioned Ethereum (Quorum, Besu): no native sub-transaction privacy

**Right — Canton's advantage:**
- Sub-transaction privacy is part of the protocol
- Daml enforces access at the contract level, not the application level
- No trusted intermediary needed
- Atomic cross-party settlement with cryptographic finality

**Visual suggestion:** Two columns with icons. Left column uses soft red for each point. Right column uses green checkmarks.

**Speaker notes:**
> "We evaluated other options. Public chains leak all deal information. ZK proofs can model privacy but not the full richness of financial contracts. Canton was purpose-built for exactly this use case: multi-party financial workflows with strict information barriers. Daml is the right language and Canton is the right network."

---

## SLIDE 13 — Closing / Ask

**Headline:** Lex is the Bloomberg terminal that lenders can trust

**Single strong statement:**
"We built Lex to prove that institutional private credit — the most bespoke, confidential, high-value asset class in traditional finance — can be brought entirely on-chain without sacrificing any of its privacy requirements."

**What we're asking for:**
- Feedback from judges on the Daml contract model
- Connections to institutional investors interested in Canton
- Encode Club support for testnet deployment

**Footer line:**
> "Built in [X] days for the Encode Club Hackathon · Track 1: Private DeFi"

**Visual suggestion:** Full-bleed dark slide, large centred headline, the Lex logo at the top, and three small call-to-action bullets at the bottom. Keep it clean — no clutter.

**Speaker notes:**
> "Private credit is the last major asset class that has not been touched by DeFi — and that is because existing chains cannot deliver the privacy institutions need. Canton can. Lex is the proof. Thank you."

---

## APPENDIX — Backup slides (have ready if asked)

### A1 — Daml Code Snippet
Show the `LoanProposal` template and `AcceptOffer` choice.

### A2 — Security model
Explain the difference between UI access control and Canton cryptographic visibility.

### A3 — Competitive landscape
Centrifuge (public chain, limited privacy), Maple Finance (centralised), Goldfinch (no privacy). Lex is the only solution with Canton sub-transaction privacy.

### A4 — Numbers from the demo
- 4 loan proposals seeded
- 5 lender offers
- 1 active loan with quarterly repayment schedule
- 1 collateral lock tracking £2.1M in assets

---

## CANVA TIPS

- **Template to use:** "Pitch Deck" or "Minimal Tech Presentation"
- **Fonts:** Headlines in a geometric sans-serif (e.g. DM Sans Bold or Inter SemiBold), body in Inter Regular
- **Colours:**
  - Background: `#0F1117` (dark) or `#FFFFFF` (light version)
  - Primary: `#2563EB` (blue) 
  - Accent: `#6366F1` (indigo)
  - Success: `#059669` (green)
  - Text: `#0A0A0A` on light / `#F4F4F5` on dark
- **Slide count:** 13 main + 4 backup = 17 total
- **Slide ratio:** 16:9
- **Estimated presentation time:** 8-10 minutes + Q&A
