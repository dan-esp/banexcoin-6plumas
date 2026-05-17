import { ORACLE_DEFAULTS, ORACLE_ENV } from './oracle.constants';
import { OracleConfig } from './oracle.types';

const parseNumberEnv = (name: string, fallback: number): number => {
  const value = process.env[name];

  if (value === undefined || value.trim() === '') {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const optionalEnv = (name: string): string | undefined => {
  const value = process.env[name]?.trim();
  return value === '' ? undefined : value;
};

export const getOracleConfig = (): OracleConfig => ({
  providerUrl: optionalEnv(ORACLE_ENV.PROVIDER_URL),
  providerId:
    process.env[ORACLE_ENV.PROVIDER_ID]?.trim() || ORACLE_DEFAULTS.PROVIDER_ID,
  ratePath:
    process.env[ORACLE_ENV.RATE_PATH]?.trim() || ORACLE_DEFAULTS.RATE_PATH,
  timestampPath: optionalEnv(ORACLE_ENV.TIMESTAMP_PATH),
  sourcePath: optionalEnv(ORACLE_ENV.SOURCE_PATH),
  freshnessMinutes: parseNumberEnv(
    ORACLE_ENV.FRESHNESS_MINUTES,
    ORACLE_DEFAULTS.FRESHNESS_MINUTES,
  ),
  minRate: parseNumberEnv(ORACLE_ENV.MIN_RATE, ORACLE_DEFAULTS.MIN_RATE),
  maxRate: parseNumberEnv(ORACLE_ENV.MAX_RATE, ORACLE_DEFAULTS.MAX_RATE),
  fallbackRate: parseNumberEnv(
    ORACLE_ENV.FALLBACK_RATE,
    ORACLE_DEFAULTS.FALLBACK_RATE,
  ),
});
