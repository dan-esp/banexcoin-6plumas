import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type QrTransactionDocument = HydratedDocument<QrTransaction>;

@Schema({ collection: 'qr_transactions', timestamps: false })
export class QrTransaction {
  @Prop({ required: true, index: true })
  batchId: string;

  @Prop({ required: true })
  quoteId: number;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  side: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  accountId: number;

  @Prop({ required: true })
  amountUsdt: number;

  @Prop({ required: true })
  amountBob: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true })
  fxRate: number;

  @Prop({ required: true })
  commission: number;

  @Prop({ required: true })
  updatedAt: Date;

  @Prop({ required: true })
  transactionId: string;

  @Prop({ required: true })
  serviceType: string;

  @Prop({ required: true })
  oms: string;
}

export const QrTransactionSchema = SchemaFactory.createForClass(QrTransaction);
