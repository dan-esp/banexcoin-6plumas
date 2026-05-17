import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import type {
  IBatchRepository,
  BatchApprovalSnapshot,
  BatchExportMetadata,
  BatchExportRecord,
  BatchSavePayload
} from '../interfaces/batch-repository.interface.js';
import { Batch, BatchDocument } from '../schemas/batch.schema.js';
import {
  QrTransaction,
  QrTransactionDocument,
} from '../schemas/qr-transaction.schema.js';
import {
  CashbackResult,
  CashbackResultDocument,
} from '../schemas/cashback-result.schema.js';
import { BATCH_STATUS } from '../../oracle/oracle.constants.js';

const APPROVED_STATUS = BATCH_STATUS.APPROVED;
const EXPORTED_STATUS = BATCH_STATUS.EXPORTED;

function toBatchOracleDocument(
  ctx: BatchSavePayload['oracleContext'],
): Batch['oracle'] {
  let fetchedAtIso: string;
  if (ctx.fetchedAt instanceof Date) {
    fetchedAtIso = ctx.fetchedAt.toISOString();
  } else if (typeof ctx.fetchedAt === 'string') {
    fetchedAtIso = ctx.fetchedAt;
  } else {
    fetchedAtIso = new Date().toISOString();
  }

  return {
    rate: ctx.rate ?? 0,
    source: ctx.source ?? '',
    fetchedAt: fetchedAtIso,
    mode: ctx.mode,
    status: ctx.status,
    usedFallback: ctx.usedFallback,
    ...(ctx.fallbackReason !== undefined
      ? { fallbackReason: ctx.fallbackReason }
      : {}),
  };
}

function toBatchOracleDocument(
  ctx: BatchSavePayload['oracleContext'],
): Batch['oracle'] {
  let fetchedAtIso: string;
  if (ctx.fetchedAt instanceof Date) {
    fetchedAtIso = ctx.fetchedAt.toISOString();
  } else if (typeof ctx.fetchedAt === 'string') {
    fetchedAtIso = ctx.fetchedAt;
  } else {
    fetchedAtIso = new Date().toISOString();
  }

  return {
    rate: ctx.rate ?? 0,
    source: ctx.source ?? '',
    fetchedAt: fetchedAtIso,
    mode: ctx.mode,
    status: ctx.status,
    usedFallback: ctx.usedFallback,
    ...(ctx.fallbackReason !== undefined
      ? { fallbackReason: ctx.fallbackReason }
      : {}),
  };
}

@Injectable()
export class MongoBatchRepository implements IBatchRepository {
  constructor(
    @InjectModel(Batch.name) private readonly batchModel: Model<BatchDocument>,
    @InjectModel(QrTransaction.name)
    private readonly txModel: Model<QrTransactionDocument>,
    @InjectModel(CashbackResult.name)
    private readonly resultModel: Model<CashbackResultDocument>,
  ) {}

  async save(payload: BatchSavePayload): Promise<string> {
    const batchId = uuidv4();
    const savedAt = new Date();

    await this.batchModel.create({
      batchId,
      filename: payload.filename,
      batchName: payload.batchName,
      savedAt,
      status: 'calculated',
      rowsLoaded: payload.rowsLoaded,
      skipped: payload.skipped,
      mapperErrors: payload.mapperErrors as unknown as Record<string, unknown>[],
      oracle: toBatchOracleDocument(payload.oracleContext),
    });

    if (payload.rows.length > 0) {
      const txDocs = payload.rows.map((row) => ({ batchId, ...row }));
      await this.txModel.insertMany(txDocs, { ordered: false });
    }

    const report = payload.report;
    await this.resultModel.create({
      batchId,
      batchName: payload.batchName,
      calculatedAt: report.calculatedAt,
      audit: report.audit,
      warnings: report.warnings,
      pipelineErrors: report.errors,
      totalUsersAnalyzed: report.totalUsersAnalyzed,
      usersQualifyingForCashback: report.usersQualifyingForCashback,
      usersNotQualifying: report.usersNotQualifying,
      results: report.results as unknown as Record<string, unknown>[],
      banexTransferLines: report.banexTransferLines as unknown as Record<
        string,
        unknown
      >[],
    });

    return batchId;
  }

  async findForExport(batchId: string): Promise<BatchExportRecord | null> {
    const [batch, result] = await Promise.all([
      this.batchModel.findOne({ batchId }).lean().exec(),
      this.resultModel.findOne({ batchId }).lean().exec(),
    ]);

    if (!batch || !result) {
      return null;
    }

    if (!batch.batchId) {
      return null;
    }

    return {
      batchId: batch.batchId,
      batchName: batch.batchName ?? '',
      status: batch.status,
      report: {
        period: result.batchName,
        calculatedAt: result.calculatedAt,
        audit: result.audit,
        warnings: result.warnings,
        errors: result.pipelineErrors,
        totalUsersAnalyzed: result.totalUsersAnalyzed,
        usersQualifyingForCashback: result.usersQualifyingForCashback,
        usersNotQualifying: result.usersNotQualifying,
        results: result.results,
        banexTransferLines: result.banexTransferLines,
      } as unknown as BatchExportRecord['report'],
      approval: batch.approval,
      exportMetadata: batch.exportMetadata,
    };
  }

  async approve(
    batchId: string,
    approval: BatchApprovalSnapshot,
  ): Promise<BatchExportRecord> {
    await this.batchModel
      .updateOne({ batchId }, { $set: { status: APPROVED_STATUS, approval } })
      .exec();

    return this.findForExportOrThrow(batchId);
  }

  async markExported(
    batchId: string,
    metadata: BatchExportMetadata,
  ): Promise<BatchExportRecord> {
    await this.batchModel
      .updateOne(
        { batchId },
        { $set: { status: EXPORTED_STATUS, exportMetadata: metadata } },
      )
      .exec();

    return this.findForExportOrThrow(batchId);
  }

  private async findForExportOrThrow(
    batchId: string,
  ): Promise<BatchExportRecord> {
    const batch = await this.findForExport(batchId);

    if (!batch) {
      throw new Error(`Batch ${batchId} not found`);
    }

    return batch;
  }
}
