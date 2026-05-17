import {
  ConflictException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { BatchExportRecord } from '../interfaces/batch-repository.interface.js';

const CALCULATED_STATUSES = new Set(['calculated', 'fx_locked']);
const APPROVED_STATUSES = new Set(['approved', 'exported']);

function normalizeStatus(status: string): string {
  return status.trim().toLowerCase();
}

@Injectable()
export class BatchExportPolicy {
  assertCanApprove(batch: BatchExportRecord): void {
    const status = normalizeStatus(batch.status);

    if (APPROVED_STATUSES.has(status)) {
      return;
    }

    if (!CALCULATED_STATUSES.has(status)) {
      throw new ConflictException({
        error: 'batch_not_ready_for_approval',
        message: 'Only calculated batches can be approved.',
        status: batch.status,
      });
    }

    this.assertNoCriticalErrors(batch);
    this.assertPositivePayoutLines(batch);
  }

  assertCanExport(batch: BatchExportRecord): void {
    const status = normalizeStatus(batch.status);

    if (!APPROVED_STATUSES.has(status)) {
      throw new ConflictException({
        error: 'batch_not_approved',
        message: 'Only approved batches can be exported.',
        status: batch.status,
      });
    }

    this.assertNoCriticalErrors(batch);
    this.assertPositivePayoutLines(batch);
  }

  private assertNoCriticalErrors(batch: BatchExportRecord): void {
    if (batch.report.errors.length > 0) {
      throw new UnprocessableEntityException({
        error: 'batch_has_blocking_errors',
        message:
          'Batches with critical validation errors cannot be approved or exported.',
        blockingErrors: batch.report.errors.length,
      });
    }
  }

  private assertPositivePayoutLines(batch: BatchExportRecord): void {
    const lines = batch.report.banexTransferLines.filter(
      (line) => line.cashbackUsdt > 0,
    );

    if (lines.length === 0) {
      throw new UnprocessableEntityException({
        error: 'batch_has_no_positive_payouts',
        message: 'The batch has no positive cashback rows to export.',
      });
    }
  }
}
