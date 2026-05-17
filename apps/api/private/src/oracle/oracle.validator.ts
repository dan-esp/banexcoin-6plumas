import { Injectable } from '@nestjs/common';
import { ORACLE_STATUS } from './oracle.constants';
import type {
  OracleConfig,
  OracleRateContext,
  OracleStatus,
} from './oracle.types';

@Injectable()
export class OracleValidator {
  validate(
    context: OracleRateContext,
    config: OracleConfig,
    now: Date = new Date(),
  ): OracleStatus {
    if (context.rate === undefined) {
      return ORACLE_STATUS.MISSING_RATE;
    }

    if (!Number.isFinite(context.rate) || context.rate <= 0) {
      return ORACLE_STATUS.INVALID_RATE;
    }

    if (!context.fetchedAt || Number.isNaN(context.fetchedAt.getTime())) {
      return ORACLE_STATUS.MISSING_TIMESTAMP;
    }

    if (!context.source && !context.mode) {
      return ORACLE_STATUS.MISSING_SOURCE;
    }

    if (context.rate < config.minRate || context.rate > config.maxRate) {
      return ORACLE_STATUS.OUT_OF_RANGE;
    }

    const ageMs = now.getTime() - context.fetchedAt.getTime();
    const freshnessMs = config.freshnessMinutes * 60 * 1000;

    if (ageMs > freshnessMs) {
      return ORACLE_STATUS.STALE;
    }

    return ORACLE_STATUS.VALID;
  }
}
