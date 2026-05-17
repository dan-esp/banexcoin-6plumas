import { PrismaClient } from "@prisma/client"
import { createHash } from "node:crypto"

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
      participant(100245, "Mercado Alfa", "Gold", 0.02, "ready", [
        1750,
        2320,
        1480,
        990,
      ]),
      participant(100318, "Farmacia Central", "Silver", 0.015, "ready", [
        930,
        1120,
        760,
      ]),
      participant(100422, "Cafeteria Norte", "Bronze", 0.01, "watch", [
        420,
        510,
        680,
      ]),
      participant(100517, "Transporte Union", "Gold", 0.02, "watch", [
        3900,
        1280,
        860,
      ]),
    ],
    nonQualifying: [
      participant(100741, "Kiosko Sur", "None", 0, "ready", [160, 210]),
    ],
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
      participant(100245, "Mercado Alfa", "Silver", 0.015, "ready", [
        890,
        1320,
        1220,
      ]),
      participant(100633, "Boutique Andina", "Gold", 0.02, "ready", [
        2410,
        1590,
        980,
      ]),
      participant(100741, "Kiosko Sur", "Bronze", 0.01, "ready", [
        510,
        640,
      ]),
    ],
    nonQualifying: [
      participant(100422, "Cafeteria Norte", "None", 0, "ready", [180, 220]),
    ],
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
    oracleReason:
      "Local seed includes blocked rows to test approval and export gates.",
    exported: false,
    participants: [
      participant(100318, "Farmacia Central", "Silver", 0.015, "watch", [
        870,
        1430,
        620,
      ]),
      participant(100517, "Transporte Union", "Gold", 0.02, "blocked", [
        5400,
        450,
      ]),
      participant(100633, "Boutique Andina", "Silver", 0.015, "ready", [
        1210,
        760,
      ]),
    ],
    nonQualifying: [
      participant(100741, "Kiosko Sur", "None", 0, "ready", [240]),
    ],
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
  return new Date(
    Date.UTC(batch.year, batch.month - 1, Math.min(26, 3 + index), 14, 30),
  )
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
  const totalBs = round(
    participant.transactions.reduce((sum, value) => sum + value, 0),
    2,
  )
  const totalUsdt = round(totalBs / oracleRate, 6)
  const cashbackBs = round(totalBs * participant.rate, 2)
  const cashbackUsdt = round(cashbackBs / oracleRate, 6)

  return { totalBs, totalUsdt, cashbackBs, cashbackUsdt }
}

function exportCsvFor(batchId: string, batch: SeedBatch) {
  const referencePrefix = `REINTEGRA-${periodLabel(batch.year, batch.month)}`
  const rows = batch.participants
    .map((participant) => {
      const totals = totalsFor(participant, batch.oracleRate)
      return {
        receiverAccountId: String(participant.accountNumber),
        receiverAccountName: participant.alias,
        asset: "USDT",
        amountUsdt: totals.cashbackUsdt.toFixed(6),
        concept: `BanexReintegra ${batch.period}`,
        reference: `${referencePrefix}-${participant.accountNumber}`,
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
    checksum: createHash("sha256").update(csv).digest("hex"),
    exportedAccountsCount: rows.length,
    exportedTotalUsdt: rows
      .reduce((sum, row) => sum + Number(row.amountUsdt), 0)
      .toFixed(6),
    exportReferencePrefix: referencePrefix,
    exportFilename: `banextransfer-${periodLabel(batch.year, batch.month)}-${batchId}.csv`,
  }
}

function reportFor(batch: SeedBatch) {
  const results = batch.participants.map((participant) => {
    const totals = totalsFor(participant, batch.oracleRate)

    return {
      accountId: participant.accountNumber,
      username: participant.alias,
      totalBob: totals.totalBs,
      tierName: participant.tier,
      rate: participant.rate,
      cashbackBob: totals.cashbackBs,
      cashbackUsdt: totals.cashbackUsdt,
      transactionCount: participant.transactions.length,
      manualReviewTransactions: participant.transactions.filter(
        (value) => value >= 5000,
      ).length,
    }
  })

  const rowsProcessed = allParticipants(batch).reduce(
    (sum, participant) => sum + participant.transactions.length,
    0,
  )

  return {
    period: batch.period,
    calculatedAt: new Date(
      Date.UTC(batch.year, batch.month - 1, 28, 20, 15),
    ).toISOString(),
    audit: {
      totalRowsFromStore: rowsProcessed + batch.blockedRows,
      rowsAfterTripleFilter: rowsProcessed + batch.blockedRows,
      rowsDiscardedByValidation: batch.blockedRows,
      duplicatesDropped: batch.warningRows > 0 ? 1 : 0,
      rowsProcessed,
      manualReviewTransactions: results.reduce(
        (sum, result) => sum + result.manualReviewTransactions,
        0,
      ),
    },
    warnings:
      batch.warningRows > 0
        ? [
            `${batch.period}: ${batch.warningRows} local seed rows require review but remain calculable.`,
          ]
        : [],
    errors:
      batch.blockedRows > 0
        ? [
            `${batch.period}: ${batch.blockedRows} local seed rows are blocked by validation.`,
          ]
        : [],
    totalUsersAnalyzed: allParticipants(batch).length,
    usersQualifyingForCashback: batch.participants.length,
    usersNotQualifying: batch.nonQualifying.length,
    results,
    banexTransferLines: results.map((result) => ({
      accountId: result.accountId,
      username: result.username,
      cashbackUsdt: result.cashbackUsdt,
    })),
  }
}

async function upsertUsers() {
  for (const account of seedAccounts) {
    const existing = await prisma.user.findUnique({
      where: { account_number: account.accountNumber },
    })

    if (existing) {
      await prisma.user.update({
        where: { account_number: account.accountNumber },
        data: {
          alias: account.alias,
        },
      })
    } else {
      await prisma.user.create({
        data: {
          account_number: account.accountNumber,
          alias: account.alias,
        },
      })
    }
  }
}

async function seedPublicBatch(batch: SeedBatch) {
  const now = new Date()
  const report = reportFor(batch)
  const totalConsumptionBs = allParticipants(batch).reduce(
    (sum, participant) => sum + totalsFor(participant, batch.oracleRate).totalBs,
    0,
  )
  const totalConsumptionUsdt = allParticipants(batch).reduce(
    (sum, participant) =>
      sum + totalsFor(participant, batch.oracleRate).totalUsdt,
    0,
  )
  const totalCashbackBs = batch.participants.reduce(
    (sum, participant) =>
      sum + totalsFor(participant, batch.oracleRate).cashbackBs,
    0,
  )
  const totalCashbackUsdt = batch.participants.reduce(
    (sum, participant) =>
      sum + totalsFor(participant, batch.oracleRate).cashbackUsdt,
    0,
  )
  const approvedAt = batch.approvedBy
    ? new Date(Date.UTC(batch.year, batch.month - 1, 29, 18, 0))
    : null
  const exportedAt = batch.exported
    ? new Date(Date.UTC(batch.year, batch.month - 1, 30, 15, 0))
    : null
  const cashbackRunData = {
    status: "published",
    validation_status: batch.validationStatus,
    total_users: allParticipants(batch).length,
    total_transactions: report.audit.rowsProcessed,
    valid_rows: report.audit.rowsProcessed,
    warning_rows: batch.warningRows,
    blocked_rows: batch.blockedRows,
    total_consumption_bs: round(totalConsumptionBs, 2),
    total_consumption_usdt: round(totalConsumptionUsdt, 6),
    total_cashback_bs: round(totalCashbackBs, 2),
    total_cashback_usdt: round(totalCashbackUsdt, 6),
    payout_oracle_rate: batch.oracleRate,
    payout_oracle_source: batch.oracleSource,
    payout_oracle_fetched_at: new Date(
      Date.UTC(batch.year, batch.month - 1, 28, 19, 45),
    ),
    payout_oracle_mode: batch.oracleMode,
    payout_oracle_status: batch.oracleStatus,
    payout_oracle_reason: batch.oracleReason,
    approved_by: batch.approvedBy,
    approved_at: approvedAt,
    exported_at: exportedAt,
    export_ready:
      batch.lifecycleStatus === "approved" ||
      batch.lifecycleStatus === "exported",
  }

  const existingRun = await prisma.cashbackRun.findUnique({
    where: {
      year_month: {
        year: batch.year,
        month: batch.month,
      },
    },
  })

  const cashbackRun = existingRun
    ? await prisma.cashbackRun.update({
        where: { id: existingRun.id },
        data: cashbackRunData,
      })
    : await prisma.cashbackRun.create({
        data: {
          year: batch.year,
          month: batch.month,
          ...cashbackRunData,
        },
      })

  for (const participant of allParticipants(batch)) {
    const totals = totalsFor(participant, batch.oracleRate)
    const aggregationData = {
      cashback_run_id: cashbackRun.id,
      account_number: participant.accountNumber,
      alias: participant.alias,
      year: batch.year,
      month: batch.month,
      total_bs: totals.totalBs,
      total_usdt: totals.totalUsdt,
      tx_count: participant.transactions.length,
      tier: participant.tier,
      cashback_rate: participant.rate,
      cashback_percentage: participant.rate,
      cashback_bs: totals.cashbackBs,
      cashback_usdt: totals.cashbackUsdt,
      historical_effective_rate: batch.oracleRate,
      payout_oracle_rate: batch.oracleRate,
      review_state: participant.reviewState,
    }
    const existingAggregation = await prisma.monthlyAggregation.findUnique({
      where: {
        account_number_year_month: {
          account_number: participant.accountNumber,
          year: batch.year,
          month: batch.month,
        },
      },
    })

    if (existingAggregation) {
      await prisma.monthlyAggregation.update({
        where: { id: existingAggregation.id },
        data: aggregationData,
      })
    } else {
      await prisma.monthlyAggregation.create({ data: aggregationData })
    }

    for (const [index, amountBs] of participant.transactions.entries()) {
      const transactionId = txIdFor(batch, participant.accountNumber, index)
      const isAnomaly =
        batch.anomalies.includes(participant.accountNumber) &&
        amountBs === Math.max(...participant.transactions)

      const transactionData = {
        cashback_run_id: cashbackRun.id,
        import_run_id: cashbackRun.id,
        account_number: participant.accountNumber,
        alias: participant.alias,
        cotizacion_number: quoteIdFor(batch, participant.accountNumber, index),
        fecha_creacion: createdAtFor(batch, index),
        monto_bs: amountBs,
        monto_usdt: round(amountBs / batch.oracleRate, 6),
        tipo_cambio: batch.oracleRate,
        comision: round(amountBs / batch.oracleRate * 0.002, 6),
        is_anomaly: isAnomaly,
        anomaly_score: isAnomaly ? -0.31 : round(0.07 + index * 0.015, 3),
        validation_status:
          participant.reviewState === "blocked" ? "blocked" : "valid",
        validation_message:
          participant.reviewState === "blocked"
            ? "Local seed blocked row for export gate testing."
            : null,
      }
      const existingTransaction = await prisma.transaction.findUnique({
        where: { transaction_id: transactionId },
      })

      if (existingTransaction) {
        await prisma.transaction.update({
          where: { transaction_id: transactionId },
          data: transactionData,
        })
      } else {
        await prisma.transaction.create({
          data: {
            transaction_id: transactionId,
            ...transactionData,
          },
        })
      }
    }
  }

  await prisma.disbursement.deleteMany({
    where: { cashback_run_id: cashbackRun.id },
  })

  if (
    batch.lifecycleStatus === "approved" ||
    batch.lifecycleStatus === "exported"
  ) {
    await prisma.disbursement.createMany({
      data: batch.participants.map((participant) => {
        const totals = totalsFor(participant, batch.oracleRate)
        const referencePrefix = `REINTEGRA-${periodLabel(batch.year, batch.month)}`

        return {
          cashback_run_id: cashbackRun.id,
          account_number: participant.accountNumber,
          alias: participant.alias,
          tier: participant.tier,
          cashback_usdt: totals.cashbackUsdt,
          status: batch.exported ? "exported" : "draft",
          export_reference: `${referencePrefix}-${participant.accountNumber}`,
          generated_at: batch.exported ? exportedAt : now,
        }
      }),
    })
  }

  await seedAnomalies(batch, cashbackRun.id)
  await seedPrivateExportDocs(batch, cashbackRun.id, report)

  return cashbackRun.id
}

async function seedAnomalies(batch: SeedBatch, batchId: string) {
  for (const accountNumber of batch.anomalies) {
    const participant = allParticipants(batch).find(
      (item) => item.accountNumber === accountNumber,
    )
    if (!participant) continue

    const amountBs = Math.max(...participant.transactions)
    const transactionIndex = participant.transactions.indexOf(amountBs)
    const anomalyId = `LOCAL-${periodLabel(batch.year, batch.month)}-${accountNumber}`
    const detectedAt = new Date(
      Date.UTC(batch.year, batch.month - 1, 28, 21, 0),
    )

    const anomalyData = {
      batchId,
      quoteId: quoteIdFor(batch, accountNumber, transactionIndex),
      transactionId: txIdFor(batch, accountNumber, transactionIndex),
      accountId: accountNumber,
      username: participant.alias,
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
    }
    const existingAnomaly = await prisma.anomaly.findUnique({
      where: { anomalyId },
    })

    if (existingAnomaly) {
      await prisma.anomaly.update({
        where: { anomalyId },
        data: anomalyData,
      })
    } else {
      await prisma.anomaly.create({
        data: {
          anomalyId,
          ...anomalyData,
        },
      })
    }
  }
}

async function seedPrivateExportDocs(
  batch: SeedBatch,
  batchId: string,
  report: ReturnType<typeof reportFor>,
) {
  const generatedAt = new Date(
    Date.UTC(batch.year, batch.month - 1, 28, 20, 20),
  ).toISOString()
  const approval = batch.approvedBy
    ? {
        approvedAt: new Date(
          Date.UTC(batch.year, batch.month - 1, 29, 18, 0),
        ).toISOString(),
        approvedBy: batch.approvedBy,
        totalUsersAnalyzed: report.totalUsersAnalyzed,
        usersQualifyingForCashback: report.usersQualifyingForCashback,
        totalCashbackUsdt: report.banexTransferLines
          .reduce((sum, line) => sum + line.cashbackUsdt, 0)
          .toFixed(6),
      }
    : undefined
  const exportMetadata =
    batch.exported
      ? {
          exportedAt: new Date(
            Date.UTC(batch.year, batch.month - 1, 30, 15, 0),
          ).toISOString(),
          exportedBy: batch.approvedBy ?? "local.seed@banexcoin.test",
          exportFormat: "banextransfer_csv",
          ...exportCsvFor(batchId, batch),
        }
      : undefined

  await prisma.$runCommandRaw({
    delete: "qr_transactions",
    deletes: [{ q: { batchId }, limit: 0 }],
  })
  await prisma.$runCommandRaw({
    update: "batches",
    updates: [
      {
        q: { batchId },
        u: {
          $set: {
            batchId,
            filename: `local-seed-${periodLabel(batch.year, batch.month)}.csv`,
            batchName: batch.period,
            savedAt: generatedAt,
            status:
              batch.lifecycleStatus === "exported"
                ? "EXPORTED"
                : batch.lifecycleStatus === "approved"
                  ? "APPROVED"
                  : "CALCULATED",
            rowsLoaded: report.audit.totalRowsFromStore,
            skipped: report.audit.rowsDiscardedByValidation,
            mapperErrors: [],
            oracle: {
              rate: batch.oracleRate,
              source: batch.oracleSource,
              fetchedAt: new Date(
                Date.UTC(batch.year, batch.month - 1, 28, 19, 45),
              ).toISOString(),
              mode: batch.oracleMode,
              status: batch.oracleStatus,
              usedFallback: batch.oracleStatus === "stale_fallback",
              fallbackReason: batch.oracleReason,
            },
            approval,
            exportMetadata,
          },
        },
        upsert: true,
      },
    ],
  })
  await prisma.$runCommandRaw({
    update: "cashback_results",
    updates: [
      {
        q: { batchId },
        u: {
          $set: {
            batchId,
            batchName: batch.period,
            calculatedAt: report.calculatedAt,
            audit: report.audit,
            warnings: report.warnings,
            pipelineErrors: report.errors,
            totalUsersAnalyzed: report.totalUsersAnalyzed,
            usersQualifyingForCashback: report.usersQualifyingForCashback,
            usersNotQualifying: report.usersNotQualifying,
            results: report.results,
            banexTransferLines: report.banexTransferLines,
          },
        },
        upsert: true,
      },
    ],
  })
  await prisma.$runCommandRaw({
    insert: "qr_transactions",
    documents: allParticipants(batch).flatMap((participant) =>
      participant.transactions.map((amountBs, index) => ({
        batchId,
        quoteId: quoteIdFor(batch, participant.accountNumber, index),
        createdAt: createdAtFor(batch, index).toISOString(),
        status: "Completed",
        side: "Sell",
        username: participant.alias,
        accountId: participant.accountNumber,
        amountUsdt: round(amountBs / batch.oracleRate, 6),
        amountBob: amountBs,
        currency: "BOB",
        fxRate: batch.oracleRate,
        commission: round(amountBs / batch.oracleRate * 0.002, 6),
        updatedAt: createdAtFor(batch, index + 1).toISOString(),
        transactionId: txIdFor(batch, participant.accountNumber, index),
        serviceType: "S-001",
        oms: "Banexcoin Bolivia",
      })),
    ),
  })
}

async function main() {
  console.log("Seeding local BanexReintegra data...")
  await upsertUsers()

  for (const batch of batches) {
    const batchId = await seedPublicBatch(batch)
    console.log(`Seeded ${batch.period}: ${batchId}`)
  }

  console.log("Local seed completed.")
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
