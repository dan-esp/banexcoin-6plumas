import { BadRequestException, Injectable } from '@nestjs/common';
import { CalculateRequestDto } from '../dto/calculate-request.dto.js';
import { TierLevelDto } from '../dto/tier-level.dto.js';

/** Immutable tier config used throughout the pipeline after successful validation. */
export interface ValidatedTierConfig {
  period: string;
  tiers: TierLevelDto[];
  minimumBob: number;
  outputFxRate: number | undefined;
  manualReviewThreshold: number;
}

/**
 * Pre-flight validator for the tier configuration (BL-PRE-001..006).
 *
 * Throws BadRequestException with a precise message if any rule fails.
 * The pipeline must not start until this passes.
 */
@Injectable()
export class ConfigValidator {
  validate(dto: CalculateRequestDto): ValidatedTierConfig {
    this.checkTiersNotEmpty(dto.tiers);
    this.checkTierRanges(dto.tiers);
    this.checkTierRates(dto.tiers);
    this.checkTierContiguity(dto.tiers);
    this.checkPeriod(dto.period);
    this.checkOutputFxRate(dto.outputFxRate);

    return {
      period: dto.period.trim(),
      tiers: [...dto.tiers].sort((a, b) => a.minBob - b.minBob),
      minimumBob: dto.minimumBob ?? 0,
      outputFxRate: dto.outputFxRate,
      manualReviewThreshold: dto.manualReviewThreshold ?? 5000,
    };
  }

  /** BL-PRE-001: at least one tier must be provided. */
  private checkTiersNotEmpty(tiers: TierLevelDto[]): void {
    if (!tiers || tiers.length === 0) {
      throw new BadRequestException(
        'Tier configuration is empty. At least one tier is required.',
      );
    }
  }

  /** BL-PRE-002 & BL-PRE-004: each tier must have valid rate and range. */
  private checkTierRanges(tiers: TierLevelDto[]): void {
    for (const tier of tiers) {
      if (tier.minBob < 0 || tier.maxBob <= tier.minBob) {
        throw new BadRequestException(
          `Tier '${tier.name}': minBob=${tier.minBob} >= maxBob=${tier.maxBob}. Invalid range.`,
        );
      }
    }
  }

  /** BL-PRE-002: rate must be a valid positive decimal <= 1. */
  private checkTierRates(tiers: TierLevelDto[]): void {
    for (const tier of tiers) {
      if (typeof tier.rate !== 'number' || tier.rate <= 0 || tier.rate > 1) {
        throw new BadRequestException(
          `Tier '${tier.name}': rate=${tier.rate} is invalid. Must be > 0 and <= 1.`,
        );
      }
    }
  }

  /** BL-PRE-003: tiers must be contiguous — no gaps or overlaps. */
  private checkTierContiguity(tiers: TierLevelDto[]): void {
    const sorted = [...tiers].sort((a, b) => a.minBob - b.minBob);
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];
      if (current.maxBob !== next.minBob) {
        throw new BadRequestException(
          `Tier gap or overlap between '${current.name}' (maxBob=${current.maxBob}) ` +
            `and '${next.name}' (minBob=${next.minBob}).`,
        );
      }
    }
  }

  /** BL-PRE-005: period must be a non-empty string. */
  private checkPeriod(period: string): void {
    if (!period || String(period).trim().length === 0) {
      throw new BadRequestException(
        "Period label is required (e.g. 'April 2025').",
      );
    }
  }

  /** BL-PRE-006: outputFxRate, if provided, must be positive. */
  private checkOutputFxRate(rate: number | undefined): void {
    if (rate !== undefined && rate !== null && rate <= 0) {
      throw new BadRequestException(
        `outputFxRate=${rate} is invalid. Must be greater than 0.`,
      );
    }
  }
}
