import { Inject, Injectable } from '@nestjs/common';
import { EntityType } from '../common/enums/entity-type.enum.js';
import { QrPaymentRow } from '../common/interfaces/entity-rows.interface.js';
import { EtlService } from '../etl/etl.service.js';
import { EtlStore } from '../etl/store/etl-store.service.js';
import { ProcessingService } from '../processing/processing.service.js';
import { CalculateRequestDto } from '../processing/dto/calculate-request.dto.js';
import { TierLevelDto } from '../processing/dto/tier-level.dto.js';
import { OracleService } from '../oracle/oracle.service.js';
import { ORACLE_STATUS, ORACLE_MODE } from '../oracle/oracle.constants.js';
import type {
  IBatchRepository,
  BatchSavePayload,
} from './interfaces/batch-repository.interface.js';

export interface ProcessBatchDto {
  batchName: string;
  tiers: TierLevelDto[];
  minimumBob: number;
  outputFxRate?: number;
  manualReviewThreshold?: number;
}

export interface ProcessBatchResult {
  batchId: string;
  batchName: string;
  calculatedAt: Date;
  oracle: {
    rate: number;
    source: string;
    mode: string;
    usedFallback: boolean;
    fallbackReason?: string;
  };
  audit: Record<string, unknown>;
  warnings: string[];
  errors: string[];
  totalUsersAnalyzed: number;
  usersQualifyingForCashback: number;
  usersNotQualifying: number;
  results: unknown[];
  banexTransferLines: unknown[];
}

@Injectable()
export class BatchProcessService {
  constructor(
    private readonly etlService: EtlService,
    private readonly etlStore: EtlStore,
    private readonly processingService: ProcessingService,
    private readonly oracleService: OracleService,
    @Inject('BATCH_REPOSITORY')
    private readonly batchRepository: IBatchRepository,
  ) {}

  async process(
    file: Express.Multer.File,
    dto: ProcessBatchDto,
  ): Promise<ProcessBatchResult> {
    // Resolve payout FX rate using the integrated Oracle service
    const currentRateResponse = await this.oracleService.getCurrentRate();
    
    // Use manual override if provided, otherwise use current oracle rate
    const rate = dto.outputFxRate ?? currentRateResponse.rate!;
    const oracleCtx = {
      rate,
      source: dto.outputFxRate ? 'manual-override' : (currentRateResponse.source ?? 'oracle'),
      mode: dto.outputFxRate ? ORACLE_MODE.MANUAL : ORACLE_MODE.LIVE,
      usedFallback: currentRateResponse.status !== 'valid',
      fallbackReason: dto.outputFxRate ? undefined : currentRateResponse.status,
    };

    const uploadResult = await this.etlService.processUpload(
      file,
      EntityType.QR_PAYMENTS,
    );

    const rows = this.etlStore.get<QrPaymentRow>(EntityType.QR_PAYMENTS);

    const calcRequest: CalculateRequestDto = {
      period: dto.batchName,
      tiers: dto.tiers,
      minimumBob: dto.minimumBob,
      outputFxRate: oracleCtx.rate,
      manualReviewThreshold: dto.manualReviewThreshold,
    };

    const report = await this.processingService.calculate(calcRequest);

    const payload: BatchSavePayload = {
      filename: file.originalname,
      batchName: dto.batchName,
      rowsLoaded: uploadResult.rowsLoaded,
      skipped: uploadResult.skipped,
      mapperErrors: uploadResult.errors,
      rows,
      report,
      oracleContext: {
        rate: oracleCtx.rate,
        source: oracleCtx.source,
        fetchedAt: new Date(),
        mode: oracleCtx.mode,
        status: dto.outputFxRate ? ORACLE_STATUS.VALID : currentRateResponse.status,
        usedFallback: oracleCtx.usedFallback,
        fallbackReason: oracleCtx.fallbackReason,
      },
    };

    const batchId = await this.batchRepository.save(payload);

    return {
      batchId,
      batchName: dto.batchName,
      calculatedAt: report.calculatedAt,
      oracle: {
        rate: oracleCtx.rate,
        source: oracleCtx.source,
        mode: oracleCtx.mode,
        usedFallback: oracleCtx.usedFallback,
        fallbackReason: oracleCtx.fallbackReason,
      },
      audit: report.audit as unknown as Record<string, unknown>,
      warnings: report.warnings,
      errors: report.errors,
      totalUsersAnalyzed: report.totalUsersAnalyzed,
      usersQualifyingForCashback: report.usersQualifyingForCashback,
      usersNotQualifying: report.usersNotQualifying,
      results: report.results,
      banexTransferLines: report.banexTransferLines,
    };
  }
}
