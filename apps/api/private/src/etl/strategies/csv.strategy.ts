import { Injectable } from '@nestjs/common';
import { parse } from 'csv-parse';
import { IEtlStrategy } from '../interfaces/etl-strategy.interface.js';
import { RawRow } from '../interfaces/mapper.interface.js';

/**
 * Strategy: extracts rows from a CSV buffer.
 * Uses csv-parse with column headers enabled so each row is a RawRow (Record<string, string>).
 * Handles UTF-8 files with commas as delimiters.
 */
@Injectable()
export class CsvStrategy implements IEtlStrategy {
  extractRows(buffer: Buffer): Promise<RawRow[]> {
    return new Promise((resolve, reject) => {
      parse(
        buffer,
        {
          columns: true,
          skip_empty_lines: true,
          trim: true,
          cast: false,
          relax_column_count: true,
        },
        (err, records: RawRow[]) => {
          if (err) return reject(err);
          resolve(records);
        },
      );
    });
  }
}
