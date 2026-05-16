import { ApiProperty } from '@nestjs/swagger';

export type IssueSeverity =
  | 'CRITICAL'
  | 'WARNING'
  | 'DUPLICATE'
  | 'FILTERED'
  | 'MANUAL_REVIEW';

export type IssueCategory =
  | 'PARSE_ERROR'
  | 'BUSINESS_RULE'
  | 'DUPLICATE'
  | 'FILTER'
  | 'CONSISTENCY';

// ─── Individual row issue (detailed) ──────────────────────────────────────────

export class RowIssueDto {
  @ApiProperty({
    example: 5,
    description: 'Número de fila en el archivo (fila 1 = encabezados, fila 2 = primer dato).',
  })
  rowNumber!: number;

  @ApiProperty({
    example: '8',
    description: 'Valor del campo quoteId para esta fila, o "N/A" si no es legible.',
  })
  quoteId!: string;

  @ApiProperty({
    enum: ['CRITICAL', 'WARNING', 'DUPLICATE', 'FILTERED', 'MANUAL_REVIEW'],
    example: 'CRITICAL',
    description:
      'CRITICAL = fila descartada. WARNING = fila conservada con advertencia. ' +
      'DUPLICATE = quoteId repetido (se conserva la primera aparición). ' +
      'FILTERED = eliminada por el filtro Completed+Sell+BOB. ' +
      'MANUAL_REVIEW = monto supera el umbral de revisión manual.',
  })
  severity!: IssueSeverity;

  @ApiProperty({
    enum: ['PARSE_ERROR', 'BUSINESS_RULE', 'DUPLICATE', 'FILTER', 'CONSISTENCY'],
    example: 'PARSE_ERROR',
  })
  category!: IssueCategory;

  @ApiProperty({
    example: 'Fecha de creación',
    description: 'Campo específico afectado por el problema.',
  })
  field!: string;

  @ApiProperty({
    example: 'Fila 5: formato de fecha inválido en "Fecha de creación". Valor recibido: "15-04-2025".',
    description: 'Descripción detallada del problema.',
  })
  message!: string;
}

// ─── Grouped issue (summary per issue type) ────────────────────────────────────

export class IssueGroupDto {
  @ApiProperty({
    enum: ['CRITICAL', 'WARNING', 'DUPLICATE', 'FILTERED', 'MANUAL_REVIEW'],
    example: 'MANUAL_REVIEW',
  })
  severity!: IssueSeverity;

  @ApiProperty({
    enum: ['PARSE_ERROR', 'BUSINESS_RULE', 'DUPLICATE', 'FILTER', 'CONSISTENCY'],
    example: 'BUSINESS_RULE',
  })
  category!: IssueCategory;

  @ApiProperty({
    example: 'Monto Pagado',
    description: 'Campo o regla que generó este grupo de problemas.',
  })
  field!: string;

  @ApiProperty({
    example: 12,
    description: 'Cantidad de filas afectadas por este tipo de problema.',
  })
  count!: number;

  @ApiProperty({
    example:
      '12 transacciones superan el umbral de revisión manual de 5,000 Bs. Son válidas pero requieren aprobación humana antes de pagar el cashback.',
    description: 'Descripción en español del problema y su impacto.',
  })
  description!: string;

  @ApiProperty({
    type: [Number],
    example: [15, 23, 47, 88, 102],
    description:
      'Números de fila afectados (máximo 20). Si hay más, consultar el campo moreRowsExist.',
  })
  affectedRows!: number[];

  @ApiProperty({
    example: false,
    description: 'true si existen más filas afectadas además de las listadas en affectedRows.',
  })
  moreRowsExist!: boolean;
}

// ─── Header validation ─────────────────────────────────────────────────────────

export class HeaderValidationDto {
  @ApiProperty({ example: true, description: 'true si todos los encabezados requeridos están presentes.' })
  valid!: boolean;

  @ApiProperty({ example: 15, description: 'Cantidad de columnas esperadas.' })
  expectedCount!: number;

  @ApiProperty({ example: 15, description: 'Cantidad de columnas encontradas en el archivo.' })
  foundCount!: number;

  @ApiProperty({
    type: [String],
    example: [],
    description: 'Columnas requeridas que no se encontraron. El archivo no puede procesarse si esta lista no está vacía.',
  })
  missingHeaders!: string[];

  @ApiProperty({
    type: [String],
    example: [],
    description: 'Columnas encontradas en el archivo que no eran esperadas. Solo informativo.',
  })
  extraHeaders!: string[];
}

// ─── Filter breakdown ──────────────────────────────────────────────────────────

export class FilterBreakdownDto {
  @ApiProperty({ example: 5325, description: 'Total de filas de datos extraídas del archivo.' })
  totalRawRows!: number;

  @ApiProperty({ example: 87, description: 'Filas con estado distinto a "Completed".' })
  failStatusFilter!: number;

  @ApiProperty({ example: 0, description: 'Filas con dirección distinta a "Sell".' })
  failSideFilter!: number;

  @ApiProperty({ example: 0, description: 'Filas con moneda distinta a "BOB".' })
  failCurrencyFilter!: number;

  @ApiProperty({
    example: 87,
    description: 'Total de filas eliminadas por el filtro triple (estado + dirección + moneda).',
  })
  totalFilteredOut!: number;

  @ApiProperty({ example: 88, description: 'Cantidad de quoteIds duplicados encontrados.' })
  duplicatesFound!: number;

  @ApiProperty({
    example: 5238,
    description: 'Estimado de filas netas que quedarán cargadas (post-filtro y post-deduplicación).',
  })
  estimatedRowsAfterProcessing!: number;
}

// ─── Summary ───────────────────────────────────────────────────────────────────

export class ValidationSummaryDto {
  @ApiProperty({ example: 5325, description: 'Total de filas de datos en el archivo.' })
  totalRawRows!: number;

  @ApiProperty({
    example: true,
    description:
      'true si el archivo tiene todos los encabezados y ningún error crítico. ' +
      'Las filas filtradas y duplicadas son esperadas y no bloquean el procesamiento.',
  })
  readyForProcessing!: boolean;

  @ApiProperty({ example: 0, description: 'Filas que serán descartadas por errores de parseo o reglas de negocio.' })
  criticalIssues!: number;

  @ApiProperty({ example: 1, description: 'Filas conservadas pero con advertencias.' })
  warnings!: number;

  @ApiProperty({ example: 88, description: 'Ocurrencias de quoteId duplicado (se conserva la primera).' })
  duplicates!: number;

  @ApiProperty({ example: 87, description: 'Filas eliminadas por el filtro Completed+Sell+BOB.' })
  filteredRows!: number;

  @ApiProperty({ example: 5238, description: 'Filas netas estimadas luego de filtrar y deduplicar.' })
  estimatedRowsAfterProcessing!: number;

  @ApiProperty({
    example: 12,
    description: 'Filas cuyo monto en BOB supera el umbral de revisión manual. Válidas, pero requieren aprobación humana.',
  })
  manualReviewRows!: number;

  @ApiProperty({ example: 5000, description: 'Umbral en BOB utilizado para marcar revisión manual.' })
  manualReviewThreshold!: number;
}

// ─── Top-level report ──────────────────────────────────────────────────────────

export class ValidationReportDto {
  @ApiProperty({ example: '1_-_Pago_QR.xlsx' })
  fileName!: string;

  @ApiProperty({ example: 'xlsx', enum: ['csv', 'xlsx'] })
  fileFormat!: string;

  @ApiProperty({ example: '2026-05-16T23:00:00.000Z' })
  validatedAt!: Date;

  @ApiProperty({ type: ValidationSummaryDto })
  summary!: ValidationSummaryDto;

  @ApiProperty({
    type: [String],
    description: 'Mensajes de alto nivel en español con el resultado general de la validación.',
    example: [
      '✓ El archivo está listo para ser cargado. No se encontraron errores críticos.',
      '⚠ 12 transacciones superan los 5,000 Bs y requieren revisión manual.',
      'ℹ 88 registros duplicados detectados — se conservará la primera ocurrencia de cada quoteId.',
      'ℹ 87 filas serán descartadas por tener estado distinto a "Completed".',
      'ℹ Se estiman 5,150 filas netas luego del filtrado y deduplicación.',
    ],
  })
  insights!: string[];

  @ApiProperty({ type: HeaderValidationDto })
  headerValidation!: HeaderValidationDto;

  @ApiProperty({ type: FilterBreakdownDto })
  filterBreakdown!: FilterBreakdownDto;

  @ApiProperty({
    type: [IssueGroupDto],
    description:
      'Problemas agrupados por tipo. Cada grupo indica cuántas filas están afectadas y por qué.',
  })
  groupedIssues!: IssueGroupDto[];

  @ApiProperty({
    type: [RowIssueDto],
    description:
      'Detalle individual por fila (máximo 100 entradas). Para el resumen ejecutivo usar groupedIssues.',
  })
  rowIssues!: RowIssueDto[];

  @ApiProperty({ example: 176, description: 'Total de problemas encontrados en todas las filas.' })
  totalIssueCount!: number;

  @ApiProperty({
    example: true,
    description: 'true si hay más de 100 problemas. Solo se devuelven los primeros 100 en rowIssues.',
  })
  issuesTruncated!: boolean;
}
