import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type {
  BatchApprovalSnapshot,
  IBatchRepository,
} from '../interfaces/batch-repository.interface.js';
import { BatchExportPolicy } from './batch-export.policy.js';

export interface BatchApprovalResult {
  batchId: string;
  status: string;
  approval: BatchApprovalSnapshot;
}

@Injectable()
export class BatchApprovalService {
  constructor(
    @Inject('BATCH_REPOSITORY')
    private readonly batchRepository: IBatchRepository,
    private readonly exportPolicy: BatchExportPolicy,
  ) {}

  async approve(
    batchId: string,
    approvedBy: string,
  ): Promise<BatchApprovalResult> {
    const batch = await this.batchRepository.findForExport(batchId);

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    this.exportPolicy.assertCanApprove(batch);

    if (batch.approval) {
      return {
        batchId: batch.batchId,
        status: batch.status,
        approval: batch.approval,
      };
    }

    const approval: BatchApprovalSnapshot = {
      approvedAt: new Date(),
      approvedBy,
      totalUsersAnalyzed: batch.report.totalUsersAnalyzed,
      usersQualifyingForCashback: batch.report.usersQualifyingForCashback,
      totalCashbackUsdt: this.sumUsdt(
        batch.report.banexTransferLines
          .filter((line) => line.cashbackUsdt > 0)
          .map((line) => line.cashbackUsdt.toFixed(6)),
      ),
    };

    const approvedBatch = await this.batchRepository.approve(batchId, approval);

    return {
      batchId: approvedBatch.batchId,
      status: approvedBatch.status,
      approval,
    };
  }

  private sumUsdt(values: string[]): string {
    const totalMicroUsdt = values.reduce((total, value) => {
      const [whole = '0', fraction = ''] = value.split('.');
      const micro = `${fraction}000000`.slice(0, 6);
      return total + BigInt(whole) * 1_000_000n + BigInt(micro);
    }, 0n);

    const whole = totalMicroUsdt / 1_000_000n;
    const fraction = (totalMicroUsdt % 1_000_000n).toString().padStart(6, '0');

    return `${whole}.${fraction}`;
  }
}
