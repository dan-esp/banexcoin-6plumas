import { Injectable } from '@nestjs/common';
import { EntityType } from '../../common/enums/entity-type.enum.js';
import { parseBanexDate } from '../../common/parsers/date.parser.js';
import { parseAmount } from '../../common/parsers/amount.parser.js';
import { RawRow } from '../interfaces/mapper.interface.js';
import {
  FilterBreakdownDto,
  HeaderValidationDto,
  IssueCategory,
  IssueGroupDto,
  IssueSeverity,
  RowIssueDto,
  ValidationReportDto,
  ValidationSummaryDto,
} from '../dto/validation-report.dto.js';

// ─── Header definitions per entity type ───────────────────────────────────────

const REQUIRED_HEADERS: Record<EntityType, string[]> = {
  [EntityType.QR_PAYMENTS]: [
    'Número de cotización',
    'Fecha de creación',
    'Estado',
    'Side Cliente',
    'Creado por',
    'Número de Cuenta',
    'Monto intercambio',
    'Monto Pagado',
    'Moneda',
    'Precio',
    'Comisión',
    'Fecha de actualización',
    'Transacción Id',
    'Tipo de servicio',
    'OMS',
  ],
};

/** Row number offset: data starts at row 2 in Excel (row 1 = header). */
const DATA_ROW_OFFSET = 2;

/** Maximum affected rows listed per issue group. */
const MAX_ROWS_PER_GROUP = 20;

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class FileValidatorService {
  /**
   * Realiza una validación completa sin escribir nada en el store (dry-run).
   *
   * @param manualReviewThreshold  Monto en BOB por encima del cual una transacción
   *   se marca para revisión manual (por defecto 5,000).
   */
  validate(
    rawRows: RawRow[],
    entityType: EntityType,
    fileName: string,
    fileFormat: string,
    manualReviewThreshold = 5000,
  ): ValidationReportDto {
    const validatedAt = new Date();

    // ── 1. Validación de encabezados ────────────────────────────────────────
    const fileHeaders = rawRows.length > 0 ? Object.keys(rawRows[0]) : [];
    const headerValidation = this.validateHeaders(fileHeaders, entityType);

    if (!headerValidation.valid) {
      return this.buildEarlyExit(
        fileName,
        fileFormat,
        validatedAt,
        rawRows.length,
        headerValidation,
        manualReviewThreshold,
      );
    }

    // ── 2. Validación fila por fila ─────────────────────────────────────────
    const allIssues: RowIssueDto[] = [];

    for (let i = 0; i < rawRows.length; i++) {
      const rowNumber = i + DATA_ROW_OFFSET;
      allIssues.push(
        ...this.validateRow(rawRows[i], rowNumber, entityType, manualReviewThreshold),
      );
    }

    // ── 3. Detección de duplicados ──────────────────────────────────────────
    allIssues.push(...this.detectDuplicates(rawRows, entityType));

    // ── 4. Desglose de filtros ──────────────────────────────────────────────
    const filterBreakdown = this.computeFilterBreakdown(rawRows, entityType, allIssues);

    // ── 5. Conteos para el resumen ──────────────────────────────────────────
    const criticalIssues = allIssues.filter((i) => i.severity === 'CRITICAL').length;
    const warnings = allIssues.filter((i) => i.severity === 'WARNING').length;
    const duplicates = allIssues.filter((i) => i.severity === 'DUPLICATE').length;
    const manualReviewRows = allIssues.filter((i) => i.severity === 'MANUAL_REVIEW').length;
    const filteredRows = filterBreakdown.totalFilteredOut;

    const summary: ValidationSummaryDto = {
      totalRawRows: rawRows.length,
      readyForProcessing: criticalIssues === 0,
      criticalIssues,
      warnings,
      duplicates,
      filteredRows,
      estimatedRowsAfterProcessing: filterBreakdown.estimatedRowsAfterProcessing,
      manualReviewRows,
      manualReviewThreshold,
    };

    // ── 6. Insights de alto nivel ───────────────────────────────────────────
    const insights = this.buildInsights(summary);

    // ── 7. Problemas agrupados por tipo ─────────────────────────────────────
    const groupedIssues = this.buildGroupedIssues(allIssues);

    return {
      fileName,
      fileFormat,
      validatedAt,
      summary,
      insights,
      headerValidation,
      filterBreakdown,
      groupedIssues,
      totalIssueCount: allIssues.length,
    };
  }

  // ─── Insights de alto nivel ────────────────────────────────────────────────

  private buildInsights(summary: ValidationSummaryDto): string[] {
    const insights: string[] = [];
    const fmt = (n: number) => n.toLocaleString('es-BO');

    // Estado general
    if (summary.readyForProcessing) {
      insights.push(
        '✓ El archivo está listo para ser cargado. No se encontraron errores críticos.',
      );
    } else {
      insights.push(
        `✗ El archivo tiene ${fmt(summary.criticalIssues)} error(es) crítico(s) y no puede procesarse hasta que sean corregidos.`,
      );
    }

    // Revisión manual
    if (summary.manualReviewRows > 0) {
      insights.push(
        `⚠ ${fmt(summary.manualReviewRows)} transacción(es) superan los ${fmt(summary.manualReviewThreshold)} Bs, ` +
          `lo que activa el flag de revisión manual. Estas filas son válidas pero requieren aprobación humana antes de pagar el cashback.`,
      );
    }

    // Advertencias de consistencia
    if (summary.warnings > 0) {
      insights.push(
        `⚠ ${fmt(summary.warnings)} fila(s) presentan valores inusuales (advertencias). Serán conservadas pero marcadas en el informe de auditoría.`,
      );
    }

    // Duplicados
    if (summary.duplicates > 0) {
      insights.push(
        `ℹ ${fmt(summary.duplicates)} registro(s) tienen un quoteId repetido. ` +
          `Solo se conservará la primera aparición de cada uno; los duplicados serán descartados.`,
      );
    }

    // Filtro triple
    if (summary.filteredRows > 0) {
      insights.push(
        `ℹ ${fmt(summary.filteredRows)} fila(s) serán descartadas por no cumplir el filtro triple: ` +
          `estado = "Completed", dirección = "Sell", moneda = "BOB".`,
      );
    }

    // Filas netas estimadas
    insights.push(
      `ℹ Se estiman ${fmt(summary.estimatedRowsAfterProcessing)} filas netas disponibles para el cálculo de cashback, ` +
        `luego del filtrado y la deduplicación.`,
    );

    return insights;
  }

  // ─── Agrupación de problemas ───────────────────────────────────────────────

  private buildGroupedIssues(allIssues: RowIssueDto[]): IssueGroupDto[] {
    // Agrupar por severity + field
    const groupMap = new Map<string, RowIssueDto[]>();

    for (const issue of allIssues) {
      const key = `${issue.severity}||${issue.field}`;
      const existing = groupMap.get(key) ?? [];
      existing.push(issue);
      groupMap.set(key, existing);
    }

    const groups: IssueGroupDto[] = [];

    for (const issues of groupMap.values()) {
      const first = issues[0];
      const count = issues.length;
      const affectedRows = issues.slice(0, MAX_ROWS_PER_GROUP).map((i) => i.rowNumber);

      groups.push({
        severity: first.severity,
        category: first.category,
        field: first.field,
        count,
        description: this.describeGroup(first.severity, first.field, count),
        affectedRows,
        moreRowsExist: count > MAX_ROWS_PER_GROUP,
      });
    }

    // Ordenar: CRITICAL primero, luego WARNING, MANUAL_REVIEW, DUPLICATE, FILTERED
    const order: IssueSeverity[] = [
      'CRITICAL',
      'WARNING',
      'MANUAL_REVIEW',
      'DUPLICATE',
      'FILTERED',
    ];
    groups.sort(
      (a, b) => order.indexOf(a.severity) - order.indexOf(b.severity),
    );

    return groups;
  }

  private describeGroup(severity: IssueSeverity, field: string, count: number): string {
    const fmt = (n: number) => n.toLocaleString('es-BO');
    const n = fmt(count);

    switch (severity) {
      case 'CRITICAL':
        return (
          `${n} fila(s) tienen un error crítico en el campo "${field}" y serán descartadas. ` +
          `Deben corregirse en el archivo antes de volver a cargar.`
        );
      case 'WARNING':
        return (
          `${n} fila(s) presentan un valor inusual en "${field}". ` +
          `Serán conservadas pero quedarán marcadas en el informe de auditoría.`
        );
      case 'MANUAL_REVIEW':
        return (
          `${n} transacción(es) superan el umbral de revisión manual en el campo "${field}". ` +
          `Son válidas y se cargarán, pero requieren aprobación humana antes de pagar el cashback.`
        );
      case 'DUPLICATE':
        return (
          `${n} fila(s) tienen un valor de "${field}" que ya apareció antes en el archivo. ` +
          `Solo se conservará la primera aparición; las demás serán descartadas.`
        );
      case 'FILTERED':
        return (
          `${n} fila(s) serán eliminadas por el filtro en el campo "${field}". ` +
          `No cumplen el criterio requerido (Completed / Sell / BOB).`
        );
      default:
        return `${n} fila(s) afectadas en el campo "${field}".`;
    }
  }

  // ─── Validación de encabezados ─────────────────────────────────────────────

  private validateHeaders(fileHeaders: string[], entityType: EntityType): HeaderValidationDto {
    const required = REQUIRED_HEADERS[entityType];
    const fileHeaderSet = new Set(fileHeaders.map((h) => h.trim()));
    const requiredSet = new Set(required);

    const missingHeaders = required.filter((h) => !fileHeaderSet.has(h));
    const extraHeaders = fileHeaders.map((h) => h.trim()).filter((h) => !requiredSet.has(h));

    return {
      valid: missingHeaders.length === 0,
      expectedCount: required.length,
      foundCount: fileHeaders.length,
      missingHeaders,
      extraHeaders,
    };
  }

  // ─── Validación por fila ───────────────────────────────────────────────────

  private validateRow(
    raw: RawRow,
    rowNumber: number,
    entityType: EntityType,
    manualReviewThreshold: number,
  ): RowIssueDto[] {
    if (entityType === EntityType.QR_PAYMENTS) {
      return this.validateQrPaymentRow(raw, rowNumber, manualReviewThreshold);
    }
    return [];
  }

  private validateQrPaymentRow(
    raw: RawRow,
    rowNumber: number,
    manualReviewThreshold: number,
  ): RowIssueDto[] {
    const issues: RowIssueDto[] = [];
    const quoteId = String(raw['Número de cotización'] ?? '').trim() || 'N/A';

    const add = (
      severity: IssueSeverity,
      category: IssueCategory,
      field: string,
      message: string,
    ) => issues.push({ rowNumber, quoteId, severity, category, field, message });

    // ── Número de cotización ──
    const rawQuoteId = raw['Número de cotización'];
    if (!rawQuoteId || String(rawQuoteId).trim() === '') {
      add(
        'CRITICAL', 'BUSINESS_RULE', 'Número de cotización',
        `Fila ${rowNumber}: el campo "Número de cotización" está vacío.`,
      );
    } else if (isNaN(parseInt(String(rawQuoteId).trim(), 10))) {
      add(
        'CRITICAL', 'PARSE_ERROR', 'Número de cotización',
        `Fila ${rowNumber}: el quoteId "${rawQuoteId}" no es un número entero válido.`,
      );
    }

    // ── Fecha de creación ──
    const rawCreatedAt = raw['Fecha de creación'];
    if (!rawCreatedAt || String(rawCreatedAt).trim() === '') {
      add(
        'CRITICAL', 'BUSINESS_RULE', 'Fecha de creación',
        `Fila ${rowNumber}: el campo "Fecha de creación" está vacío.`,
      );
    } else {
      try {
        parseBanexDate(String(rawCreatedAt));
      } catch {
        add(
          'CRITICAL', 'PARSE_ERROR', 'Fecha de creación',
          `Fila ${rowNumber}: formato de fecha inválido en "Fecha de creación". ` +
            `Se esperaba "DD/MM/YYYY HH:mm:ss, UTC ±HH:MM". Valor recibido: "${rawCreatedAt}".`,
        );
      }
    }

    // ── Fecha de actualización ──
    const rawUpdatedAt = raw['Fecha de actualización'];
    if (!rawUpdatedAt || String(rawUpdatedAt).trim() === '') {
      add(
        'CRITICAL', 'BUSINESS_RULE', 'Fecha de actualización',
        `Fila ${rowNumber}: el campo "Fecha de actualización" está vacío.`,
      );
    } else {
      const slashFmt = /^\d{2}\/\d{2}\/\d{4}( \d{2}:\d{2}:\d{2})?$/;
      const isoFmt = /^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}:\d{2})?$/;
      if (!slashFmt.test(String(rawUpdatedAt).trim()) && !isoFmt.test(String(rawUpdatedAt).trim())) {
        add(
          'WARNING', 'PARSE_ERROR', 'Fecha de actualización',
          `Fila ${rowNumber}: formato de fecha no reconocido en "Fecha de actualización". ` +
            `Se esperaba "DD/MM/YYYY HH:mm:ss" o "YYYY-MM-DD HH:mm:ss". Valor recibido: "${rawUpdatedAt}".`,
        );
      }
    }

    // ── Creado por ──
    const username = String(raw['Creado por'] ?? '').trim();
    if (!username) {
      add(
        'CRITICAL', 'BUSINESS_RULE', 'Creado por',
        `Fila ${rowNumber}: el campo "Creado por" (nombre de usuario) está vacío.`,
      );
    }

    // ── Número de Cuenta ──
    const rawAccountId = raw['Número de Cuenta'];
    if (!rawAccountId || String(rawAccountId).trim() === '') {
      add(
        'CRITICAL', 'BUSINESS_RULE', 'Número de Cuenta',
        `Fila ${rowNumber}: el campo "Número de Cuenta" está vacío.`,
      );
    } else if (isNaN(parseInt(String(rawAccountId).trim(), 10))) {
      add(
        'CRITICAL', 'PARSE_ERROR', 'Número de Cuenta',
        `Fila ${rowNumber}: el accountId "${rawAccountId}" no es un número entero válido.`,
      );
    }

    // ── Monto intercambio (USDT) ──
    const rawAmountUsdt = raw['Monto intercambio'];
    if (!rawAmountUsdt || String(rawAmountUsdt).trim() === '') {
      add(
        'CRITICAL', 'BUSINESS_RULE', 'Monto intercambio',
        `Fila ${rowNumber}: el campo "Monto intercambio" (USDT) está vacío.`,
      );
    } else if (isNaN(parseFloat(String(rawAmountUsdt)))) {
      add(
        'CRITICAL', 'PARSE_ERROR', 'Monto intercambio',
        `Fila ${rowNumber}: el valor "${rawAmountUsdt}" en "Monto intercambio" no es un número válido.`,
      );
    } else if (parseFloat(String(rawAmountUsdt)) === 0) {
      add(
        'WARNING', 'CONSISTENCY', 'Monto intercambio',
        `Fila ${rowNumber}: el monto de intercambio (USDT) es 0. Inusual pero no es un error bloqueante.`,
      );
    }

    // ── Monto Pagado (BOB) ──
    const rawAmountBob = raw['Monto Pagado'];
    if (!rawAmountBob || String(rawAmountBob).trim() === '') {
      add(
        'CRITICAL', 'BUSINESS_RULE', 'Monto Pagado',
        `Fila ${rowNumber}: el campo "Monto Pagado" (BOB) está vacío.`,
      );
    } else {
      try {
        const parsed = parseAmount(String(rawAmountBob));
        if (parsed <= 0) {
          add(
            'CRITICAL', 'BUSINESS_RULE', 'Monto Pagado',
            `Fila ${rowNumber}: el monto en BOB debe ser mayor a 0. Valor recibido: ${parsed}.`,
          );
        } else if (parsed > manualReviewThreshold) {
          add(
            'MANUAL_REVIEW', 'BUSINESS_RULE', 'Monto Pagado',
            `Fila ${rowNumber}: monto de ${parsed.toLocaleString('es-BO')} Bs supera el umbral de revisión manual ` +
              `de ${manualReviewThreshold.toLocaleString('es-BO')} Bs. La transacción es válida pero requiere aprobación humana.`,
          );
        }
      } catch {
        add(
          'CRITICAL', 'PARSE_ERROR', 'Monto Pagado',
          `Fila ${rowNumber}: el valor "${rawAmountBob}" en "Monto Pagado" no se pudo interpretar como número.`,
        );
      }
    }

    // ── Precio (tipo de cambio) ──
    const rawFxRate = raw['Precio'];
    if (!rawFxRate || String(rawFxRate).trim() === '') {
      add(
        'CRITICAL', 'BUSINESS_RULE', 'Precio',
        `Fila ${rowNumber}: el campo "Precio" (tipo de cambio BOB/USDT) está vacío.`,
      );
    } else {
      const parsed = parseFloat(String(rawFxRate));
      if (isNaN(parsed)) {
        add(
          'CRITICAL', 'PARSE_ERROR', 'Precio',
          `Fila ${rowNumber}: el tipo de cambio "${rawFxRate}" no es un número válido.`,
        );
      } else if (parsed <= 0) {
        add(
          'CRITICAL', 'BUSINESS_RULE', 'Precio',
          `Fila ${rowNumber}: el tipo de cambio debe ser mayor a 0. Valor recibido: ${parsed}.`,
        );
      }
    }

    // ── Comisión ──
    const rawCommission = raw['Comisión'];
    if (!rawCommission || String(rawCommission).trim() === '') {
      add(
        'CRITICAL', 'BUSINESS_RULE', 'Comisión',
        `Fila ${rowNumber}: el campo "Comisión" está vacío.`,
      );
    } else if (isNaN(parseFloat(String(rawCommission)))) {
      add(
        'CRITICAL', 'PARSE_ERROR', 'Comisión',
        `Fila ${rowNumber}: la comisión "${rawCommission}" no es un número válido.`,
      );
    }

    // ── Transacción Id ──
    const transactionId = String(raw['Transacción Id'] ?? '').trim();
    if (!transactionId) {
      add(
        'WARNING', 'BUSINESS_RULE', 'Transacción Id',
        `Fila ${rowNumber}: el campo "Transacción Id" está vacío.`,
      );
    }

    // ── Tipo de servicio ──
    const serviceType = String(raw['Tipo de servicio'] ?? '').trim();
    if (!serviceType) {
      add(
        'WARNING', 'BUSINESS_RULE', 'Tipo de servicio',
        `Fila ${rowNumber}: el campo "Tipo de servicio" está vacío.`,
      );
    }

    // ── Filtros informativos (la fila no es errónea, pero será descartada) ──
    const status = String(raw['Estado'] ?? '').trim();
    if (status !== 'Completed') {
      add(
        'FILTERED', 'FILTER', 'Estado',
        `Fila ${rowNumber}: estado "${status}" no cumple el filtro (se requiere "Completed").`,
      );
    }

    const side = String(raw['Side Cliente'] ?? '').trim();
    if (side !== 'Sell') {
      add(
        'FILTERED', 'FILTER', 'Side Cliente',
        `Fila ${rowNumber}: dirección "${side}" no cumple el filtro (se requiere "Sell").`,
      );
    }

    const currency = String(raw['Moneda'] ?? '').trim();
    if (currency !== 'BOB') {
      add(
        'FILTERED', 'FILTER', 'Moneda',
        `Fila ${rowNumber}: moneda "${currency}" no cumple el filtro (se requiere "BOB").`,
      );
    }

    return issues;
  }

  // ─── Detección de duplicados ───────────────────────────────────────────────

  private detectDuplicates(rawRows: RawRow[], entityType: EntityType): RowIssueDto[] {
    if (entityType !== EntityType.QR_PAYMENTS) return [];

    const issues: RowIssueDto[] = [];
    const seen = new Map<string, number>(); // quoteId → primera fila

    for (let i = 0; i < rawRows.length; i++) {
      const rowNumber = i + DATA_ROW_OFFSET;
      const quoteId = String(rawRows[i]['Número de cotización'] ?? '').trim();

      if (!quoteId || quoteId === 'undefined') continue;

      if (seen.has(quoteId)) {
        const primeraFila = seen.get(quoteId)!;
        issues.push({
          rowNumber,
          quoteId,
          severity: 'DUPLICATE',
          category: 'DUPLICATE',
          field: 'Número de cotización',
          message:
            `Fila ${rowNumber}: quoteId "${quoteId}" es un duplicado de la fila ${primeraFila}. ` +
            `Esta fila será descartada (se conserva la primera aparición).`,
        });
      } else {
        seen.set(quoteId, rowNumber);
      }
    }

    return issues;
  }

  // ─── Desglose de filtros ───────────────────────────────────────────────────

  private computeFilterBreakdown(
    rawRows: RawRow[],
    entityType: EntityType,
    allIssues: RowIssueDto[],
  ): FilterBreakdownDto {
    if (entityType !== EntityType.QR_PAYMENTS) {
      return {
        totalRawRows: rawRows.length,
        failStatusFilter: 0,
        failSideFilter: 0,
        failCurrencyFilter: 0,
        totalFilteredOut: 0,
        duplicatesFound: 0,
        estimatedRowsAfterProcessing: rawRows.length,
      };
    }

    let failStatus = 0;
    let failSide = 0;
    let failCurrency = 0;
    let failAny = 0;

    for (const raw of rawRows) {
      const sF = String(raw['Estado'] ?? '').trim() !== 'Completed';
      const siF = String(raw['Side Cliente'] ?? '').trim() !== 'Sell';
      const cF = String(raw['Moneda'] ?? '').trim() !== 'BOB';

      if (sF) failStatus++;
      if (siF) failSide++;
      if (cF) failCurrency++;
      if (sF || siF || cF) failAny++;
    }

    const duplicatesFound = allIssues.filter((i) => i.severity === 'DUPLICATE').length;
    const afterFilter = rawRows.length - failAny;
    const afterDedup = Math.max(0, afterFilter - duplicatesFound);

    return {
      totalRawRows: rawRows.length,
      failStatusFilter: failStatus,
      failSideFilter: failSide,
      failCurrencyFilter: failCurrency,
      totalFilteredOut: failAny,
      duplicatesFound,
      estimatedRowsAfterProcessing: afterDedup,
    };
  }

  // ─── Salida anticipada cuando faltan encabezados ───────────────────────────

  private buildEarlyExit(
    fileName: string,
    fileFormat: string,
    validatedAt: Date,
    totalRawRows: number,
    headerValidation: HeaderValidationDto,
    manualReviewThreshold: number,
  ): ValidationReportDto {
    const missingIssues: RowIssueDto[] = headerValidation.missingHeaders.map((h) => ({
      rowNumber: 1,
      quoteId: 'N/A',
      severity: 'CRITICAL' as IssueSeverity,
      category: 'BUSINESS_RULE' as IssueCategory,
      field: h,
      message: `Encabezado faltante: la columna requerida "${h}" no está presente en el archivo.`,
    }));

    const count = missingIssues.length;

    const summary: ValidationSummaryDto = {
      totalRawRows,
      readyForProcessing: false,
      criticalIssues: count,
      warnings: 0,
      duplicates: 0,
      filteredRows: 0,
      estimatedRowsAfterProcessing: 0,
      manualReviewRows: 0,
      manualReviewThreshold,
    };

    return {
      fileName,
      fileFormat,
      validatedAt,
      summary,
      insights: [
        `✗ El archivo no puede procesarse. Faltan ${count} columna(s) requerida(s): ` +
          headerValidation.missingHeaders.map((h) => `"${h}"`).join(', ') + '.',
      ],
      headerValidation,
      filterBreakdown: {
        totalRawRows,
        failStatusFilter: 0,
        failSideFilter: 0,
        failCurrencyFilter: 0,
        totalFilteredOut: 0,
        duplicatesFound: 0,
        estimatedRowsAfterProcessing: 0,
      },
      groupedIssues: [
        {
          severity: 'CRITICAL',
          category: 'BUSINESS_RULE',
          field: 'Encabezados',
          count,
          description: `Faltan ${count} columna(s) requerida(s). El archivo no puede procesarse hasta que sean agregadas.`,
          affectedRows: [1],
          moreRowsExist: false,
        },
      ],
      totalIssueCount: count,
    };
  }
}
