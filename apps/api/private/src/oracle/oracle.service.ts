import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Batch } from '../batches/schemas/batch.schema';
import {
  BATCH_STATUS,
  IMMUTABLE_ORACLE_BATCH_STATUSES,
  ORACLE_MODE,
  ORACLE_STATUS,
} from './oracle.constants';
import { getOracleConfig } from './oracle.config';
import { OverrideOracleRateDto } from './dto/override-oracle-rate.dto';
import {
  CurrentOracleRateResponseDto,
  LockedOracleContextResponseDto,
  toCurrentOracleRateResponseDto,
  toLockedOracleContextResponseDto,
} from './dto/oracle-rate-response.dto';
import { OracleValidator } from './oracle.validator';
import { BatchOracleRepository } from './repositories/batch-oracle.repository';
import { HttpJsonOracleProvider } from './strategies/http-json-oracle.provider';
import { ManualOracleProvider } from './strategies/manual-oracle.provider';
import { OracleRateContext } from './oracle.types';

@Injectable()
export class OracleService {
  constructor(
    private readonly batchOracleRepository: BatchOracleRepository,
    private readonly httpJsonOracleProvider: HttpJsonOracleProvider,
    private readonly manualOracleProvider: ManualOracleProvider,
    private readonly oracleValidator: OracleValidator,
  ) {}

  async getCurrentRate(): Promise<CurrentOracleRateResponseDto> {
    return toCurrentOracleRateResponseDto(await this.getValidLiveContext());
  }

  async lockBatchRate(
    batchId: string,
  ): Promise<LockedOracleContextResponseDto> {
    const batch = await this.batchOracleRepository.findByIdOrThrow(batchId);
    this.assertBatchCanChangeOracle(batch);
    this.assertBatchHasNoLockedOracle(batch);

    const context = {
      ...(await this.getValidLiveContext()),
      lockedAt: new Date(),
    };

    this.batchOracleRepository.applyOracleContext(
      batch,
      context,
      BATCH_STATUS.FX_LOCKED,
    );
    await this.batchOracleRepository.save(batch);

    return toLockedOracleContextResponseDto(this.toOracleContext(batch));
  }

  async overrideBatchRate(
    batchId: string,
    dto: OverrideOracleRateDto,
  ): Promise<LockedOracleContextResponseDto> {
    const batch = await this.batchOracleRepository.findByIdOrThrow(batchId);
    this.assertBatchCanChangeOracle(batch);
    this.assertBatchHasNoLockedOracle(batch);

    const config = getOracleConfig();
    const context = {
      ...(await this.manualOracleProvider.getRate(config, dto)),
      lockedAt: new Date(),
    };
    const status = this.oracleValidator.validate(context, config);
    const validatedContext = { ...context, status };

    this.assertValidContext(
      validatedContext,
      'Invalid manual payout oracle override',
    );

    this.batchOracleRepository.applyOracleContext(
      batch,
      validatedContext,
      BATCH_STATUS.FX_LOCKED,
    );
    await this.batchOracleRepository.save(batch);

    return toLockedOracleContextResponseDto(this.toOracleContext(batch));
  }

  async getBatchOracleContext(
    batchId: string,
  ): Promise<LockedOracleContextResponseDto> {
    const batch = await this.batchOracleRepository.findByIdOrThrow(batchId);
    return toLockedOracleContextResponseDto(this.toOracleContext(batch));
  }

  private async getValidLiveContext(): Promise<OracleRateContext> {
    const config = getOracleConfig();
    const context = await this.httpJsonOracleProvider.getRate(config);
    const status = this.oracleValidator.validate(context, config);
    const validatedContext = { ...context, status };

    this.assertValidContext(
      validatedContext,
      'Invalid payout oracle provider payload',
    );

    return validatedContext;
  }

  private assertBatchCanChangeOracle(batch: Batch): void {
    if (IMMUTABLE_ORACLE_BATCH_STATUSES.has(batch.status)) {
      throw new ConflictException(
        this.toErrorPayload(
          'Approved or exported batches cannot change payout oracle context',
          ORACLE_STATUS.PROVIDER_ERROR,
          { batchStatus: batch.status },
        ),
      );
    }
  }

  private assertBatchHasNoLockedOracle(batch: Batch): void {
    if (batch.payoutOracleLockedAt) {
      throw new ConflictException(
        this.toErrorPayload(
          'Batch already has a locked payout oracle context',
          batch.payoutOracleStatus ?? ORACLE_STATUS.PROVIDER_ERROR,
          { lockedAt: batch.payoutOracleLockedAt },
        ),
      );
    }
  }

  private assertValidContext(
    context: OracleRateContext,
    message: string,
  ): void {
    if (context.status !== ORACLE_STATUS.VALID) {
      throw new BadRequestException(
        this.toErrorPayload(message, context.status, {
          source: context.source,
          fetchedAt: context.fetchedAt,
        }),
      );
    }
  }

  private toOracleContext(batch: Batch): OracleRateContext {
    return {
      rate: batch.payoutOracleRate,
      source: batch.payoutOracleSource,
      fetchedAt: batch.payoutOracleFetchedAt,
      mode: batch.payoutOracleMode ?? ORACLE_MODE.LIVE,
      status: batch.payoutOracleStatus ?? ORACLE_STATUS.MISSING_RATE,
      reason: batch.payoutOracleReason,
      operatorId: batch.payoutOracleOperatorId,
      lockedAt: batch.payoutOracleLockedAt,
    };
  }

  private toErrorPayload(
    message: string,
    status: string,
    details?: Record<string, unknown>,
  ) {
    return {
      message,
      status,
      ...(details ? { details } : {}),
    };
  }
}
