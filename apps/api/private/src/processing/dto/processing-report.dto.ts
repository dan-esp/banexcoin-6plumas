import { ApiProperty } from '@nestjs/swagger';
import { UserCashbackResultDto } from './user-cashback-result.dto.js';
import { BanexTransferLineDto } from './banex-transfer-line.dto.js';

export class AuditDto {
  @ApiProperty({ example: 5238, description: 'Total typed rows retrieved from the ETL store.' })
  totalRowsFromStore: number;

  @ApiProperty({ example: 5238, description: 'Rows remaining after Completed + Sell + BOB triple filter.' })
  rowsAfterTripleFilter: number;

  @ApiProperty({ example: 0, description: 'Rows discarded by critical field validation (BL-005..011).' })
  rowsDiscardedByValidation: number;

  @ApiProperty({ example: 1, description: 'Duplicate quoteIds removed by the deduplication step.' })
  duplicatesDropped: number;

  @ApiProperty({ example: 5237, description: 'Final row count that fed into user aggregation.' })
  rowsProcessed: number;

  @ApiProperty({
    example: 12,
    description: 'Count of individual transactions where amountBob exceeded manualReviewThreshold.',
  })
  manualReviewTransactions: number;
}

export class ProcessingReportDto {
  @ApiProperty({ example: 'April 2025' })
  period: string;

  @ApiProperty({ example: '2026-05-16T22:51:00.000Z' })
  calculatedAt: Date;

  @ApiProperty({ type: AuditDto })
  audit: AuditDto;

  @ApiProperty({
    type: [String],
    description:
      'Non-fatal issues detected during processing. Rows with warnings are kept and included in the output.',
    example: [
      'Row 4412: exchange rate inconsistency. Expected amountUsdt ≈ 0.38, got 0.37. Diff=0.01.',
    ],
  })
  warnings: string[];

  @ApiProperty({
    type: [String],
    description: 'Critical validation errors. Affected rows were discarded from the calculation.',
    example: [],
  })
  errors: string[];

  @ApiProperty({ example: 239, description: 'Unique users found after aggregation.' })
  totalUsersAnalyzed: number;

  @ApiProperty({ example: 79, description: 'Users whose totalBob >= minimumBob (qualify for cashback).' })
  usersQualifyingForCashback: number;

  @ApiProperty({ example: 160, description: 'Users whose totalBob < minimumBob (not eligible).' })
  usersNotQualifying: number;

  @ApiProperty({
    type: [UserCashbackResultDto],
    description: 'Cashback results for qualifying users, sorted by totalBob descending.',
  })
  results: UserCashbackResultDto[];

  @ApiProperty({
    type: [BanexTransferLineDto],
    description:
      'BanexTransfer-ready payment lines. One entry per qualifying user, sorted by cashbackUsdt descending. ' +
      'Load this directly into the BanexTransfer mass payment tool.',
  })
  banexTransferLines: BanexTransferLineDto[];
}
