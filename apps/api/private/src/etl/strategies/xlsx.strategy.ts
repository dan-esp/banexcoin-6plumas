import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { IEtlStrategy } from '../interfaces/etl-strategy.interface.js';
import { RawRow } from '../interfaces/mapper.interface.js';

/**
 * Strategy: extracts rows from an XLSX buffer.
 * Reads the first worksheet, treats row 1 as the header row,
 * and converts each subsequent row into a RawRow keyed by column header text.
 * All cell values are coerced to strings to match the CSV strategy output shape.
 */
@Injectable()
export class XlsxStrategy implements IEtlStrategy {
  async extractRows(buffer: Buffer): Promise<RawRow[]> {
    const workbook = new ExcelJS.Workbook();
    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    ) as ArrayBuffer;
    await workbook.xlsx.load(arrayBuffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) throw new Error('XLSX file contains no worksheets');

    const rows: RawRow[] = [];
    const headers: string[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        row.eachCell({ includeEmpty: true }, (cell) => {
          headers.push(String(cell.value ?? '').trim());
        });
        return;
      }

      const record: RawRow = {};
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const header = headers[colNumber - 1] ?? '';
        record[header] = String(cell.value ?? '').trim();
      });
      rows.push(record);
    });

    return rows;
  }
}
