import type {
  BATCH_STATUS,
  ORACLE_MODE,
  ORACLE_STATUS,
} from './oracle.constants';

export type ValueOf<T> = T[keyof T];

export type OracleMode = ValueOf<typeof ORACLE_MODE>;

export type OracleStatus = ValueOf<typeof ORACLE_STATUS>;

export type BatchStatus = ValueOf<typeof BATCH_STATUS>;

export interface OracleConfig {
  providerUrl?: string;
  providerId: string;
  ratePath: string;
  timestampPath?: string;
  sourcePath?: string;
  freshnessMinutes: number;
  minRate: number;
  maxRate: number;
  fallbackRate: number;
}

/** Resolved oracle result used by batch processing — rate is always a concrete number. */
export interface BatchOracleResult {
  rate: number;
  source: string;
  fetchedAt: Date;
  mode: OracleMode;
  status: OracleStatus;
  usedFallback: boolean;
  fallbackReason?: string;
}

export interface OracleRateContext {
  rate?: number;
  source?: string;
  fetchedAt?: Date;
  mode: OracleMode;
  status: OracleStatus;
  reason?: string;
  operatorId?: string;
  lockedAt?: Date;
}

export interface ProviderRateResult {
  rate?: number;
  source?: string;
  fetchedAt?: Date;
  raw: unknown;
}

export interface ManualOracleInput {
  rate: number | string;
  operatorId: string;
  reason: string;
}
