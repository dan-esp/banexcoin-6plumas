import { PrismaClient } from "@prisma/client"
import { createHash, randomUUID } from "node:crypto"

process.env.MONGODB_URI ??=
  "mongodb://localhost:27017/banexcoin?replicaSet=rs0&directConnection=true"

const prisma = new PrismaClient()

type SeedLifecycleStatus = "approved" | "exported" | "under_review"

type SeedAccount = {
  accountNumber: number
  alias: string
}

type SeedParticipant = SeedAccount & {
  tier: string
  rate: number
  reviewState: "ready" | "watch" | "blocked"
  transactions: number[]
}

type SeedBatch = {
  period: string
  year: number
  month: number
  lifecycleStatus: SeedLifecycleStatus
  validationStatus: "clean" | "warnings" | "blocked"
  warningRows: number
  blockedRows: number
  oracleRate: number
  oracleSource: string
  oracleMode: "manual_override" | "provider"
  oracleStatus: "locked" | "stale_fallback"
  oracleReason?: string
  approvedBy?: string
  exported: boolean
  participants: SeedParticipant[]
  nonQualifying: SeedParticipant[]
  anomalies: number[]
}

const seedAccounts: SeedAccount[] = [
  { accountNumber: 100245, alias: "Mercado Alfa" },
  { accountNumber: 100318, alias: "Farmacia Central" },
  { accountNumber: 100422, alias: "Cafeteria Norte" },
  { accountNumber: 100517, alias: "Transporte Union" },
  { accountNumber: 100633, alias: "Boutique Andina" },
  { accountNumber: 100741, alias: "Kiosko Sur" },
]

void seedAccounts

const batches: SeedBatch[] = [
  {
    period: "May 2026",
    year: 2026,
    month: 5,
    lifecycleStatus: "approved",
    validationStatus: "clean",
    warningRows: 2,
    blockedRows: 0,
    oracleRate: 13.5,
    oracleSource: "local-seed/manual-treasury-rate",
    oracleMode: "manual_override",
    oracleStatus: "locked",
    oracleReason: "Local seed rate for UI and BanexTransfer export testing.",
    approvedBy: "local.finance@banexcoin.test",
    exported: false,
    participants: [
      participant(100245, "Mercado Alfa", "Gold", 0.02, "ready", [1750, 2320, 1480, 990]),
      participant(100318, "Farmacia Central", "Silver", 0.015, "ready", [930, 1120, 760]),
      participant(100422, "Cafeteria Norte", "Bronze", 0.01, "watch", [420, 510, 680]),
      participant(100517, "Transporte Union", "Gold", 0.02, "watch", [3900, 1280, 860]),
    ],
    nonQualifying: [participant(100741, "Kiosko Sur", "None", 0, "ready", [160, 210])],
    anomalies: [100517],
  },
  {
    period: "April 2026",
    year: 2026,
    month: 4,
    lifecycleStatus: "exported",
    validationStatus: "clean",
    warningRows: 0,
    blockedRows: 0,
    oracleRate: 13.44,
    oracleSource: "local-seed/provider-snapshot",
    oracleMode: "provider",
    oracleStatus: "locked",
    approvedBy: "local.finance@banexcoin.test",
    exported: true,
    participants: [
      participant(100245, "Mercado Alfa", "Silver", 0.015, "ready", [890, 1320, 1220]),
      participant(100633, "Boutique Andina", "Gold", 0.02, "ready", [2410, 1590, 980]),
      participant(100741, "Kiosko Sur", "Bronze", 0.01, "ready", [510, 640]),
    ],
    nonQualifying: [participant(100422, "Cafeteria Norte", "None", 0, "ready", [180, 220])],
    anomalies: [],
  },
  {
    period: "March 2026",
    year: 2026,
    month: 3,
    lifecycleStatus: "under_review",
    validationStatus: "blocked",
    warningRows: 4,
    blockedRows: 2,
    oracleRate: 13.58,
    oracleSource: "local-seed/provider-stale-fallback",
    oracleMode: "provider",
    oracleStatus: "stale_fallback",
    oracleReason: "Local seed includes blocked rows to test approval and export gates.",
    exported: false,
    participants: [
      participant(100318, "Farmacia Central", "Silver", 0.015, "watch", [870, 1430, 620]),
      participant(100517, "Transporte Union", "Gold", 0.02, "blocked", [5400, 450]),
      participant(100633, "Boutique Andina", "Silver", 0.015, "ready", [1210, 760]),
    ],
    nonQualifying: [participant(100741, "Kiosko Sur", "None", 0, "ready", [240])],
    anomalies: [100517],
  },
]

function participant(
  accountNumber: number,
  alias: string,
  tier: string,
  rate: number,
  reviewState: SeedParticipant["reviewState"],
  transactions: number[],
): SeedParticipant {
  return { accountNumber, alias, tier, rate, reviewState, transactions }
}

function round(value: number, decimals: number) {
  return Math.round(value * 10 ** decimals) / 10 ** decimals
}

function periodLabel(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`
}

function createdAtFor(batch: SeedBatch, index: number) {
  return new Date(Date.UTC(batch.year, batch.month - 1, Math.min(26, 3 + index), 14, 30))
}

function quoteIdFor(batch: SeedBatch, accountNumber: number, index: number) {
  return Number(
    `${String(batch.year).slice(2)}${String(batch.month).padStart(2, "0")}${String(
      accountNumber,
    ).slice(-3)}${String(index + 1).padStart(2, "0")}`,
  )
}

function txIdFor(batch: SeedBatch, accountNumber: number, index: number) {
  return `LOCAL-${batch.year}${String(batch.month).padStart(2, "0")}-${accountNumber}-${String(
    index + 1,
  ).padStart(3, "0")}`
}

function allParticipants(batch: SeedBatch) {
  return [...batch.participants, ...batch.nonQualifying]
}

function totalsFor(participant: SeedParticipant, oracleRate: number) {
  const totalBs = round(participant.transactions.reduce((sum, value) => sum + value, 0), 2)
  const totalUsdt = round(totalBs / oracleRate, 6)
  const cashbackBs = round(totalBs * participant.rate, 2)
  const cashbackUsdt = round(cashbackBs / oracleRate, 6)
  return { totalBs, totalUsdt, cashbackBs, cashbackUsdt }
}

function exportCsvFor(batchId: string, batch: SeedBatch) {
  const referencePrefix = `REINTEGRA-${periodLabel(batch.year, batch.month)}`
  const rows = batch.participants
    .map((p) => {
      const totals = totalsFor(p, batch.oracleRate)
      return {
        receiverAccountId: String(p.accountNumber),
        receiverAccountName: p.alias,
        asset: "USDT",
        amountUsdt: totals.cashbackUsdt.toFixed(6),
        concept: `BanexReintegra ${batch.period}`,
        reference: `${referencePrefix}-${p.accountNumber}`,
        periodMonth: periodLabel(batch.year, batch.month),
      }
    })
    .filter((row) => Number(row.amountUsdt) > 0)

  const header = [
    "receiverAccountId",
    "receiverAccountName",
    "asset",
    "amountUsdt",
    "concept",
    "reference",
    "periodMonth",
  ] as const

  const csv = `${[
    header.join(","),
    ...rows.map((row) => header.map((key) => row[key]).join(",")),
  ].join("\n")}\n`

  return {
    exportChecksum: createHash("sha256").update(csv).digest("hex"),
    exportedAccountsCount: rows.length,
    exportedTotalUsdt: rows.reduce((sum, row) => sum + Number(row.amountUsdt), 0).toFixed(6),
    exportReferencePrefix: referencePrefix,
    exportFilename: `banextransfer-${periodLabel(batch.year, batch.month)}-${batchId}.csv`,
  }
}

function reportFor(batch: SeedBatch) {
  const results = batch.participants.map((p) => {
    const totals = totalsFor(p, batch.oracleRate)
    return {
      accountId: p.accountNumber,
      username: p.alias,
      totalBob: totals.totalBs,
      tierName: p.tier,
      rate: p.rate,
      cashbackBob: totals.cashbackBs,
      cashbackUsdt: totals.cashbackUsdt,
      transactionCount: p.transactions.length,
      manualReviewTransactions: p.transactions.filter((v) => v >= 5000).length,
    }
  })

  const rowsProcessed = allParticipants(batch).reduce(
    (sum, p) => sum + p.transactions.length,
    0,
  )

  return {
    period: batch.period,
    calculatedAt: new Date(Date.UTC(batch.year, batch.month - 1, 28, 20, 15)),
    audit: {
      totalRowsFromStore: rowsProcessed + batch.blockedRows,
      rowsAfterTripleFilter: rowsProcessed + batch.blockedRows,
      rowsDiscardedByValidation: batch.blockedRows,
      duplicatesDropped: batch.warningRows > 0 ? 1 : 0,
      rowsProcessed,
      manualReviewTransactions: results.reduce((s, r) => s + r.manualReviewTransactions, 0),
    },
    warnings:
      batch.warningRows > 0
        ? [`${batch.period}: ${batch.warningRows} local seed rows require review but remain calculable.`]
        : [],
    pipelineErrors:
      batch.blockedRows > 0
        ? [`${batch.period}: ${batch.blockedRows} local seed rows are blocked by validation.`]
        : [],
    totalUsersAnalyzed: allParticipants(batch).length,
    usersQualifyingForCashback: batch.participants.length,
    usersNotQualifying: batch.nonQualifying.length,
    results,
    banexTransferLines: results.map((r) => ({
      accountId: r.accountId,
      username: r.username,
      cashbackUsdt: r.cashbackUsdt,
    })),
  }
}

function statusFor(lifecycle: SeedLifecycleStatus): "calculated" | "approved" | "exported" {
  switch (lifecycle) {
    case "exported":
      return "exported"
    case "approved":
      return "approved"
    case "under_review":
    default:
      return "calculated"
  }
}

async function seedBatch(batch: SeedBatch) {
  const batchId = randomUUID()
  const report = reportFor(batch)
  const savedAt = new Date(Date.UTC(batch.year, batch.month - 1, 28, 19, 30))
  const oracleFetchedAt = new Date(Date.UTC(batch.year, batch.month - 1, 28, 19, 45))
  const approvedAt = batch.approvedBy
    ? new Date(Date.UTC(batch.year, batch.month - 1, 29, 18, 0))
    : undefined
  const exportedAt = batch.exported
    ? new Date(Date.UTC(batch.year, batch.month - 1, 30, 15, 0))
    : undefined

  const approval = batch.approvedBy
    ? {
        approvedAt: approvedAt!,
        approvedBy: batch.approvedBy,
        totalUsersAnalyzed: report.totalUsersAnalyzed,
        usersQualifyingForCashback: report.usersQualifyingForCashback,
        totalCashbackUsdt: report.banexTransferLines
          .reduce((sum, line) => sum + line.cashbackUsdt, 0)
          .toFixed(6),
      }
    : undefined

  const exportMetadata = batch.exported
    ? {
        exportedAt: exportedAt!,
        exportedBy: batch.approvedBy ?? "local.seed@banexcoin.test",
        exportFormat: "banextransfer_csv",
        ...exportCsvFor(batchId, batch),
      }
    : undefined

  await prisma.batch.create({
    data: {
      batchId,
      filename: `local-seed-${periodLabel(batch.year, batch.month)}.csv`,
      batchName: batch.period,
      savedAt,
      status: statusFor(batch.lifecycleStatus),
      rowsLoaded: report.audit.totalRowsFromStore,
      skipped: report.audit.rowsDiscardedByValidation,
      mapperErrors: [],
      oracle: {
        rate: batch.oracleRate,
        source: batch.oracleSource,
        fetchedAt: oracleFetchedAt.toISOString(),
        mode: batch.oracleMode,
        status: batch.oracleStatus,
        usedFallback: batch.oracleStatus === "stale_fallback",
        fallbackReason: batch.oracleReason ?? null,
      },
      payoutOracleRate: batch.oracleRate,
      payoutOracleSource: batch.oracleSource,
      payoutOracleFetchedAt: oracleFetchedAt,
      payoutOracleMode: batch.oracleMode,
      payoutOracleStatus: batch.oracleStatus,
      payoutOracleReason: batch.oracleReason ?? null,
      approval: approval ?? undefined,
      exportMetadata: exportMetadata ?? undefined,
    },
  })

  await prisma.cashbackResult.create({
    data: {
      batchId,
      batchName: batch.period,
      calculatedAt: report.calculatedAt,
      audit: report.audit,
      warnings: report.warnings,
      pipelineErrors: report.pipelineErrors,
      totalUsersAnalyzed: report.totalUsersAnalyzed,
      usersQualifyingForCashback: report.usersQualifyingForCashback,
      usersNotQualifying: report.usersNotQualifying,
      results: report.results,
      banexTransferLines: report.banexTransferLines,
    },
  })

  const txDocs = allParticipants(batch).flatMap((p) =>
    p.transactions.map((amountBs, index) => ({
      batchId,
      quoteId: quoteIdFor(batch, p.accountNumber, index),
      createdAt: createdAtFor(batch, index),
      status: p.reviewState === "blocked" ? "blocked" : "Completed",
      side: "Sell",
      username: p.alias,
      accountId: p.accountNumber,
      amountUsdt: round(amountBs / batch.oracleRate, 6),
      amountBob: amountBs,
      currency: "BOB",
      fxRate: batch.oracleRate,
      commission: round((amountBs / batch.oracleRate) * 0.002, 6),
      updatedAt: createdAtFor(batch, index + 1),
      transactionId: txIdFor(batch, p.accountNumber, index),
      serviceType: "S-001",
      oms: "Banexcoin Bolivia",
    })),
  )

  if (txDocs.length > 0) {
    await prisma.qrTransaction.createMany({ data: txDocs })
  }

  await seedAnomalies(batch, batchId)
  return batchId
}

async function seedAnomalies(batch: SeedBatch, batchId: string) {
  for (const accountNumber of batch.anomalies) {
    const p = allParticipants(batch).find((item) => item.accountNumber === accountNumber)
    if (!p) continue

    const amountBs = Math.max(...p.transactions)
    const transactionIndex = p.transactions.indexOf(amountBs)
    const anomalyId = `LOCAL-${periodLabel(batch.year, batch.month)}-${accountNumber}`
    const detectedAt = new Date(Date.UTC(batch.year, batch.month - 1, 28, 21, 0))

    await prisma.anomaly.upsert({
      where: { anomalyId },
      update: {
        batchId,
        quoteId: quoteIdFor(batch, accountNumber, transactionIndex),
        transactionId: txIdFor(batch, accountNumber, transactionIndex),
        accountId: accountNumber,
        username: p.alias,
        amountBob: amountBs,
        amountUsdt: round(amountBs / batch.oracleRate, 6),
        fxRate: batch.oracleRate,
        createdAt: createdAtFor(batch, transactionIndex),
        score: -0.31,
        isAnomaly: true,
        status: "open",
        detectedAt,
        dismissedAt: null,
        dismissedBy: null,
        dismissReason: null,
      },
      create: {
        anomalyId,
        batchId,
        quoteId: quoteIdFor(batch, accountNumber, transactionIndex),
        transactionId: txIdFor(batch, accountNumber, transactionIndex),
        accountId: accountNumber,
        username: p.alias,
        amountBob: amountBs,
        amountUsdt: round(amountBs / batch.oracleRate, 6),
        fxRate: batch.oracleRate,
        createdAt: createdAtFor(batch, transactionIndex),
        score: -0.31,
        isAnomaly: true,
        status: "open",
        detectedAt,
      },
    })
  }
}

const SEED_FILENAME_PREFIX = "local-seed-"

async function hasExistingSeed(): Promise<boolean> {
  const existing = await prisma.batch.count({
    where: { filename: { startsWith: SEED_FILENAME_PREFIX } },
  })
  return existing > 0
}

async function main() {
  const force = process.env.SEED_FORCE === "true"

  if (!force && (await hasExistingSeed())) {
    console.log("Seed already present; skipping. Pass SEED_FORCE=true to reseed.")
    return
  }

  if (force) {
    console.log("SEED_FORCE=true — wiping existing seed before reseeding...")
    await prisma.anomaly.deleteMany({
      where: { anomalyId: { startsWith: "LOCAL-" } },
    })
    const localBatches = await prisma.batch.findMany({
      where: { filename: { startsWith: SEED_FILENAME_PREFIX } },
      select: { batchId: true },
    })
    const ids = localBatches
      .map((b) => b.batchId)
      .filter((v): v is string => Boolean(v))
    if (ids.length > 0) {
      await prisma.qrTransaction.deleteMany({ where: { batchId: { in: ids } } })
      await prisma.cashbackResult.deleteMany({ where: { batchId: { in: ids } } })
      await prisma.batch.deleteMany({ where: { batchId: { in: ids } } })
    }
  }

  console.log("Seeding BanexReintegra fixtures...")
  for (const batch of batches) {
    const batchId = await seedBatch(batch)
    console.log(`Seeded ${batch.period}: ${batchId}`)
  }
  console.log("Seed completed.")
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
