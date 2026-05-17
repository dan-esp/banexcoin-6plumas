import { MapperError } from '../../etl/interfaces/mapper.interface.js';
import { QrPaymentRow } from '../../common/interfaces/entity-rows.interface.js';
import { ProcessingReportDto } from '../../processing/dto/processing-report.dto.js';

export interface BatchSavePayload {
  filename: string;
  batchName: string;
  rowsLoaded: number;
  skipped: number;
  mapperErrors: MapperError[];
  rows: QrPaymentRow[];
  report: ProcessingReportDto;
}

export interface IBatchRepository {
  save(payload: BatchSavePayload): Promise<string>;
}
