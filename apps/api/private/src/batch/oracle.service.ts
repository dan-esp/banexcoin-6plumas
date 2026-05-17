import { Injectable, Logger } from '@nestjs/common';

export interface OracleResponse {
  rate: number;
  source: string;
  fetchedAt: string;
  mode: string;
  status: string;
}

export interface OracleContext {
  rate: number;
  source: string;
  fetchedAt: string;
  mode: string;
  status: string;
  usedFallback: boolean;
  fallbackReason?: string;
}

const ORACLE_URL =
  process.env.ORACLE_URL ?? 'http://localhost:4001/oracle/current';

/** Fixed fallback rate used when the oracle is unreachable and no override is provided. */
const ORACLE_FALLBACK_RATE = parseFloat(
  process.env.ORACLE_FALLBACK_RATE ?? '13.5',
);

@Injectable()
export class OracleService {
  private readonly logger = new Logger(OracleService.name);

  /**
   * Fetches the live USDT/BOB rate from the oracle endpoint.
   *
   * Fallback chain:
   *   1. Live oracle → ORACLE_URL
   *   2. manualOverride from request (outputFxRate field)
   *   3. ORACLE_FALLBACK_RATE env var (default 13.5)
   */
  async resolveRate(manualOverride?: number): Promise<OracleContext> {
    try {
      const response = await fetch(ORACLE_URL, {
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`Oracle responded with HTTP ${response.status}`);
      }

      const data = (await response.json()) as OracleResponse;

      if (data.status !== 'valid' || typeof data.rate !== 'number' || data.rate <= 0) {
        throw new Error(`Oracle returned invalid data: status=${data.status}, rate=${data.rate}`);
      }

      this.logger.log(
        `Oracle rate fetched: ${data.rate} BOB/USDT from ${data.source}`,
      );

      return {
        rate: data.rate,
        source: data.source,
        fetchedAt: data.fetchedAt,
        mode: data.mode,
        status: data.status,
        usedFallback: false,
      };
    } catch (err: unknown) {
      const reason = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Oracle fetch failed (${reason}). Applying fallback.`);

      if (manualOverride !== undefined && manualOverride > 0) {
        this.logger.log(`Using request-provided outputFxRate as fallback: ${manualOverride}`);
        return {
          rate: manualOverride,
          source: 'manual-override',
          fetchedAt: new Date().toISOString(),
          mode: 'manual',
          status: 'fallback',
          usedFallback: true,
          fallbackReason: reason,
        };
      }

      this.logger.log(`Using fixed fallback rate: ${ORACLE_FALLBACK_RATE}`);
      return {
        rate: ORACLE_FALLBACK_RATE,
        source: 'fixed-fallback',
        fetchedAt: new Date().toISOString(),
        mode: 'manual',
        status: 'fallback',
        usedFallback: true,
        fallbackReason: reason,
      };
    }
  }
}
