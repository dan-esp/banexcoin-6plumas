import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type {
  BatchExportMetadata,
  IBatchRepository,
} from '../interfaces/batch-repository.interface.js';
import { BatchExportPolicy } from './batch-export.policy.js';
import {
  BanexTransferCsvSerializer,
  BanexTransferCsvResult,
} from './banex-transfer-csv.serializer.js';
import { toPeriodMonth } from './period-month.js';

export interface BatchExportPreparationResult {
  batchId: string;
  status: string;
  export: BatchExportMetadata;
}

export interface BatchExportDownloadResult extends BanexTransferCsvResult {
  metadata: BatchExportMetadata;
}

@Injectable()
export class BatchExportService {
  constructor(
    @Inject('BATCH_REPOSITORY')
    private readonly batchRepository: IBatchRepository,
    private readonly exportPolicy: BatchExportPolicy,
    private readonly csvSerializer: BanexTransferCsvSerializer,
  ) {}

  async prepareExport(
    batchId: string,
    requestedBy: string,
  ): Promise<BatchExportPreparationResult> {
    const result = await this.buildExport(batchId, requestedBy);

    return {
      batchId,
      status: 'EXPORTED',
      export: result.metadata,
    };
  }

  async downloadCsv(
    batchId: string,
    requestedBy: string,
  ): Promise<BatchExportDownloadResult> {
    return this.buildExport(batchId, requestedBy);
  }

  private async buildExport(
    batchId: string,
    requestedBy: string,
  ): Promise<BatchExportDownloadResult> {
    const batch = await this.batchRepository.findForExport(batchId);

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    this.exportPolicy.assertCanExport(batch);

    const periodMonth = toPeriodMonth(batch.report.period || batch.batchName);
    const serialized = this.csvSerializer.serialize({
      batchId: batch.batchId,
      batchName: batch.batchName,
      periodMonth,
      requestedAt: new Date(),
      requestedBy,
      lines: batch.report.banexTransferLines,
    });

    const metadata =
      batch.exportMetadata ??
      (await this.createMetadata(batch.batchId, requestedBy, serialized));

    return {
      ...serialized,
      filename: metadata.exportFilename,
      metadata,
    };
  }

  private async createMetadata(
    batchId: string,
    requestedBy: string,
    serialized: BanexTransferCsvResult,
  ): Promise<BatchExportMetadata> {
    const metadata: BatchExportMetadata = {
      exportedAt: new Date(),
      exportedBy: requestedBy,
      exportFormat: 'banextransfer_csv',
      exportChecksum: serialized.checksum,
      exportedAccountsCount: serialized.exportedAccountsCount,
      exportedTotalUsdt: serialized.exportedTotalUsdt,
      exportReferencePrefix: serialized.exportReferencePrefix,
      exportFilename: serialized.filename,
    };

    const updated = await this.batchRepository.markExported(batchId, metadata);

    return updated.exportMetadata ?? metadata;
  }
}
