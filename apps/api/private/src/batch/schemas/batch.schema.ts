import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  BATCH_STATUS,
  ORACLE_MODE,
  ORACLE_STATUS,
} from '../../oracle/oracle.constants.js';
import type {
  OracleMode,
  OracleStatus,
} from '../../oracle/oracle.types.js';
import {
  BATCH_STATUS,
  ORACLE_MODE,
  ORACLE_STATUS,
} from '../../oracle/oracle.constants.js';
import type {
  OracleMode,
  OracleStatus,
} from '../../oracle/oracle.types.js';

export type BatchDocument = HydratedDocument<Batch>;

export type BatchStatus =
  | 'uploaded'
  | 'validated'
  | 'calculated'
  | 'fx_locked'
  | 'approved'
  | 'exported';

@Schema({ collection: 'batches', timestamps: true })
export class Batch {
  @Prop({ index: true, unique: true, sparse: true })
  batchId?: string;

  @Prop()
  filename?: string;

  @Prop()
  batchName?: string;

  @Prop()
  savedAt?: Date;

  @Prop({
    default: BATCH_STATUS.UPLOADED,
    enum: Object.values(BATCH_STATUS),
    required: true,
  })
  status: BatchStatus;

  @Prop()
  rowsLoaded?: number;

  @Prop()
  skipped?: number;

  @Prop({ type: [Object], default: [] })
  mapperErrors?: Record<string, unknown>[];

  @Prop({ type: Object })
  oracle?: {
    rate: number;
    source: string;
    fetchedAt: string;
    mode: string;
    status: string;
    usedFallback: boolean;
    fallbackReason?: string;
  };

  @Prop({ type: Object })
  approval?: {
    approvedAt: Date;
    approvedBy: string;
    totalUsersAnalyzed: number;
    usersQualifyingForCashback: number;
    totalCashbackUsdt: string;
  };

  @Prop({ type: Object })
  exportMetadata?: {
    exportedAt: Date;
    exportedBy: string;
    exportFormat: 'banextransfer_csv';
    exportChecksum: string;
    exportedAccountsCount: number;
    exportedTotalUsdt: string;
    exportReferencePrefix: string;
    exportFilename: string;
  };
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
