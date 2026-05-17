export type BatchStatus =
  | "Uploaded"
  | "Validated"
  | "Calculated"
  | "Under Review"
  | "Approved"
  | "Exported";

export type PublicBatchDto = {
  id: string;
  period: {
    year: number;
    month: number;
    label: string;
  };
  status: string;
  validation: {
    status: string;
    validRows: number | null;
    warningRows: number;
    blockedRows: number;
    exportBlocked: boolean;
  };
  totals: {
    users: number;
    transactions: number | null;
    consumptionBs: number | null;
    consumptionUsdt: number | null;
    cashbackBs: number | null;
    cashbackUsdt: number;
  };
  payoutOracle: {
    rate: number | null;
    source: string | null;
    fetchedAt: string | null;
    mode: string | null;
    status: string | null;
    reason: string | null;
  };
  approval: {
    approved: boolean;
    approvedBy: string | null;
    approvedAt: string | null;
  };
  export: {
    ready: boolean;
    exportedAt: string | null;
  };
  createdAt: string;
};

export type PublicResultDto = {
  id: string;
  accountNumber: number;
  alias: string;
  totals: {
    consumedBs: number;
    consumedUsdt: number;
    qrCount: number;
    historicalEffectiveRate: number | null;
  };
  tier: {
    name: string;
    cashbackRate: number;
  };
  payoutOracleRate: number | null;
  cashback: {
    bs: number;
    usdt: number;
  };
  reviewState: string;
};

export type PublicDisbursementDto = {
  id: string;
  accountNumber: number;
  alias: string;
  tier: string;
  cashbackUsdt: number;
  status: string;
  exportReference: string | null;
};

export type AnomalyReviewStatus = "open" | "dismissed";

export type PublicAnomalyDto = {
  id: string;
  anomalyId: string;
  batchId: string;
  transaction: {
    quoteId: number;
    transactionId: string;
    accountId: number;
    username: string;
    createdAt: string;
    amounts: {
      bs: number;
      usdt: number;
      fxRate: number;
    };
  };
  detection: {
    source: "ai-isolation-forest";
    score: number;
    isAnomaly: boolean;
    detectedAt: string;
  };
  review: {
    status: AnomalyReviewStatus;
    dismissedAt: string | null;
    dismissedBy: string | null;
    dismissReason: string | null;
  };
};

export type ConsoleDataSource = "api" | "fixture";

export type ConsoleDataState = {
  batch: PublicBatchDto;
  results: PublicResultDto[];
  disbursements: PublicDisbursementDto[];
  anomalies: PublicAnomalyDto[];
  source: ConsoleDataSource;
  error: string | null;
};
