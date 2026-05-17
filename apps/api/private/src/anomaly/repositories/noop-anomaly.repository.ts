import { Injectable, Logger } from '@nestjs/common';
import type {
  AnomalyRecord,
  DismissAnomalyInput,
  IAnomalyRepository,
} from '../interfaces/anomaly-repository.interface.js';

@Injectable()
export class NoopAnomalyRepository implements IAnomalyRepository {
  private readonly logger = new Logger(NoopAnomalyRepository.name);

  async saveMany(records: AnomalyRecord[]): Promise<void> {
    if (records.length > 0) {
      this.logger.warn(
        `STORAGE_ADAPTER!=mongodb — discarding ${records.length} anomaly records`,
      );
    }
  }

  async findByBatch(): Promise<AnomalyRecord[]> {
    return [];
  }

  async findOne(): Promise<AnomalyRecord | null> {
    return null;
  }

  async dismiss(
    _anomalyId: string,
    _input: DismissAnomalyInput,
  ): Promise<AnomalyRecord | null> {
    return null;
  }
}
