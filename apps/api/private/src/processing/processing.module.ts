import { Module } from '@nestjs/common';
import { EtlModule } from '../etl/etl.module.js';
import { ProcessingController } from './processing.controller.js';
import { ProcessingService } from './processing.service.js';
import { ConfigValidator } from './validators/config.validator.js';
import { RowValidator } from './validators/row.validator.js';
import { ScopeFilterStep } from './pipeline/scope-filter.step.js';
import { BusinessFilterStep } from './pipeline/business-filter.step.js';
import { RowValidationStep } from './pipeline/row-validation.step.js';
import { DeduplicationStep } from './pipeline/deduplication.step.js';
import { AggregationStep } from './pipeline/aggregation.step.js';
import { TierClassificationStep } from './pipeline/tier-classification.step.js';
import { CashbackCalculationStep } from './pipeline/cashback-calculation.step.js';
import { ReportBuilder } from './output/report.builder.js';

@Module({
  imports: [EtlModule],
  controllers: [ProcessingController],
  exports: [ProcessingService],
  providers: [
    ProcessingService,
    ConfigValidator,
    RowValidator,
    ScopeFilterStep,
    BusinessFilterStep,
    RowValidationStep,
    DeduplicationStep,
    AggregationStep,
    TierClassificationStep,
    CashbackCalculationStep,
    ReportBuilder,
  ],
})
export class ProcessingModule {}
