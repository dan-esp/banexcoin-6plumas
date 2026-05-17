import { Injectable } from '@nestjs/common';
import { QrPaymentRow } from '../../common/interfaces/entity-rows.interface.js';

export interface RowValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Field-level business validator for typed QrPaymentRow objects (BL-005..011).
 *
 * CRITICAL errors → row is discarded.
 * WARNING         → row is kept, issue is recorded in the audit.
 *
 * This validator operates on already-typed rows (numbers, Dates, strings).
 * It does NOT re-parse — that was Stage 1's responsibility.
 */
@Injectable()
export class RowValidator {
  validate(row: QrPaymentRow, sourceRowIndex: number): RowValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    this.checkUsername(row, sourceRowIndex, errors);
    this.checkQuoteId(row, sourceRowIndex, errors);
    this.checkAmountBob(row, sourceRowIndex, errors);
    this.checkFxRate(row, sourceRowIndex, errors);
    this.checkAmountUsdt(row, sourceRowIndex, errors, warnings);
    this.checkCommission(row, sourceRowIndex, warnings);
    this.checkExchangeConsistency(row, sourceRowIndex, warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /** BL-005: username must not be empty. */
  private checkUsername(row: QrPaymentRow, idx: number, errors: string[]): void {
    if (!row.username || row.username.trim().length === 0) {
      errors.push(`Row ${idx}: 'Creado por' is empty. Row discarded.`);
    }
  }

  /** BL-006: quoteId must not be NaN (parse failure from Stage 1). */
  private checkQuoteId(row: QrPaymentRow, idx: number, errors: string[]): void {
    if (row.quoteId === null || row.quoteId === undefined || isNaN(row.quoteId)) {
      errors.push(
        `Row ${idx}: 'Número de cotización' could not be parsed (Stage 1 error). Row discarded.`,
      );
    }
  }

  /** BL-007: amountBob must be present and > 0. */
  private checkAmountBob(row: QrPaymentRow, idx: number, errors: string[]): void {
    if (row.amountBob === null || row.amountBob === undefined || isNaN(row.amountBob)) {
      errors.push(`Row ${idx}: 'Monto Pagado' could not be parsed. Row discarded.`);
      return;
    }
    if (row.amountBob <= 0) {
      errors.push(
        `Row ${idx}: amountBob=${row.amountBob} is not positive. Row discarded.`,
      );
    }
  }

  /** BL-008: fxRate must be present and > 0. */
  private checkFxRate(row: QrPaymentRow, idx: number, errors: string[]): void {
    if (row.fxRate === null || row.fxRate === undefined || isNaN(row.fxRate)) {
      errors.push(`Row ${idx}: 'Precio' could not be parsed. Row discarded.`);
      return;
    }
    if (row.fxRate <= 0) {
      errors.push(`Row ${idx}: fxRate=${row.fxRate} is not positive. Row discarded.`);
    }
  }

  /** BL-009: amountUsdt must be present and >= 0. */
  private checkAmountUsdt(
    row: QrPaymentRow,
    idx: number,
    errors: string[],
    warnings: string[],
  ): void {
    if (row.amountUsdt === null || row.amountUsdt === undefined || isNaN(row.amountUsdt)) {
      errors.push(`Row ${idx}: 'Monto intercambio' could not be parsed. Row discarded.`);
      return;
    }
    if (row.amountUsdt < 0) {
      errors.push(
        `Row ${idx}: amountUsdt=${row.amountUsdt} is negative. Row discarded.`,
      );
      return;
    }
    if (row.amountUsdt === 0) {
      warnings.push(`Row ${idx}: amountUsdt=0. Unusual but accepted.`);
    }
  }

  /** BL-010: commission must not be negative (null → treat as 0, warn). */
  private checkCommission(row: QrPaymentRow, idx: number, warnings: string[]): void {
    if (row.commission === null || row.commission === undefined || isNaN(row.commission)) {
      warnings.push(
        `Row ${idx}: 'Comisión' could not be parsed. Commission treated as 0.`,
      );
      return;
    }
    if (row.commission < 0) {
      warnings.push(
        `Row ${idx}: commission=${row.commission} is negative. Accepted with warning.`,
      );
    }
  }

  /** BL-011: amountBob / fxRate should approximately equal amountUsdt (tolerance ±0.05). */
  private checkExchangeConsistency(
    row: QrPaymentRow,
    idx: number,
    warnings: string[],
  ): void {
    if (!row.fxRate || row.fxRate === 0) return;
    const calculated = row.amountBob / row.fxRate;
    const diff = Math.abs(calculated - row.amountUsdt);
    if (diff > 0.05) {
      warnings.push(
        `Row ${idx}: exchange rate inconsistency. ` +
          `Expected amountUsdt ≈ ${calculated.toFixed(4)}, got ${row.amountUsdt}. ` +
          `Diff=${diff.toFixed(4)}.`,
      );
    }
  }
}
