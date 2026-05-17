export const BATCH_STATUS = {
  UPLOADED: 'uploaded',
  VALIDATED: 'validated',
  CALCULATED: 'calculated',
  FX_LOCKED: 'fx_locked',
  APPROVED: 'approved',
  EXPORTED: 'exported',
} as const;

export const ORACLE_MODE = {
  LIVE: 'live',
  MANUAL: 'manual',
} as const;

export const ORACLE_STATUS = {
  VALID: 'valid',
  MISSING_RATE: 'missing_rate',
  INVALID_RATE: 'invalid_rate',
  MISSING_TIMESTAMP: 'missing_timestamp',
  MISSING_SOURCE: 'missing_source',
  STALE: 'stale',
  OUT_OF_RANGE: 'out_of_range',
  PROVIDER_ERROR: 'provider_error',
} as const;

export const ORACLE_ROUTES = {
  CURRENT: 'oracle/current',
  LOCK_BATCH: 'batches/:batchId/oracle/lock',
  OVERRIDE_BATCH: 'batches/:batchId/oracle/override',
  BATCH_CONTEXT: 'batches/:batchId/oracle',
} as const;

export const ORACLE_ENV = {
  PROVIDER_URL: 'PAYOUT_ORACLE_PROVIDER_URL',
  PROVIDER_ID: 'PAYOUT_ORACLE_PROVIDER_ID',
  RATE_PATH: 'PAYOUT_ORACLE_RATE_PATH',
  TIMESTAMP_PATH: 'PAYOUT_ORACLE_TIMESTAMP_PATH',
  SOURCE_PATH: 'PAYOUT_ORACLE_SOURCE_PATH',
  FRESHNESS_MINUTES: 'PAYOUT_ORACLE_FRESHNESS_MINUTES',
  MIN_RATE: 'PAYOUT_ORACLE_MIN_RATE',
  MAX_RATE: 'PAYOUT_ORACLE_MAX_RATE',
} as const;

export const ORACLE_DEFAULTS = {
  PROVIDER_ID: 'external-http',
  RATE_PATH: 'rate',
  FRESHNESS_MINUTES: 60,
  MIN_RATE: 1,
  MAX_RATE: 20,
  MANUAL_SOURCE: 'manual',
} as const;

export const IMMUTABLE_ORACLE_BATCH_STATUSES = new Set<string>([
  BATCH_STATUS.APPROVED,
  BATCH_STATUS.EXPORTED,
]);
