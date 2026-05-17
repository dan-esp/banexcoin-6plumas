import { createHash } from 'crypto';
import { Injectable } from '@nestjs/common';
import type { BanexTransferLineDto } from '../../processing/dto/banex-transfer-line.dto.js';

export interface BanexTransferCsvInput {
  batchId: string;
  batchName: string;
  periodMonth: string;
  requestedAt: Date;
  requestedBy: string;
  lines: BanexTransferLineDto[];
}

export interface BanexTransferCsvResult {
  csv: string;
  checksum: string;
  filename: string;
  exportedAccountsCount: number;
  exportedTotalUsdt: string;
  exportReferencePrefix: string;
}

const HEADER = [
  'receiverAccountId',
  'receiverAccountName',
  'asset',
  'amountUsdt',
  'concept',
  'reference',
  'periodMonth',
] as const;

@Injectable()
export class BanexTransferCsvSerializer {
  serialize(input: BanexTransferCsvInput): BanexTransferCsvResult {
    const exportReferencePrefix = `REINTEGRA-${input.periodMonth}`;
    const rows = input.lines
      .filter((line) => line.cashbackUsdt > 0)
      .map((line) => ({
        receiverAccountId: String(line.accountId),
        receiverAccountName: line.username,
        asset: 'USDT',
        amountUsdt: this.formatUsdt(line.cashbackUsdt),
        concept: `BanexReintegra ${input.batchName}`,
        reference: `${exportReferencePrefix}-${line.accountId}`,
        periodMonth: input.periodMonth,
      }));

    const csvRows = [
      HEADER.join(','),
      ...rows.map((row) =>
        HEADER.map((column) => this.escapeCsv(row[column])).join(','),
      ),
    ];
    const csv = `${csvRows.join('\n')}\n`;

    return {
      csv,
      checksum: createHash('sha256').update(csv).digest('hex'),
      filename: `banextransfer-${input.periodMonth}-${input.batchId}.csv`,
      exportedAccountsCount: rows.length,
      exportedTotalUsdt: this.sumUsdt(rows.map((row) => row.amountUsdt)),
      exportReferencePrefix,
    };
  }

  private escapeCsv(value: string): string {
    if (!/[",\n\r]/.test(value)) {
      return value;
    }

    return `"${value.replaceAll('"', '""')}"`;
  }

  private formatUsdt(value: number): string {
    return value.toFixed(6);
  }

  private sumUsdt(values: string[]): string {
    const totalMicroUsdt = values.reduce((total, value) => {
      const [whole = '0', fraction = ''] = value.split('.');
      const micro = `${fraction}000000`.slice(0, 6);
      return total + BigInt(whole) * 1_000_000n + BigInt(micro);
    }, 0n);

    const whole = totalMicroUsdt / 1_000_000n;
    const fraction = (totalMicroUsdt % 1_000_000n).toString().padStart(6, '0');

    return `${whole}.${fraction}`;
  }
}
