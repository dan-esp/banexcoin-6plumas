import { Injectable } from '@nestjs/common';
import { RowValidator } from '../validators/row.validator.js';
import { PipelineContext } from './pipeline-context.js';
import { QrPaymentRow } from '../../common/interfaces/entity-rows.interface.js';

/**
 * Step 3 — Field-level business validation (BL-005..011).
 *
 * Each row is evaluated by RowValidator:
 *   - CRITICAL errors → row discarded, error message added to criticalErrors[]
 *   - WARNINGs        → row kept, warning message added to warnings[]
 *
 * A single bad row never aborts the entire pipeline.
 */
@Injectable()
export class RowValidationStep {
  constructor(private readonly rowValidator: RowValidator) {}

  process(ctx: PipelineContext): PipelineContext {
    const validRows: QrPaymentRow[] = [];
    const criticalErrors = [...ctx.criticalErrors];
    const warnings = [...ctx.warnings];

    for (let i = 0; i < ctx.rows.length; i++) {
      const result = this.rowValidator.validate(ctx.rows[i], i);

      if (result.valid) {
        validRows.push(ctx.rows[i]);
      } else {
        criticalErrors.push(...result.errors);
      }

      if (result.warnings.length > 0) {
        warnings.push(...result.warnings);
      }
    }

    const discarded = ctx.rows.length - validRows.length;

    return {
      ...ctx,
      rows: validRows,
      warnings,
      criticalErrors,
      audit: {
        ...ctx.audit,
        rowsAfterValidation: validRows.length,
      },
    };
  }
}
