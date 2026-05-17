import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AnomalyDocument = HydratedDocument<Anomaly>;

export type AnomalyStatus = 'open' | 'dismissed';

@Schema({ collection: 'anomalies', timestamps: false })
export class Anomaly {
  @Prop({ required: true, unique: true, index: true })
  anomalyId: string;

  @Prop({ required: true, index: true })
  batchId: string;

  @Prop({ required: true })
  quoteId: number;

  @Prop({ required: true, index: true })
  transactionId: string;

  @Prop({ required: true })
  accountId: number;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  amountBob: number;

  @Prop({ required: true })
  amountUsdt: number;

  @Prop({ required: true })
  fxRate: number;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  score: number;

  @Prop({ required: true })
  isAnomaly: boolean;

  @Prop({ required: true, index: true, default: 'open' })
  status: AnomalyStatus;

  @Prop({ required: true })
  detectedAt: Date;

  @Prop()
  dismissedAt?: Date;

  @Prop()
  dismissedBy?: string;

  @Prop()
  dismissReason?: string;
}

export const AnomalySchema = SchemaFactory.createForClass(Anomaly);
