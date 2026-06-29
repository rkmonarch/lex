import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()

const OPERATOR = "Operator"

async function main() {
  console.log("🌱 Seeding database...")

  await db.repaymentEntry.deleteMany()
  await db.collateralLock.deleteMany()
  await db.activeLoan.deleteMany()
  await db.offer.deleteMany()
  await db.proposal.deleteMany()

  // ── Proposals ─────────────────────────────────────────────────────────────
  await db.proposal.create({
    data: {
      proposalRef:          "LEX-2026-001",
      borrower:             "AcmeCorp",
      operator:             OPERATOR,
      authorizedLenders:    ["AlphaBank", "BetaFund"],
      purpose:              "Growth capex: new manufacturing facility in Leeds",
      principal:            5_000_000,
      currency:             "GBP",
      interestRateBps:      450,
      termMonths:           36,
      repaymentType:        "Bullet",
      covenants:            ["Debt/EBITDA < 3.5x", "Interest cover > 3.0x"],
      collateralDescription:"First-ranking charge over Acme HQ, 1 Tech Lane, London EC1A 1AA",
      collateralValue:      8_500_000,
      expiresAt:            new Date("2026-09-15"),
      status:               "OPEN",
    },
  })

  await db.proposal.create({
    data: {
      proposalRef:          "LEX-2026-002",
      borrower:             "AcmeCorp",
      operator:             OPERATOR,
      authorizedLenders:    ["BetaFund", "GammaCapital"],
      purpose:              "Working capital: seasonal inventory build",
      principal:            2_500_000,
      currency:             "EUR",
      interestRateBps:      375,
      termMonths:           24,
      repaymentType:        "Monthly",
      covenants:            ["Current ratio > 1.5x"],
      collateralDescription:"Assignment of trade receivables (EUR 3.5M book)",
      collateralValue:      3_500_000,
      expiresAt:            new Date("2026-08-28"),
      status:               "OPEN",
    },
  })

  await db.proposal.create({
    data: {
      proposalRef:          "LEX-2026-003",
      borrower:             "NovaTech",
      operator:             OPERATOR,
      authorizedLenders:    ["AlphaBank", "GammaCapital"],
      purpose:              "Series B bridge: pre-IPO growth financing",
      principal:            10_000_000,
      currency:             "USD",
      interestRateBps:      520,
      termMonths:           18,
      repaymentType:        "Bullet",
      covenants:            ["Minimum cash runway 12 months", "No new equity dilution > 20%"],
      collateralDescription:"Pledge of intellectual property portfolio (58 patents)",
      collateralValue:      22_000_000,
      expiresAt:            new Date("2026-10-31"),
      status:               "OPEN",
    },
  })

  await db.proposal.create({
    data: {
      proposalRef:          "LEX-2026-004",
      borrower:             "NovaTech",
      operator:             OPERATOR,
      authorizedLenders:    ["AlphaBank", "BetaFund"],
      purpose:              "Trade finance: export receivables (Asia-Pacific)",
      principal:            1_800_000,
      currency:             "SGD",
      interestRateBps:      610,
      termMonths:           12,
      repaymentType:        "Quarterly",
      covenants:            [],
      collateralDescription:"Export receivables assignment (SGD 2.4M)",
      collateralValue:      2_400_000,
      expiresAt:            new Date("2026-02-10"),
      status:               "FUNDED",
    },
  })

  // ── Offers ────────────────────────────────────────────────────────────────
  await db.offer.create({
    data: {
      proposalRef:       "LEX-2026-001",
      lender:            "AlphaBank",
      borrower:          "AcmeCorp",
      operator:          OPERATOR,
      offeredPrincipal:  5_000_000,
      currency:          "GBP",
      offeredRateBps:    425,
      conditions:        ["Full draw within 30 days", "Quarterly covenant testing"],
      specialConditions: ["Board observer seat required"],
      validUntilDate:    new Date("2026-08-31"),
      status:            "PENDING",
    },
  })

  await db.offer.create({
    data: {
      proposalRef:       "LEX-2026-001",
      lender:            "BetaFund",
      borrower:          "AcmeCorp",
      operator:          OPERATOR,
      offeredPrincipal:  5_000_000,
      currency:          "GBP",
      offeredRateBps:    440,
      conditions:        ["Security to be perfected within 14 days"],
      specialConditions: [],
      validUntilDate:    new Date("2026-08-31"),
      status:            "PENDING",
    },
  })

  await db.offer.create({
    data: {
      proposalRef:       "LEX-2026-002",
      lender:            "BetaFund",
      borrower:          "AcmeCorp",
      operator:          OPERATOR,
      offeredPrincipal:  2_500_000,
      currency:          "EUR",
      offeredRateBps:    360,
      conditions:        ["Monthly receivables report"],
      specialConditions: [],
      validUntilDate:    new Date("2026-08-20"),
      status:            "PENDING",
    },
  })

  await db.offer.create({
    data: {
      proposalRef:       "LEX-2026-003",
      lender:            "AlphaBank",
      borrower:          "NovaTech",
      operator:          OPERATOR,
      offeredPrincipal:  10_000_000,
      currency:          "USD",
      offeredRateBps:    500,
      conditions:        ["IP assignment to be registered"],
      specialConditions: ["Conversion rights at IPO"],
      validUntilDate:    new Date("2026-10-15"),
      status:            "PENDING",
    },
  })

  await db.offer.create({
    data: {
      proposalRef:       "LEX-2026-004",
      lender:            "AlphaBank",
      borrower:          "NovaTech",
      operator:          OPERATOR,
      offeredPrincipal:  1_800_000,
      currency:          "SGD",
      offeredRateBps:    610,
      conditions:        ["Quarterly export report"],
      specialConditions: [],
      validUntilDate:    new Date("2026-02-05"),
      status:            "ACCEPTED",
    },
  })

  // ── Active loan + collateral + repayment schedule ─────────────────────────
  const loan = await db.activeLoan.create({
    data: {
      loanRef:         "LEX-LN-001",
      proposalRef:     "LEX-2026-004",
      borrower:        "NovaTech",
      lender:          "AlphaBank",
      operator:        OPERATOR,
      principal:       1_800_000,
      currency:        "SGD",
      interestRateBps: 610,
      startDate:       new Date("2026-01-15"),
      maturityDate:    new Date("2027-01-15"),
      amountRepaid:    110_700,
      conditions:      ["Quarterly export report"],
      status:          "ACTIVE",
    },
  })

  const schedule = [
    { dueDate: "2026-04-15", principal: 450_000, interest: 27_450, sortOrder: 0, isPaid: true,  paidAmount: 477_450 },
    { dueDate: "2026-07-15", principal: 450_000, interest: 27_450, sortOrder: 1, isPaid: false, paidAmount: 0 },
    { dueDate: "2026-10-15", principal: 450_000, interest: 27_450, sortOrder: 2, isPaid: false, paidAmount: 0 },
    { dueDate: "2027-01-15", principal: 450_000, interest: 27_450, sortOrder: 3, isPaid: false, paidAmount: 0 },
  ]
  for (const s of schedule) {
    await db.repaymentEntry.create({
      data: {
        loanRef:    loan.loanRef,
        sortOrder:  s.sortOrder,
        dueDate:    new Date(s.dueDate),
        principal:  s.principal,
        interest:   s.interest,
        totalDue:   s.principal + s.interest,
        paidAmount: s.paidAmount,
        isPaid:     s.isPaid,
      },
    })
  }

  await db.collateralLock.create({
    data: {
      loanRef:          loan.loanRef,
      borrower:         "NovaTech",
      lender:           "AlphaBank",
      operator:         OPERATOR,
      assetDescription: "Export receivables assignment (SGD 2.4M)",
      assetValue:       2_400_000,
      currency:         "SGD",
      maturityDate:     new Date("2027-01-15"),
      status:           "LOCKED",
    },
  })

  console.log("✅ Seed complete")
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())
