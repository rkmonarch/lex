# Lex — Confidential Private Credit Marketplace

> **Encode Club Canton Hackathon — Track 1: Private DeFi**

Lex is an institutional-grade platform where banks, funds, and corporates can
issue, discover, negotiate, and atomically settle private credit facilities with
**cryptographic confidentiality** enforced by the Canton Network.

---

## Why Lex Wins

| Feature | How We Do It |
|---|---|
| **Offer confidentiality** | Competing lender bids are Canton contracts with `observer borrower` only — other lenders are cryptographically blind |
| **Atomic settlement** | `AcceptOffer` archives proposal + offer and creates `ActiveLoan` + `CollateralLock` in one Canton transaction |
| **Privacy demo mode** | Frontend toggle shows each party's view of the same deal side-by-side |
| **Institutional UX** | Dark-mode Next.js dashboard with role-based navigation |

---

## Project Structure

```
lex/
├── daml/
│   ├── Lex/
│   │   ├── Types.daml          # Shared types & pure helpers
│   │   ├── Utils.daml          # Schedule generation
│   │   ├── Operator.daml       # Marketplace governance + party profiles
│   │   ├── Collateral.daml     # Tokenised collateral lock
│   │   ├── ActiveLoan.daml     # Live loan + repayment lifecycle
│   │   ├── LoanOffer.daml      # Confidential lender offers
│   │   └── LoanProposal.daml   # Borrower proposals + atomic settlement
│   └── Test/
│       ├── Setup.daml          # Reusable fixtures
│       └── LoanLifecycle.daml  # 6 end-to-end test scenarios
├── frontend/                   # Next.js 14 (App Router) — see Section 3
├── canton/
│   └── canton.conf             # In-memory Canton node
├── scripts/
│   ├── start-canton.sh
│   ├── bootstrap.canton
│   ├── deploy.sh
│   └── init-ledger.sh
└── daml.yaml
```

---

## Privacy Architecture

```
                    ┌──────────────────┐
                    │  LoanProposal    │
                    │  sig: Borrower   │
                    │  obs: Operator   │
                    │       Lender1 ←──┼─── invited via AddAuthorizedLender
                    │       Lender2 ←──┘
                    └──────────────────┘
                            │
               ┌────────────┴────────────┐
               ▼                         ▼
    ┌──────────────────┐      ┌──────────────────┐
    │  LoanOffer       │      │  LoanOffer       │
    │  sig: Lender1    │      │  sig: Lender2    │
    │  obs: Borrower   │      │  obs: Borrower   │
    │                  │      │                  │
    │  rate: 4.25%  ◄──┼──┐  │  rate: 4.50%  ◄──┼──┐
    │  (Lender2 blind) │  │  │  (Lender1 blind) │  │
    └──────────────────┘  │  └──────────────────┘  │
                          │                         │
                    Canton enforces visibility — no side-channel possible
```

### Atomic Settlement Transaction Graph

```
Borrower exercises AcceptOffer(offerCid=Lender1Offer)
├── Archive LoanProposal          [borrower authority]
├── Exercise LoanOffer.SettleOffer [lender1 authority via signatory]
├── Create ActiveLoan              [signatories: borrower + lender1 ✓]
└── Create CollateralLock          [signatories: borrower + lender1 ✓]
```

All four ledger operations commit atomically — or none do.

---

## Quick Start

### Prerequisites

- Daml SDK 2.9.4: `curl -sSL https://get.daml.com/ | sh -s 2.9.4`
- Java 17+
- Node.js 20+ / bun

### 1 — Build & Test Contracts

```bash
cd lex
daml build
daml test --files daml/Test/LoanLifecycle.daml
```

Expected output:
```
Test.LoanLifecycle:test_fullLoanLifecycle        ... ok
Test.LoanLifecycle:test_privacyEnforcement       ... ok
Test.LoanLifecycle:test_offerWithdrawal          ... ok
Test.LoanLifecycle:test_proposalCancellation     ... ok
Test.LoanLifecycle:test_loanDefault              ... ok
Test.LoanLifecycle:test_unauthorizedActions      ... ok
```

### 2 — Start Canton

```bash
chmod +x scripts/*.sh
./scripts/start-canton.sh
```

### 3 — Deploy Contracts

```bash
./scripts/deploy.sh
```

### 4 — Start Frontend

```bash
cd frontend
bun install
bun dev
```

Open http://localhost:3000

---

## Demo Script (3-minute pitch)

### 0:00 – Hook
> "Every private credit deal leaks information. When AlphaBank and BetaFund both
> bid on the same loan, today they fax offers to a broker. With Lex, cryptography
> enforces what NDAs merely promise."

### 0:30 – Create Proposal (as Borrower / AcmeCorp)
1. Select **AcmeCorp** in the party selector
2. Click **New Proposal** → fill GBP 5M, 36 months, collateral details
3. Invite **AlphaBank** and **BetaFund** only
4. Show the proposal card — GammaCapital is not listed

### 1:00 – Submit Competing Offers
1. Switch to **AlphaBank** → see the proposal → submit offer at **4.25 %**
2. Switch to **BetaFund** → see the proposal → submit offer at **4.50 %**
3. **Privacy demo**: switch to AlphaBank → show "Offers" tab → **BetaFund's offer is invisible**
4. Switch to BetaFund → confirm AlphaBank's offer is invisible

### 1:45 – Atomic Settlement
1. Switch to **AcmeCorp** → see both offers (only the borrower has full information)
2. Accept **AlphaBank** (better rate)
3. In Canton explorer / activity log, show the **single atomic transaction** that:
   - Archived LoanProposal
   - Archived AlphaBank's offer
   - Created ActiveLoan
   - Created CollateralLock
4. BetaFund's offer still shows as pending — borrower can reject it

### 2:15 – Active Loan Dashboard
1. Show repayment schedule table
2. Borrower makes first quarterly payment
3. Show RepaymentRecord on the ledger

### 2:45 – Closing
> "Lex brings institutional private credit on-chain without sacrificing the
> confidentiality that makes these markets function. Canton's sub-transaction
> privacy model is the only blockchain capable of this. Thank you."

---

## Daml Contract Reference

### LoanProposal
| Field | Type | Description |
|---|---|---|
| `borrower` | Party | Signatory — creates and controls the proposal |
| `operator` | Party | Observer — platform governance |
| `authorizedLenders` | [Party] | Observers — only invited lenders see this |
| `terms` | LoanTerms | Principal, rate (bps), term, covenants |
| `collateralValue` | Decimal | Indicative collateral valuation |
| `proposalRef` | Text | Human-readable reference e.g. LEX-2024-001 |

Key choices: `AddAuthorizedLender`, `RemoveAuthorizedLender`, `AcceptOffer`, `CancelProposal`

### LoanOffer (Confidential)
| Field | Privacy |
|---|---|
| `lender` | Signatory |
| `borrower` | Observer (sole counterparty) |
| `offeredRateBps` | Invisible to all other lenders |

### ActiveLoan
Created atomically by `AcceptOffer`. Both borrower and lender are signatories — neither can act unilaterally.

### CollateralLock
Created in the same atomic transaction as ActiveLoan. Released by lender upon full repayment; liquidated on default.

---

## Extending with Daml Finance

The collateral and settlement modules are designed to slot into Daml Finance:

- `CollateralLock` → extend `daml-finance:Daml.Finance.Interface.Holding.Holding`
- `ActiveLoan` → use `daml-finance:Daml.Finance.Interface.Instrument.Base.Instrument`
- `AcceptOffer` settlement → replace with `daml-finance:Daml.Finance.Settlement.Batch`

See comments in `Collateral.daml` and `ActiveLoan.daml` for extension points.

---

## Team

Built for the **Encode Club Canton Hackathon 2024** — Track 1: Private DeFi.
