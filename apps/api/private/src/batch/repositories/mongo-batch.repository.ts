import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import type {
  BatchSavePayload,
  IBatchRepository,
} from '../interfaces/batch-repository.interface.js';
import { Batch, BatchDocument } from '../schemas/batch.schema.js';
import { QrTransaction, QrTransactionDocument } from '../schemas/qr-transaction.schema.js';
import { CashbackResult, CashbackResultDocument } from '../schemas/cashback-result.schema.js';

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
    @InjectModel(QrTransaction.name) private readonly txModel: Model<QrTransactionDocument>,
    @InjectModel(CashbackResult.name) private readonly resultModel: Model<CashbackResultDocument>,
  ) {}

  async save(payload: BatchSavePayload): Promise<string> {
    const batchId = uuidv4();
    const savedAt = new Date();

    await this.batchModel.create({
      batchId,
      filename: payload.filename,
      batchName: payload.batchName,
      savedAt,
      status: 'CALCULATED',
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
      banexTransferLines: report.banexTransferLines as unknown as Record<string, unknown>[],
    });

    return batchId;
  }
}
