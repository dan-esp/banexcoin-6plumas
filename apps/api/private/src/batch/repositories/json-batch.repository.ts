import { Injectable } from '@nestjs/common';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  IBatchRepository,
  BatchApprovalSnapshot,
  BatchExportMetadata,
  BatchExportRecord,
  BatchSavePayload,
} from '../interfaces/batch-repository.interface.js';

const DATA_DIR = join(process.cwd(), 'data', 'batches');
const EXPORTED_STATUS = 'EXPORTED';
const APPROVED_STATUS = 'APPROVED';

type JsonBatchDocument = {
  batchId: string;
  filename: string;
  batchName: string;
  savedAt: string;
  status: string;
  rowsLoaded: number;
  skipped: number;
  mapperErrors: unknown[];
  oracle: unknown;
  rows: unknown[];
  report: BatchExportRecord['report'];
  approval?: BatchApprovalSnapshot;
  exportMetadata?: BatchExportMetadata;
};

@Injectable()
export class JsonBatchRepository implements IBatchRepository {
  async save(payload: BatchSavePayload): Promise<string> {
    const batchId = uuidv4();

    const document = {
      batchId,
      filename: payload.filename,
      batchName: payload.batchName,
      savedAt: new Date().toISOString(),
      status: 'CALCULATED',
      rowsLoaded: payload.rowsLoaded,
      skipped: payload.skipped,
      mapperErrors: payload.mapperErrors,
      oracle: payload.oracleContext,
      rows: payload.rows,
      report: payload.report,
    };

    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(
      join(DATA_DIR, `${batchId}.json`),
      JSON.stringify(document, null, 2),
      'utf-8',
    );

    return batchId;
  }

  async findForExport(batchId: string): Promise<BatchExportRecord | null> {
    const document = await this.readDocument(batchId);

    if (!document) {
      return null;
    }

    return this.toExportRecord(document);
  }

  async approve(
    batchId: string,
    approval: BatchApprovalSnapshot,
  ): Promise<BatchExportRecord> {
    const document = await this.readDocumentOrThrow(batchId);
    document.status = APPROVED_STATUS;
    document.approval = approval;
    await this.writeDocument(document);

    return this.toExportRecord(document);
  }

  async markExported(
    batchId: string,
    metadata: BatchExportMetadata,
  ): Promise<BatchExportRecord> {
    const document = await this.readDocumentOrThrow(batchId);
    document.status = EXPORTED_STATUS;
    document.exportMetadata = metadata;
    await this.writeDocument(document);

    return this.toExportRecord(document);
  }

  private async readDocument(
    batchId: string,
  ): Promise<JsonBatchDocument | null> {
    try {
      const raw = await readFile(join(DATA_DIR, `${batchId}.json`), 'utf-8');
      return JSON.parse(raw) as JsonBatchDocument;
    } catch (error) {
      if (
        error instanceof Error &&
        'code' in error &&
        error.code === 'ENOENT'
      ) {
        return null;
      }

      throw error;
    }
  }

  private async readDocumentOrThrow(
    batchId: string,
  ): Promise<JsonBatchDocument> {
    const document = await this.readDocument(batchId);

    if (!document) {
      throw new Error(`Batch ${batchId} not found`);
    }

    return document;
  }

  private async writeDocument(document: JsonBatchDocument): Promise<void> {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(
      join(DATA_DIR, `${document.batchId}.json`),
      JSON.stringify(document, null, 2),
      'utf-8',
    );
  }

  private toExportRecord(document: JsonBatchDocument): BatchExportRecord {
    return {
      batchId: document.batchId,
      batchName: document.batchName,
      status: document.status,
      report: document.report,
      approval: document.approval,
      exportMetadata: document.exportMetadata,
    };
  }
}
