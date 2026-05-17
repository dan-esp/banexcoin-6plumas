import { ApiProperty } from '@nestjs/swagger';

export class BanexTransferLineDto {
  @ApiProperty({ example: 10001, description: 'Destination account for the BanexTransfer.' })
  accountId: number;

  @ApiProperty({ example: 'VictorFernandez452024' })
  username: string;

  @ApiProperty({
    example: 0.926,
    description: 'USDT amount to transfer to this account (cashbackUsdt, rounded to 6 decimal places).',
  })
  cashbackUsdt: number;
}
