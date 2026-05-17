import { Injectable } from '@nestjs/common';
import { parseBanexDate, parseSimpleDate } from '../../common/parsers/date.parser.js';
import { parseAmount } from '../../common/parsers/amount.parser.js';
import { parseLargeId } from '../../common/parsers/id.parser.js';
import { QrPaymentRow } from '../../common/interfaces/entity-rows.interface.js';
import { MapperError, RawRow } from '../interfaces/mapper.interface.js';
import { BaseMapper } from './base.mapper.js';

/**
 * Maps raw CSV/XLSX rows from the "Pago QR" file to strongly-typed QrPaymentRow objects.
 *
 * Two extra steps are applied BEFORE the base Template Method loop:
 *  1. Deduplication — 87 rows share a quoteId; only the first occurrence is kept.
 *  2. Status filter  — only rows with status "Completed" are processed.
 *
 * Column name mapping (Spanish CSV header → English field):
 *  "Número de cotización"   → quoteId
 *  "Fecha de creación"      → createdAt   (parseBanexDate — includes timezone)
 *  "Estado"                 → status
 *  "Side Cliente"           → side
 *  "Creado por"             → username
 *  "Número de Cuenta"       → accountId
 *  "Monto intercambio"      → amountUsdt
 *  "Monto Pagado"           → amountBob   (parseAmount — may contain "1,575.00")
 *  "Moneda"                 → currency
 *  "Precio"                 → fxRate
 *  "Comisión"               → commission
 *  "Fecha de actualización" → updatedAt   (parseSimpleDate — no timezone)
 *  "Transacción Id"         → transactionId (parseLargeId — kept as string)
 *  "Tipo de servicio"       → serviceType
 *  "OMS"                    → oms
 */
@Injectable()
export class QrPaymentsMapper extends BaseMapper<QrPaymentRow> {
  processAll(rows: RawRow[]): { results: QrPaymentRow[]; errors: MapperError[] } {
    const deduplicated = this.deduplicate(rows);
    const filtered = deduplicated.filter(
      (row) => String(row['Estado']).trim() === 'Completed',
    );
    return super.processAll(filtered);
  }

  protected doMap(raw: RawRow): QrPaymentRow {
    return {
      quoteId: parseInt(raw['Número de cotización'], 10),
      createdAt: parseBanexDate(raw['Fecha de creación']),
      status: String(raw['Estado']).trim(),
      side: String(raw['Side Cliente']).trim(),
      username: String(raw['Creado por']).trim(),
      accountId: parseInt(raw['Número de Cuenta'], 10),
      amountUsdt: parseFloat(raw['Monto intercambio']),
      amountBob: parseAmount(raw['Monto Pagado']),
      currency: String(raw['Moneda']).trim(),
      fxRate: parseFloat(raw['Precio']),
      commission: parseFloat(raw['Comisión']),
      updatedAt: parseSimpleDate(raw['Fecha de actualización']),
      transactionId: parseLargeId(raw['Transacción Id']),
      serviceType: String(raw['Tipo de servicio']).trim(),
      oms: String(raw['OMS']).trim(),
    };
  }

  /**
   * Keeps the first occurrence of each quoteId.
   * quoteId can be 0, which is a valid value — not treated as missing.
   */
  private deduplicate(rows: RawRow[]): RawRow[] {
    const seen = new Set<string>();
    return rows.filter((row) => {
      const id = String(row['Número de cotización']).trim();
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }
}
