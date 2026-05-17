import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Anomaly, AnomalyDocument } from '../schemas/anomaly.schema.js';
import type {
  AnomalyRecord,
  DismissAnomalyInput,
  IAnomalyRepository,
} from '../interfaces/anomaly-repository.interface.js';

function toRecord(doc: AnomalyDocument): AnomalyRecord {
  return {
    anomalyId: doc.anomalyId,
    batchId: doc.batchId,
    quoteId: doc.quoteId,
    transactionId: doc.transactionId,
    accountId: doc.accountId,
    username: doc.username,
    amountBob: doc.amountBob,
    amountUsdt: doc.amountUsdt,
    fxRate: doc.fxRate,
    createdAt: doc.createdAt,
    score: doc.score,
    isAnomaly: doc.isAnomaly,
    status: doc.status,
    detectedAt: doc.detectedAt,
    dismissedAt: doc.dismissedAt,
    dismissedBy: doc.dismissedBy,
    dismissReason: doc.dismissReason,
  };
}

@Injectable()
export class MongoAnomalyRepository implements IAnomalyRepository {
  constructor(
    @InjectModel(Anomaly.name)
    private readonly model: Model<AnomalyDocument>,
  ) {}

  async saveMany(records: AnomalyRecord[]): Promise<void> {
    if (records.length === 0) return;
    await this.model.insertMany(records, { ordered: false });
  }

  async findByBatch(batchId: string): Promise<AnomalyRecord[]> {
    const docs = await this.model
      .find({ batchId })
      .sort({ score: 1 })
      .lean<AnomalyDocument[]>()
      .exec();
    return docs.map(toRecord);
  }

  async findOne(anomalyId: string): Promise<AnomalyRecord | null> {
    const doc = await this.model.findOne({ anomalyId }).exec();
    return doc ? toRecord(doc) : null;
  }

  async dismiss(
    anomalyId: string,
    input: DismissAnomalyInput,
  ): Promise<AnomalyRecord | null> {
    const doc = await this.model
      .findOneAndUpdate(
        { anomalyId },
        {
          $set: {
            status: 'dismissed',
            dismissedAt: new Date(),
            dismissedBy: input.dismissedBy,
            dismissReason: input.reason,
          },
        },
        { new: true },
      )
      .exec();
    return doc ? toRecord(doc) : null;
  }
}
