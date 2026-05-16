import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PipelineContext } from './pipeline-context.js';

/**
 * Step 2 — Triple business filter (BL-002..004).
 *
 * Keeps only rows that satisfy ALL three conditions:
 *   status   === "Completed"
 *   side     === "Sell"
 *   currency === "BOB"
 *
 * Rows that fail any condition are silently discarded — this is expected behavior.
 * The count of discarded rows is recorded in the audit log.
 *
 * Fails if ALL rows are filtered out (nothing left to process).
 */
@Injectable()
export class BusinessFilterStep {
  process(ctx: PipelineContext): PipelineContext {
    const filtered = ctx.rows.filter(
      (row) =>
        row.status === 'Completed' &&
        row.side === 'Sell' &&
        row.currency === 'BOB',
    );

    const filteredOut = ctx.rows.length - filtered.length;
    const warnings = [...ctx.warnings];

    if (filteredOut > 0) {
      warnings.push(
        `Rows discarded by triple filter (Completed+Sell+BOB): ${filteredOut}`,
      );
    }

    if (filtered.length === 0) {
      throw new UnprocessableEntityException(
        'All Pago QR rows were filtered out. ' +
          'No Completed+Sell+BOB rows found. ' +
          'Check the file period or filter criteria.',
      );
    }

    return {
      ...ctx,
      rows: filtered,
      warnings,
      audit: { ...ctx.audit, rowsAfterTripleFilter: filtered.length },
    };
  }
}
