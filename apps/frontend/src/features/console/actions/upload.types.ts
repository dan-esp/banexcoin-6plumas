export type IssueSeverity =
  | "CRITICAL"
  | "WARNING"
  | "DUPLICATE"
  | "FILTERED"
  | "MANUAL_REVIEW";

export type IssueCategory =
  | "PARSE_ERROR"
  | "BUSINESS_RULE"
  | "DUPLICATE"
  | "FILTER"
  | "CONSISTENCY";

export type IssueGroupDto = {
  severity: IssueSeverity;
  category: IssueCategory;
  field: string;
  count: number;
  description: string;
  affectedRows: number[];
  moreRowsExist: boolean;
};

export type ValidationSummaryDto = {
  totalRawRows: number;
  readyForProcessing: boolean;
  criticalIssues: number;
  warnings: number;
  duplicates: number;
  filteredRows: number;
  estimatedRowsAfterProcessing: number;
  manualReviewRows: number;
  manualReviewThreshold: number;
};

export type HeaderValidationDto = {
  valid: boolean;
  expectedCount: number;
  foundCount: number;
  missingHeaders: string[];
  extraHeaders: string[];
};

export type FilterBreakdownDto = {
  totalRawRows: number;
  failStatusFilter: number;
  failSideFilter: number;
  failCurrencyFilter: number;
  totalFilteredOut: number;
  duplicatesFound: number;
  estimatedRowsAfterProcessing: number;
};

export type ValidationReportDto = {
  fileName: string;
  fileFormat: string;
  validatedAt: string;
  summary: ValidationSummaryDto;
  insights: string[];
  headerValidation: HeaderValidationDto;
  filterBreakdown: FilterBreakdownDto;
  groupedIssues: IssueGroupDto[];
  totalIssueCount: number;
};

// ── Processing pipeline types (POST /processing/calculate) ────────────────────

export type ProcessingAuditDto = {
  totalRowsFromStore: number;
  rowsAfterTripleFilter: number;
  rowsDiscardedByValidation: number;
  duplicatesDropped: number;
  rowsProcessed: number;
  manualReviewTransactions: number;
};

export type UserCashbackResultDto = {
  accountId: number;
  username: string;
  totalBob: number;
  tierName: string;
  rate: number;
  cashbackBob: number;
  cashbackUsdt: number;
  transactionCount: number;
  manualReviewTransactions: number;
};

export type ProcessingReportDto = {
  period: string;
  calculatedAt: string;
  audit: ProcessingAuditDto;
  warnings: string[];
  errors: string[];
  totalUsersAnalyzed: number;
  usersQualifyingForCashback: number;
  usersNotQualifying: number;
  results: UserCashbackResultDto[];
};

// ── Action states ─────────────────────────────────────────────────────────────

export type ValidationActionState = {
  status: "idle" | "success" | "error";
  report?: ProcessingReportDto;
  error?: string;
};

export type ProcessActionState = {
  status: "idle" | "success" | "error";
  batchId?: string;
  period?: string;
  error?: string;
};
