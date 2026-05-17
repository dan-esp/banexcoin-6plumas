import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CashbackResultDocument = HydratedDocument<CashbackResult>;

@Schema({ collection: 'cashback_results', timestamps: false })
export class CashbackResult {
  @Prop({ required: true, unique: true, index: true })
  batchId: string;

  @Prop({ required: true })
  batchName: string;

  @Prop({ required: true })
  calculatedAt: Date;

  @Prop({ type: Object, required: true })
  audit: {
    totalRowsFromStore: number;
    rowsAfterTripleFilter: number;
    rowsDiscardedByValidation: number;
    duplicatesDropped: number;
    rowsProcessed: number;
    manualReviewTransactions: number;
  };

  @Prop({ type: [String], default: [] })
  warnings: string[];

  @Prop({ type: [String], default: [] })
  pipelineErrors: string[];

  @Prop({ required: true })
  totalUsersAnalyzed: number;

  @Prop({ required: true })
  usersQualifyingForCashback: number;

  @Prop({ required: true })
  usersNotQualifying: number;

  @Prop({ type: [Object], default: [] })
  results: Record<string, unknown>[];

  @Prop({ type: [Object], default: [] })
  banexTransferLines: Record<string, unknown>[];
}

export const CashbackResultSchema = SchemaFactory.createForClass(CashbackResult);
