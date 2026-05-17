import { QrPaymentRow } from '../../common/interfaces/entity-rows.interface.js';
import { ValidatedTierConfig } from '../validators/config.validator.js';
import { UserCashbackResultDto } from '../dto/user-cashback-result.dto.js';

/** Intermediate aggregate built by AggregationStep, consumed by TierClassificationStep. */
export interface UserAggregate {
  accountId: number;
  username: string;
  totalBob: number;
  transactionCount: number;
  manualReviewTransactions: number;
  /** Weighted sum of fxRate values for computing average when outputFxRate is not provided. */
  fxRateWeightedSum: number;
}

/**
 * State bag passed through the pipeline chain.
 *
 * Each step receives this object, performs its logic, and returns an updated copy.
 * Steps must not mutate the incoming context — they return a new object.
 */
export interface PipelineContext {
  config: ValidatedTierConfig;

  /** Active rows at the current pipeline stage. Mutated by each filtering/dedup step. */
  rows: QrPaymentRow[];

  /** Non-fatal issues collected across all steps. Rows affected are kept. */
  warnings: string[];

  /** Critical validation messages. Affected rows were discarded. */
  criticalErrors: string[];

  audit: {
    totalInput: number;
    rowsAfterTripleFilter: number;
    rowsAfterValidation: number;
    duplicatesDropped: number;
    manualReviewCount: number;
  };

  /** Filled by AggregationStep. */
  userAggregates: UserAggregate[];

  /** Filled by CashbackCalculationStep. */
  userResults: UserCashbackResultDto[];
}

/** Returns a fresh context with zero-value audit fields. */
export function createInitialContext(config: ValidatedTierConfig): PipelineContext {
  return {
    config,
    rows: [],
    warnings: [],
    criticalErrors: [],
    audit: {
      totalInput: 0,
      rowsAfterTripleFilter: 0,
      rowsAfterValidation: 0,
      duplicatesDropped: 0,
      manualReviewCount: 0,
    },
    userAggregates: [],
    userResults: [],
  };
}
