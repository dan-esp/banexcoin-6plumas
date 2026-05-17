import { Inject, Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { QrPaymentRow } from '../common/interfaces/entity-rows.interface.js';
import type {
  AnomalyRecord,
  IAnomalyRepository,
} from './interfaces/anomaly-repository.interface.js';

const AI_URL = process.env.AI_API_URL ?? 'http://localhost:8081';
const AI_TIMEOUT_MS = parseInt(process.env.AI_API_TIMEOUT_MS ?? '15000', 10);

interface AiPrediction {
  user_id: string;
  score: number;
  is_anomaly: boolean;
}

interface AiPredictResponse {
  predictions: AiPrediction[];
}

interface AiTransaction {
  user_id: string;
  monto_bs: number;
  monto_usdt: number;
  tipo_cambio: number;
  timestamp: string;
}

export interface AnomalySummary {
  scored: number;
  anomalies: number;
  skipped: boolean;
  skipReason?: string;
}

@Injectable()
export class AnomalyService {
  private readonly logger = new Logger(AnomalyService.name);

  constructor(
    @Inject('ANOMALY_REPOSITORY')
    private readonly repository: IAnomalyRepository,
  ) {}

  async scoreAndPersist(
    batchId: string,
    rows: QrPaymentRow[],
    authToken?: string,
  ): Promise<AnomalySummary> {
    if (rows.length === 0) {
      return { scored: 0, anomalies: 0, skipped: true, skipReason: 'no rows' };
    }

    const txns: AiTransaction[] = rows.map((r) => ({
      user_id: String(r.accountId),
      monto_bs: r.amountBob,
      monto_usdt: r.amountUsdt,
      tipo_cambio: r.fxRate,
      timestamp:
        r.createdAt instanceof Date
          ? r.createdAt.toISOString()
          : new Date(r.createdAt).toISOString(),
    }));

    let predictions: AiPrediction[];
    try {
      const response = await fetch(`${AI_URL}/predict`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(authToken ? { authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({ rows: txns }),
        signal: AbortSignal.timeout(AI_TIMEOUT_MS),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        const reason = `AI /predict HTTP ${response.status}: ${body.slice(0, 200)}`;
        this.logger.warn(reason);
        return { scored: 0, anomalies: 0, skipped: true, skipReason: reason };
      }

      const data = (await response.json()) as AiPredictResponse;
      predictions = data.predictions ?? [];
    } catch (err: unknown) {
      const reason = err instanceof Error ? err.message : String(err);
      this.logger.warn(`AI predict failed: ${reason}`);
      return { scored: 0, anomalies: 0, skipped: true, skipReason: reason };
    }

    if (predictions.length !== rows.length) {
      const reason = `prediction count mismatch: rows=${rows.length} predictions=${predictions.length}`;
      this.logger.warn(reason);
      return { scored: 0, anomalies: 0, skipped: true, skipReason: reason };
    }

    const detectedAt = new Date();
    const flagged: AnomalyRecord[] = [];
    for (let i = 0; i < rows.length; i++) {
      const p = predictions[i];
      if (!p.is_anomaly) continue;
      const row = rows[i];
      flagged.push({
        anomalyId: uuidv4(),
        batchId,
        quoteId: row.quoteId,
        transactionId: row.transactionId,
        accountId: row.accountId,
        username: row.username,
        amountBob: row.amountBob,
        amountUsdt: row.amountUsdt,
        fxRate: row.fxRate,
        createdAt: row.createdAt,
        score: p.score,
        isAnomaly: true,
        status: 'open',
        detectedAt,
      });
    }

    if (flagged.length > 0) {
      await this.repository.saveMany(flagged);
    }

    return {
      scored: predictions.length,
      anomalies: flagged.length,
      skipped: false,
    };
  }
}
