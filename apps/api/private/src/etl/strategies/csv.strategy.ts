import { Injectable } from '@nestjs/common';
import { parse } from 'csv-parse';
import { IEtlStrategy } from '../interfaces/etl-strategy.interface.js';
import { RawRow } from '../interfaces/mapper.interface.js';

/**
 * Strategy: extracts rows from a CSV/TSV buffer.
 *
 * Auto-detects the column delimiter by inspecting the first line:
 *   - Tab   (\t) — exported from Excel as "Text (Tab delimited)"
 *   - Semicolon (;) — common in European locales
 *   - Comma  (,)  — standard CSV (default fallback)
 */
@Injectable()
export class CsvStrategy implements IEtlStrategy {
  extractRows(buffer: Buffer): Promise<RawRow[]> {
    const delimiter = this.detectDelimiter(buffer);

    return new Promise((resolve, reject) => {
      parse(
        buffer,
        {
          columns: true,
          skip_empty_lines: true,
          trim: true,
          cast: false,
          relax_column_count: true,
          delimiter,
          bom: true,
        },
        (err, records: RawRow[]) => {
          if (err) return reject(err);
          resolve(records);
        },
      );
    });
  }

  /**
   * Reads the first line of the buffer and counts occurrences of each candidate
   * delimiter. The one with the highest count wins; comma is the fallback.
   */
  private detectDelimiter(buffer: Buffer): string {
    const firstLine = buffer.toString('utf8').split(/\r?\n/)[0] ?? '';
    const candidates: { char: string; count: number }[] = [
      { char: '\t', count: (firstLine.match(/\t/g) ?? []).length },
      { char: ';', count: (firstLine.match(/;/g) ?? []).length },
      { char: ',', count: (firstLine.match(/,/g) ?? []).length },
    ];
    const best = candidates.reduce((a, b) => (b.count > a.count ? b : a));
    return best.count > 0 ? best.char : ',';
  }
}
