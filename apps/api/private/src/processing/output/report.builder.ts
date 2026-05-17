import { Injectable } from '@nestjs/common';
import { ProcessingReportDto } from '../dto/processing-report.dto.js';
import { BanexTransferLineDto } from '../dto/banex-transfer-line.dto.js';
import { PipelineContext } from '../pipeline/pipeline-context.js';
import { ClassifiedUser } from '../pipeline/tier-classification.step.js';

export interface ExtendedContext extends PipelineContext {
  classifiedUsers: ClassifiedUser[];
}

/**
 * Builder pattern: assembles the final ProcessingReportDto from the completed pipeline context.
 *
 * Responsibilities:
 *   - Map audit counters to the response shape
 *   - Count qualifying vs non-qualifying users
 *   - Attach per-user results and BanexTransfer lines
 */
@Injectable()
export class ReportBuilder {
  build(ctx: ExtendedContext): ProcessingReportDto {
    const qualifying = ctx.userResults.length;
    const total = ctx.classifiedUsers.length;
    const notQualifying = total - qualifying;

    const banexTransferLines: BanexTransferLineDto[] = ctx.userResults.map((r) => ({
      accountId: r.accountId,
      username: r.username,
      cashbackUsdt: r.cashbackUsdt,
    }));

    return {
      period: ctx.config.period,
      calculatedAt: new Date(),
      audit: {
        totalRowsFromStore: ctx.audit.totalInput,
        rowsAfterTripleFilter: ctx.audit.rowsAfterTripleFilter,
        rowsDiscardedByValidation:
          ctx.audit.rowsAfterTripleFilter - ctx.audit.rowsAfterValidation,
        duplicatesDropped: ctx.audit.duplicatesDropped,
        rowsProcessed:
          ctx.audit.rowsAfterValidation - ctx.audit.duplicatesDropped,
        manualReviewTransactions: ctx.audit.manualReviewCount,
      },
      warnings: ctx.warnings,
      errors: ctx.criticalErrors,
      totalUsersAnalyzed: total,
      usersQualifyingForCashback: qualifying,
      usersNotQualifying: notQualifying,
      results: ctx.userResults,
      banexTransferLines,
    };
  }
}
