import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ORACLE_DEFAULTS,
  ORACLE_MODE,
  ORACLE_STATUS,
} from '../oracle.constants';
import type {
  ManualOracleInput,
  OracleConfig,
  OracleRateContext,
} from '../oracle.types';
import { parseOracleRate } from '../utils/oracle-parsers';
import type { OracleProviderStrategy } from './oracle-provider.strategy';

@Injectable()
export class ManualOracleProvider implements OracleProviderStrategy<ManualOracleInput> {
  getRate(
    _config: OracleConfig,
    input: ManualOracleInput,
  ): Promise<OracleRateContext> {
    const reason = input.reason?.trim();
    const operatorId = input.operatorId?.trim();

    if (!reason) {
      throw new BadRequestException({
        message: 'Manual payout oracle override requires a reason',
        status: ORACLE_STATUS.MISSING_SOURCE,
      });
    }

    if (!operatorId) {
      throw new BadRequestException({
        message: 'Manual payout oracle override requires an operatorId',
        status: ORACLE_STATUS.MISSING_SOURCE,
      });
    }

    return Promise.resolve({
      rate: parseOracleRate(input.rate),
      source: ORACLE_DEFAULTS.MANUAL_SOURCE,
      fetchedAt: new Date(),
      mode: ORACLE_MODE.MANUAL,
      status: ORACLE_STATUS.VALID,
      reason,
      operatorId,
    });
  }
}
