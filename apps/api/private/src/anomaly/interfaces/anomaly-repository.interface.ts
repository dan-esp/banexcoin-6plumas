export type AnomalyStatus = 'open' | 'dismissed';

export interface AnomalyRecord {
  anomalyId: string;
  batchId: string;
  quoteId: number;
  transactionId: string;
  accountId: number;
  username: string;
  amountBob: number;
  amountUsdt: number;
  fxRate: number;
  createdAt: Date;
  score: number;
  isAnomaly: boolean;
  status: AnomalyStatus;
  detectedAt: Date;
  dismissedAt?: Date;
  dismissedBy?: string;
  dismissReason?: string;
}

export interface DismissAnomalyInput {
  dismissedBy: string;
  reason?: string;
}

export interface IAnomalyRepository {
  saveMany(records: AnomalyRecord[]): Promise<void>;
  findByBatch(batchId: string): Promise<AnomalyRecord[]>;
  findOne(anomalyId: string): Promise<AnomalyRecord | null>;
  dismiss(
    anomalyId: string,
    input: DismissAnomalyInput,
  ): Promise<AnomalyRecord | null>;
}
