import { Injectable } from '@nestjs/common';
import { TierLevelDto } from '../dto/tier-level.dto.js';
import { UserAggregate, PipelineContext } from './pipeline-context.js';

export interface ClassifiedUser extends UserAggregate {
  tier: TierLevelDto | null;
  qualifies: boolean;
}

/**
 * Step 6 — Tier classification.
 *
 * For each aggregated user:
 *   1. If totalBob < config.minimumBob → marks as not qualifying, tier = null
 *   2. Otherwise → finds the matching tier (minBob <= totalBob < maxBob)
 *
 * Tiers are sorted ascending by minBob (guaranteed by ConfigValidator).
 * A user whose totalBob exceeds all tier maxBob values is assigned the last tier.
 */
@Injectable()
export class TierClassificationStep {
  process(ctx: PipelineContext): PipelineContext & { classifiedUsers: ClassifiedUser[] } {
    const { tiers, minimumBob } = ctx.config;
    const sortedTiers = [...tiers].sort((a, b) => a.minBob - b.minBob);

    const classifiedUsers: ClassifiedUser[] = ctx.userAggregates.map((user) => {
      if (user.totalBob < minimumBob) {
        return { ...user, tier: null, qualifies: false };
      }

      const tier = this.findTier(user.totalBob, sortedTiers);
      return { ...user, tier, qualifies: tier !== null };
    });

    return { ...ctx, classifiedUsers };
  }

  private findTier(totalBob: number, sortedTiers: TierLevelDto[]): TierLevelDto | null {
    for (const tier of sortedTiers) {
      if (totalBob >= tier.minBob && totalBob < tier.maxBob) {
        return tier;
      }
    }
    return sortedTiers[sortedTiers.length - 1] ?? null;
  }
}
