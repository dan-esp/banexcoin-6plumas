import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Batch, BatchDocument } from '../../batches/schemas/batch.schema';
import type { BatchStatus, OracleRateContext } from '../oracle.types';

@Injectable()
export class BatchOracleRepository {
  constructor(
    @InjectModel(Batch.name) private readonly batchModel: Model<Batch>,
  ) {}

  async findByIdOrThrow(batchId: string): Promise<BatchDocument> {
    const batch = await this.batchModel.findById(batchId).exec();

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    return batch;
  }

  applyOracleContext(
    batch: BatchDocument,
    context: OracleRateContext,
    status: BatchStatus,
  ): void {
    batch.payoutOracleRate = context.rate;
    batch.payoutOracleSource = context.source;
    batch.payoutOracleFetchedAt = context.fetchedAt;
    batch.payoutOracleMode = context.mode;
    batch.payoutOracleStatus = context.status;
    batch.payoutOracleReason = context.reason;
    batch.payoutOracleOperatorId = context.operatorId;
    batch.payoutOracleLockedAt = context.lockedAt;
    batch.status = status;
  }

  async save(batch: BatchDocument): Promise<BatchDocument> {
    return batch.save();
  }
}
