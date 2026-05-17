import { Injectable } from '@nestjs/common';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  IBatchRepository,
  BatchSavePayload,
} from '../interfaces/batch-repository.interface.js';

const DATA_DIR = join(process.cwd(), 'data', 'batches');

@Injectable()
export class JsonBatchRepository implements IBatchRepository {
  async save(payload: BatchSavePayload): Promise<string> {
    const batchId = uuidv4();

    const document = {
      batchId,
      filename: payload.filename,
      batchName: payload.batchName,
      savedAt: new Date().toISOString(),
      status: 'calculated',
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
}
