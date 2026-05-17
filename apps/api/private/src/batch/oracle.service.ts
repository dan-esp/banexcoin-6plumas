import { Injectable, Logger } from '@nestjs/common';
import { getOracleConfig } from '../oracle/oracle.config.js';
import { ORACLE_MODE, ORACLE_STATUS } from '../oracle/oracle.constants.js';
import { readDotPath } from '../oracle/dot-path.js';
import { parseOracleRate } from '../oracle/utils/oracle-parsers.js';

export interface RealTimeRateResult {
  rate: number;
  source: string;
  fetchedAt: string;
  mode: string;
  status: string;
  usedFallback: boolean;
  fallbackReason?: string;
}

/**
 * Lightweight service for real-time USDT/BOB rate lookups.
 * Always resolves — never throws. Fallback chain:
 *   1. PAYOUT_ORACLE_PROVIDER_URL (external HTTP feed)
 *   2. ORACLE_FALLBACK_RATE env var (default 13.5)
 */
@Injectable()
export class BatchOracleService {
  private readonly logger = new Logger(BatchOracleService.name);

  async getCurrentRate(): Promise<RealTimeRateResult> {
    const config = getOracleConfig();

    if (!config.providerUrl) {
      this.logger.warn(
        `PAYOUT_ORACLE_PROVIDER_URL not configured; using ORACLE_FALLBACK_RATE: ${config.fallbackRate}`,
      );
      return this.fallback(config.fallbackRate, 'PAYOUT_ORACLE_PROVIDER_URL is not configured');
    }

    try {
      const response = await fetch(config.providerUrl, {
        headers: { accept: 'application/json' },
        signal: AbortSignal.timeout(5_000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const raw = (await response.json()) as unknown;
      const rate = parseOracleRate(readDotPath(raw, config.ratePath));

      if (rate === undefined || !Number.isFinite(rate) || rate <= 0) {
        throw new Error(`Invalid rate in response: ${JSON.stringify(rate)}`);
      }

      const sourceValue = config.sourcePath
        ? readDotPath(raw, config.sourcePath)
        : undefined;
      const source =
        typeof sourceValue === 'string' && sourceValue.trim()
          ? sourceValue
          : config.providerId;

      this.logger.log(`Real-time rate: ${rate} BOB/USDT from ${source}`);
      return {
        rate,
        source,
        fetchedAt: new Date().toISOString(),
        mode: ORACLE_MODE.LIVE,
        status: ORACLE_STATUS.VALID,
        usedFallback: false,
      };
    } catch (err: unknown) {
      const reason = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `Real-time oracle fetch failed (${reason}); using ORACLE_FALLBACK_RATE: ${config.fallbackRate}`,
      );
      return this.fallback(config.fallbackRate, reason);
    }
  }

  private fallback(rate: number, reason: string): RealTimeRateResult {
    return {
      rate,
      source: 'fixed-fallback',
      fetchedAt: new Date().toISOString(),
      mode: ORACLE_MODE.MANUAL,
      status: ORACLE_STATUS.VALID,
      usedFallback: true,
      fallbackReason: reason,
    };
  }
}
