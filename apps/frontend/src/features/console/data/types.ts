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

export type PublicTransactionDto = {
  id: string;
  transactionId: string;
  accountNumber: number;
  alias: string;
  createdAt: string;
  amounts: {
    bs: number;
    usdt: number;
    impliedRate: number;
    fee: number;
  };
  validation: {
    status: string;
    message: string | null;
  };
  anomaly: {
    flagged: boolean;
    score: number | null;
  };
};

export type PublicOracleContextDto = {
  batchId: string | null;
  period: {
    year: number;
    month: number;
    label: string;
  } | null;
  rate: number | null;
  source: string | null;
  fetchedAt: string | null;
  mode: string | null;
  status: string;
  reason: string | null;
  updatedAt: string | null;
};

export type PublicAccountDto = {
  accountNumber: number;
  alias: string;
  createdAt: string;
  updatedAt: string;
};

export type PublicAccountMonthDto = {
  id: string;
  accountNumber: number;
  alias: string;
  period: {
    year: number;
    month: number;
    label: string;
  };
  qrCount: number;
  consumedBs: number;
  consumedUsdt: number;
  tier: string;
  cashbackUsdt: number;
  reviewState: string;
};

export type ConsoleDataState = {
  batch: PublicBatchDto;
  results: PublicResultDto[];
  disbursements: PublicDisbursementDto[];
  anomalies: PublicAnomalyDto[];
  transactions: PublicTransactionDto[];
  oracle: PublicOracleContextDto | null;
  error: string | null;
};
