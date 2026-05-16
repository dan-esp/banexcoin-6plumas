import { Injectable } from '@nestjs/common';
import { UserCashbackResultDto } from '../dto/user-cashback-result.dto.js';
import { ClassifiedUser } from './tier-classification.step.js';
import { PipelineContext } from './pipeline-context.js';

export interface ExtendedPipelineContext extends PipelineContext {
  classifiedUsers: ClassifiedUser[];
}

/**
 * Step 7 — Cashback calculation.
 *
 * For each qualifying user:
 *   cashbackBob  = round(totalBob × rate, 2)
 *   cashbackUsdt = round(cashbackBob / effectiveFxRate, 6)
 *
 * effectiveFxRate resolution order:
 *   1. config.outputFxRate (explicitly provided in the request)
 *   2. Weighted average of per-transaction fxRates for this user
 *
 * Results are sorted by totalBob descending (highest spenders first).
 * Non-qualifying users (qualifies: false) are excluded from userResults.
 */
@Injectable()
export class CashbackCalculationStep {
  process(ctx: ExtendedPipelineContext): PipelineContext {
    const results: UserCashbackResultDto[] = [];

    for (const user of ctx.classifiedUsers) {
      if (!user.qualifies || !user.tier) continue;

      const rate = user.tier.rate;
      const cashbackBob = this.round(user.totalBob * rate, 2);

      const effectiveFxRate =
        ctx.config.outputFxRate ??
        user.fxRateWeightedSum / user.transactionCount;

      const cashbackUsdt = this.round(cashbackBob / effectiveFxRate, 6);

      results.push({
        accountId: user.accountId,
        username: user.username,
        totalBob: this.round(user.totalBob, 2),
        tierName: user.tier.name,
        rate,
        cashbackBob,
        cashbackUsdt,
        transactionCount: user.transactionCount,
        manualReviewTransactions: user.manualReviewTransactions,
      });
    }

    results.sort((a, b) => b.totalBob - a.totalBob);

    return { ...ctx, userResults: results };
  }

  private round(value: number, decimals: number): number {
    return Math.round(value * 10 ** decimals) / 10 ** decimals;
  }
}
