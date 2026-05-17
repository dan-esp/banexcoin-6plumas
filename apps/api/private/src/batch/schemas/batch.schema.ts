import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BatchDocument = HydratedDocument<Batch>;

export type BatchStatus =
  | 'UPLOADED'
  | 'VALIDATING'
  | 'VALIDATED'
  | 'CALCULATING'
  | 'CALCULATED'
  | 'FX_LOCKED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'EXPORTED'
  | 'FAILED';

@Schema({ collection: 'batches', timestamps: false })
export class Batch {
  @Prop({ required: true, unique: true, index: true })
  batchId: string;

  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  batchName: string;

  @Prop({ required: true })
  savedAt: Date;

  @Prop({ required: true })
  status: BatchStatus;

  @Prop({ required: true })
  rowsLoaded: number;

  @Prop({ required: true })
  skipped: number;

  @Prop({ type: [Object], default: [] })
  mapperErrors: Record<string, unknown>[];

  @Prop({ type: Object, required: true })
  oracle: {
    rate: number;
    source: string;
    fetchedAt: string;
    mode: string;
    status: string;
    usedFallback: boolean;
    fallbackReason?: string;
  };
}

export const BatchSchema = SchemaFactory.createForClass(Batch);
