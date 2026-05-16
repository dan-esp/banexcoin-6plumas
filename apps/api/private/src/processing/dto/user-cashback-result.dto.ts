import { ApiProperty } from '@nestjs/swagger';

export class UserCashbackResultDto {
  @ApiProperty({ example: 10001 })
  accountId: number;

  @ApiProperty({ example: 'VictorFernandez452024' })
  username: string;

  @ApiProperty({
    example: 1250.5,
    description: 'Total BOB spent by this user in the period (sum of amountBob across all transactions).',
  })
  totalBob: number;

  @ApiProperty({ example: 'Nivel 1', description: 'Name of the tier this user falls into.' })
  tierName: string;

  @ApiProperty({ example: 0.01, description: 'Cashback rate applied (e.g. 0.01 = 1%).' })
  rate: number;

  @ApiProperty({
    example: 12.51,
    description: 'Cashback amount in BOB (totalBob × rate, rounded to 2 decimal places).',
  })
  cashbackBob: number;

  @ApiProperty({
    example: 0.926,
    description: 'Cashback amount in USDT (cashbackBob / outputFxRate, rounded to 6 decimal places).',
  })
  cashbackUsdt: number;

  @ApiProperty({ example: 48, description: 'Number of valid transactions included in the aggregation.' })
  transactionCount: number;

  @ApiProperty({
    example: 0,
    description: 'Count of individual transactions by this user where amountBob exceeded the manualReviewThreshold.',
  })
  manualReviewTransactions: number;
}
