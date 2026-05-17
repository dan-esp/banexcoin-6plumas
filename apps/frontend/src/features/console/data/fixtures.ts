import type {
  PublicBatchDto,
  PublicDisbursementDto,
  PublicResultDto,
} from "./types";

export const fixtureBatch: PublicBatchDto = {
  id: "6650f9c6a1b2c3d4e5f60718",
  period: { year: 2026, month: 5, label: "2026-05" },
  status: "Under Review",
  validation: {
    status: "blocked",
    validRows: 3482,
    warningRows: 41,
    blockedRows: 27,
    exportBlocked: true,
  },
  totals: {
    users: 812,
    transactions: 3482,
    consumptionBs: 428950,
    consumptionUsdt: 61630.15,
    cashbackBs: 12796.83,
    cashbackUsdt: 1842.36,
  },
  payoutOracle: {
    rate: 6.946,
    source: "Treasury USDT/BOB desk",
    fetchedAt: "2026-05-16T14:35:00.000Z",
    mode: "live",
    status: "fresh",
    reason: null,
  },
  approval: {
    approved: false,
    approvedBy: null,
    approvedAt: null,
  },
  export: {
    ready: false,
    exportedAt: null,
  },
  createdAt: "2026-05-16T14:00:00.000Z",
};

export const fixtureResults: PublicResultDto[] = [
  {
    id: "result-1",
    accountNumber: 100245,
    alias: "Mercado Central SRL",
    totals: {
      consumedBs: 18350,
      consumedUsdt: 2638.82,
      qrCount: 146,
      historicalEffectiveRate: 6.954,
    },
    tier: { name: "Nivel 3", cashbackRate: 0.02 },
    payoutOracleRate: 6.946,
    cashback: { bs: 367, usdt: 52.84 },
    reviewState: "warning",
  },
  {
    id: "result-2",
    accountNumber: 100918,
    alias: "Farmacia Los Pinos",
    totals: {
      consumedBs: 9240,
      consumedUsdt: 1328.91,
      qrCount: 88,
      historicalEffectiveRate: 6.953,
    },
    tier: { name: "Nivel 3", cashbackRate: 0.02 },
    payoutOracleRate: 6.946,
    cashback: { bs: 184.8, usdt: 26.61 },
    reviewState: "ready",
  },
  {
    id: "result-3",
    accountNumber: 101074,
    alias: "Punto QR Norte",
    totals: {
      consumedBs: 4780,
      consumedUsdt: 687.31,
      qrCount: 53,
      historicalEffectiveRate: 6.955,
    },
    tier: { name: "Nivel 2", cashbackRate: 0.015 },
    payoutOracleRate: 6.946,
    cashback: { bs: 71.7, usdt: 10.32 },
    reviewState: "ready",
  },
  {
    id: "result-4",
    accountNumber: 102460,
    alias: "Comercio 6 de Agosto",
    totals: {
      consumedBs: 860,
      consumedUsdt: 123.67,
      qrCount: 19,
      historicalEffectiveRate: 6.955,
    },
    tier: { name: "Nivel 1", cashbackRate: 0.01 },
    payoutOracleRate: 6.946,
    cashback: { bs: 8.6, usdt: 1.24 },
    reviewState: "blocked",
  },
];

export const fixtureDisbursements: PublicDisbursementDto[] = [
  {
    id: "pay-1",
    accountNumber: 100245,
    alias: "Mercado Central SRL",
    tier: "Nivel 3",
    cashbackUsdt: 52.84,
    status: "draft",
    exportReference: "BR-202605-100245",
  },
  {
    id: "pay-2",
    accountNumber: 100918,
    alias: "Farmacia Los Pinos",
    tier: "Nivel 3",
    cashbackUsdt: 26.61,
    status: "draft",
    exportReference: "BR-202605-100918",
  },
];
