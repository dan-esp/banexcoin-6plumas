import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import type { BatchDocument } from '../../batches/schemas/batch.schema';
import type { BatchStatus, OracleRateContext } from '../oracle.types';

/**
 * Used when STORAGE_ADAPTER is not `mongodb`. Live oracle rate (HTTP) still works;
 * lock / override / batch-oracle persistence endpoints require MongoDB.
 */
@Injectable()
export class StubBatchOracleRepository {
  async findByIdOrThrow(_batchId: string): Promise<BatchDocument> {
    throw new ServiceUnavailableException(
      'Batch oracle persistence (lock, override, context by batch id) requires STORAGE_ADAPTER=mongodb and MongoDB.',
    );
  }

  applyOracleContext(
    _batch: BatchDocument,
    _context: OracleRateContext,
    _status: BatchStatus,
  ): void {
    throw new ServiceUnavailableException(
      'Batch oracle persistence (lock, override, context by batch id) requires STORAGE_ADAPTER=mongodb and MongoDB.',
    );
  }

  async save(_batch: BatchDocument): Promise<BatchDocument> {
    throw new ServiceUnavailableException(
      'Batch oracle persistence (lock, override, context by batch id) requires STORAGE_ADAPTER=mongodb and MongoDB.',
    );
  }
}
