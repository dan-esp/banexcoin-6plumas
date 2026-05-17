import { MapperError } from '../../etl/interfaces/mapper.interface.js';
import { QrPaymentRow } from '../../common/interfaces/entity-rows.interface.js';
import { ProcessingReportDto } from '../../processing/dto/processing-report.dto.js';
import type { OracleRateContext } from '../../oracle/oracle.types.js';

export interface BatchSavePayload {
  filename: string;
  batchName: string;
  rowsLoaded: number;
  skipped: number;
  mapperErrors: MapperError[];
  rows: QrPaymentRow[];
  report: ProcessingReportDto;
  oracleContext: OracleRateContext & { usedFallback: boolean; fallbackReason?: string };
}

export interface IBatchRepository {
  save(payload: BatchSavePayload): Promise<string>;
}
