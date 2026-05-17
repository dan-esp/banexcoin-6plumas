import { ApiProperty } from '@nestjs/swagger';

export class OverrideOracleRateDto {
  @ApiProperty({ example: 6.96 })
  rate: number | string;

  @ApiProperty({ example: 'finance-operator-1' })
  operatorId: string;

  @ApiProperty({
    example: 'Treasury approved manual quote for the payout batch',
  })
  reason: string;
}
