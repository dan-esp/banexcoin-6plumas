import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { readDotPath } from '../dot-path';
import { ORACLE_MODE, ORACLE_STATUS } from '../oracle.constants';
import type { OracleConfig, OracleRateContext } from '../oracle.types';
import { parseOracleRate, parseOracleTimestamp } from '../utils/oracle-parsers';
import type { OracleProviderStrategy } from './oracle-provider.strategy';

@Injectable()
export class HttpJsonOracleProvider implements OracleProviderStrategy {
  async getRate(config: OracleConfig): Promise<OracleRateContext> {
    if (!config.providerUrl) {
      throw new ServiceUnavailableException({
        message: 'Payout oracle provider URL is not configured',
        status: ORACLE_STATUS.PROVIDER_ERROR,
        details: {
          env: 'PAYOUT_ORACLE_PROVIDER_URL',
        },
      });
    }

    const fetchedAt = new Date();
    let response: Response;

    try {
      response = await fetch(config.providerUrl, {
        headers: {
          accept: 'application/json',
        },
      });
    } catch (error) {
      throw new ServiceUnavailableException({
        message: 'Payout oracle provider is unreachable',
        status: ORACLE_STATUS.PROVIDER_ERROR,
        details: {
          cause: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }

    if (!response.ok) {
      throw new ServiceUnavailableException({
        message: `Payout oracle provider returned HTTP ${response.status}`,
        status: ORACLE_STATUS.PROVIDER_ERROR,
        details: {
          httpStatus: response.status,
        },
      });
    }

    const raw = (await response.json()) as unknown;
    const sourceValue = config.sourcePath
      ? readDotPath(raw, config.sourcePath)
      : undefined;

    return {
      rate: parseOracleRate(readDotPath(raw, config.ratePath)),
      source:
        typeof sourceValue === 'string' && sourceValue.trim()
          ? sourceValue
          : config.providerId,
      fetchedAt: parseOracleTimestamp(
        config.timestampPath
          ? readDotPath(raw, config.timestampPath)
          : undefined,
        fetchedAt,
      ),
      mode: ORACLE_MODE.LIVE,
      status: ORACLE_STATUS.VALID,
    };
  }
}
