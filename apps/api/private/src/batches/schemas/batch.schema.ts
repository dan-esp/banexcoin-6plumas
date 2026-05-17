import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  BATCH_STATUS,
  ORACLE_MODE,
  ORACLE_STATUS,
} from '../../oracle/oracle.constants';
import type {
  BatchStatus,
  OracleMode,
  OracleStatus,
} from '../../oracle/oracle.types';

export type BatchDocument = HydratedDocument<Batch>;

@Schema({ timestamps: true })
export class Batch {
  @Prop({
    default: BATCH_STATUS.UPLOADED,
    enum: Object.values(BATCH_STATUS),
    required: true,
  })
  status: BatchStatus;

  @Prop()
  payoutOracleRate?: number;

  @Prop()
  payoutOracleSource?: string;

  @Prop()
  payoutOracleFetchedAt?: Date;

  @Prop({ enum: Object.values(ORACLE_MODE) })
  payoutOracleMode?: OracleMode;

  @Prop({ enum: Object.values(ORACLE_STATUS) })
  payoutOracleStatus?: OracleStatus;

  @Prop()
  payoutOracleReason?: string;

  @Prop()
  payoutOracleOperatorId?: string;

  @Prop()
  payoutOracleLockedAt?: Date;
}

export const BatchSchema = SchemaFactory.createForClass(Batch);
