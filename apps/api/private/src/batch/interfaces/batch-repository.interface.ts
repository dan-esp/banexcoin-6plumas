import { MapperError } from '../../etl/interfaces/mapper.interface.js';
import { QrPaymentRow } from '../../common/interfaces/entity-rows.interface.js';
import { ProcessingReportDto } from '../../processing/dto/processing-report.dto.js';
import type { OracleContext } from '../oracle.service.js';

export interface BatchSavePayload {
  filename: string;
  batchName: string;
  rowsLoaded: number;
  skipped: number;
  mapperErrors: MapperError[];
  rows: QrPaymentRow[];
  report: ProcessingReportDto;
  oracleContext: OracleContext;
}

export interface BatchApprovalSnapshot {
  approvedAt: Date;
  approvedBy: string;
  totalUsersAnalyzed: number;
  usersQualifyingForCashback: number;
  totalCashbackUsdt: string;
}

export interface BatchExportMetadata {
  exportedAt: Date;
  exportedBy: string;
  exportFormat: 'banextransfer_csv';
  exportChecksum: string;
  exportedAccountsCount: number;
  exportedTotalUsdt: string;
  exportReferencePrefix: string;
  exportFilename: string;
}

export interface BatchExportRecord {
  batchId: string;
  batchName: string;
  status: string;
  report: ProcessingReportDto;
  approval?: BatchApprovalSnapshot;
  exportMetadata?: BatchExportMetadata;
}

export interface IBatchRepository {
  save(payload: BatchSavePayload): Promise<string>;
  findForExport(batchId: string): Promise<BatchExportRecord | null>;
  approve(
    batchId: string,
    approval: BatchApprovalSnapshot,
  ): Promise<BatchExportRecord>;
  markExported(
    batchId: string,
    metadata: BatchExportMetadata,
  ): Promise<BatchExportRecord>;
}
