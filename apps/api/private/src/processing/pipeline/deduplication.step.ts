import { Injectable } from '@nestjs/common';
import { QrPaymentRow } from '../../common/interfaces/entity-rows.interface.js';
import { PipelineContext } from './pipeline-context.js';

/**
 * Step 4 — Deduplication (BL-012).
 *
 * Algorithm: SET-BASED — O(n) time, O(n) space.
 * Keeps the first occurrence of each quoteId; later duplicates are discarded.
 *
 * Why first occurrence wins: rows arrive in chronological order by quoteId.
 * The first occurrence is the original transaction; later ones are re-export artifacts.
 *
 * quoteId=0 participates normally — if multiple rows share quoteId=0, only the first is kept.
 *
 * Stage 1 (QrPaymentsMapper) already deduped the raw CSV rows.
 * This step catches any business-level duplicates in the typed rows
 * that may have slipped through (e.g., the 1 real duplicate in the real dataset).
 */
@Injectable()
export class DeduplicationStep {
  process(ctx: PipelineContext): PipelineContext {
    const seen = new Map<number, number>();
    const result: QrPaymentRow[] = [];
    const warnings = [...ctx.warnings];

    for (let i = 0; i < ctx.rows.length; i++) {
      const row = ctx.rows[i];
      const key = row.quoteId;

      if (seen.has(key)) {
        const firstIndex = seen.get(key)!;
        warnings.push(
          `Row ${i}: quoteId=${key} is a duplicate. ` +
            `First seen at row ${firstIndex}. Discarded.`,
        );
      } else {
        seen.set(key, i);
        result.push(row);
      }
    }

    const duplicatesDropped = ctx.rows.length - result.length;

    return {
      ...ctx,
      rows: result,
      warnings,
      audit: { ...ctx.audit, duplicatesDropped },
    };
  }
}
