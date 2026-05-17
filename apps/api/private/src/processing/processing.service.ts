import { Injectable, NotFoundException } from '@nestjs/common';
import { CalculateRequestDto } from './dto/calculate-request.dto.js';
import { ProcessingReportDto } from './dto/processing-report.dto.js';
import { ConfigValidator } from './validators/config.validator.js';
import { ScopeFilterStep } from './pipeline/scope-filter.step.js';
import { BusinessFilterStep } from './pipeline/business-filter.step.js';
import { RowValidationStep } from './pipeline/row-validation.step.js';
import { DeduplicationStep } from './pipeline/deduplication.step.js';
import { AggregationStep } from './pipeline/aggregation.step.js';
import { TierClassificationStep } from './pipeline/tier-classification.step.js';
import { CashbackCalculationStep } from './pipeline/cashback-calculation.step.js';
import { ReportBuilder } from './output/report.builder.js';
import { createInitialContext, PipelineContext } from './pipeline/pipeline-context.js';

/**
 * Orchestrates the Stage 2 business logic pipeline.
 *
 * Chain of Responsibility: each step receives PipelineContext and returns
 * an updated context. Steps are decoupled — adding or reordering one requires
 * no changes to any other step or to this service beyond the call sequence.
 *
 * The last successful result is cached in memory for retrieval via GET /last-result.
 */
@Injectable()
export class ProcessingService {
  private lastResult: ProcessingReportDto | null = null;

  constructor(
    private readonly configValidator: ConfigValidator,
    private readonly scopeFilter: ScopeFilterStep,
    private readonly businessFilter: BusinessFilterStep,
    private readonly rowValidation: RowValidationStep,
    private readonly deduplication: DeduplicationStep,
    private readonly aggregation: AggregationStep,
    private readonly tierClassification: TierClassificationStep,
    private readonly cashbackCalculation: CashbackCalculationStep,
    private readonly reportBuilder: ReportBuilder,
  ) {}

  /**
   * Runs the full ETL → business logic pipeline:
   *  1. Pre-flight config validation (throws on bad config)
   *  2. Scope filter    — load rows from EtlStore
   *  3. Business filter — Completed + Sell + BOB
   *  4. Row validation  — field-level checks (BL-005..011)
   *  5. Deduplication   — Set-based by quoteId
   *  6. Aggregation     — group by accountId
   *  7. Tier classification — assign tier per user
   *  8. Cashback calculation — compute BOB + USDT
   *  9. Report builder  — assemble final response
   */
  async calculate(dto: CalculateRequestDto): Promise<ProcessingReportDto> {
    const config = this.configValidator.validate(dto);

    let ctx: PipelineContext = createInitialContext(config);

    ctx = this.scopeFilter.process(ctx);
    ctx = this.businessFilter.process(ctx);
    ctx = this.rowValidation.process(ctx);
    ctx = this.deduplication.process(ctx);
    ctx = this.aggregation.process(ctx);

    const ctxWithTiers = this.tierClassification.process(ctx);
    const ctxFinal = this.cashbackCalculation.process(ctxWithTiers);

    const report = this.reportBuilder.build({
      ...ctxFinal,
      classifiedUsers: ctxWithTiers.classifiedUsers,
    });

    this.lastResult = report;
    return report;
  }

  /** Returns the cached result from the most recent successful calculation. */
  getLastResult(): ProcessingReportDto {
    if (!this.lastResult) {
      throw new NotFoundException(
        'No calculation has been run yet. ' +
          'Call POST /api/v1/processing/calculate first.',
      );
    }
    return this.lastResult;
  }
}
