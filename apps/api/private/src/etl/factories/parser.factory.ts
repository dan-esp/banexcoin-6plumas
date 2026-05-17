import { BadRequestException, Injectable } from '@nestjs/common';
import { IEtlStrategy } from '../interfaces/etl-strategy.interface.js';
import { CsvStrategy } from '../strategies/csv.strategy.js';
import { XlsxStrategy } from '../strategies/xlsx.strategy.js';

/**
 * Factory pattern: resolves the correct file-parsing strategy based on
 * the uploaded file's MIME type and original filename extension.
 *
 * Supported formats:
 *  - text/csv   / .csv  → CsvStrategy
 *  - application/vnd.openxmlformats-officedocument.spreadsheetml.sheet / .xlsx → XlsxStrategy
 *  - application/vnd.ms-excel / .xls → XlsxStrategy
 */
@Injectable()
export class ParserFactory {
  constructor(
    private readonly csvStrategy: CsvStrategy,
    private readonly xlsxStrategy: XlsxStrategy,
  ) {}

  resolve(mimetype: string, originalname: string): IEtlStrategy {
    const name = originalname.toLowerCase();

    if (mimetype === 'text/csv' || name.endsWith('.csv')) {
      return this.csvStrategy;
    }

    if (
      name.endsWith('.xlsx') ||
      name.endsWith('.xls') ||
      mimetype.includes('spreadsheetml') ||
      mimetype === 'application/vnd.ms-excel'
    ) {
      return this.xlsxStrategy;
    }

    throw new BadRequestException(
      `Unsupported file type: "${mimetype}". Only CSV and XLSX files are accepted.`,
    );
  }
}
