import { Injectable } from '@nestjs/common';
import { UserAggregate, PipelineContext } from './pipeline-context.js';

/**
 * Step 5 — User aggregation.
 *
 * Groups all rows by accountId and accumulates:
 *   - totalBob           — sum of amountBob (primary field for tier classification)
 *   - transactionCount   — number of valid transactions
 *   - manualReviewTransactions — count of individual txns where amountBob > threshold
 *   - fxRateWeightedSum  — used to compute a fallback average fxRate if outputFxRate not given
 *
 * Uses username from the first row seen for each accountId (rows are ordered).
 */
@Injectable()
export class AggregationStep {
  process(ctx: PipelineContext): PipelineContext {
    const aggregateMap = new Map<number, UserAggregate>();
    const threshold = ctx.config.manualReviewThreshold;

    for (const row of ctx.rows) {
      const existing = aggregateMap.get(row.accountId);

      if (existing) {
        existing.totalBob += row.amountBob;
        existing.transactionCount += 1;
        existing.fxRateWeightedSum += row.fxRate;
        if (row.amountBob > threshold) {
          existing.manualReviewTransactions += 1;
        }
      } else {
        aggregateMap.set(row.accountId, {
          accountId: row.accountId,
          username: row.username,
          totalBob: row.amountBob,
          transactionCount: 1,
          manualReviewTransactions: row.amountBob > threshold ? 1 : 0,
          fxRateWeightedSum: row.fxRate,
        });
      }
    }

    const totalManualReview = ctx.rows.filter(
      (r) => r.amountBob > threshold,
    ).length;

    return {
      ...ctx,
      userAggregates: Array.from(aggregateMap.values()),
      audit: { ...ctx.audit, manualReviewCount: totalManualReview },
    };
  }
}
