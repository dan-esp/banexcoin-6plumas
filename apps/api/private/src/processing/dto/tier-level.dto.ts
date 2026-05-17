import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min, Max, IsNotEmpty } from 'class-validator';

export class TierLevelDto {
  @ApiProperty({
    example: 'Nivel 1',
    description: 'Human-readable tier name used in the report output.',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 500,
    description: 'Inclusive lower bound in BOB. Must be >= 0.',
  })
  @IsNumber()
  @Min(0)
  minBob: number;

  @ApiProperty({
    example: 1500,
    description:
      'Exclusive upper bound in BOB. Must be > minBob. Use 999999999 for the last (open-ended) tier.',
  })
  @IsNumber()
  maxBob: number;

  @ApiProperty({
    example: 0.01,
    description: 'Cashback rate as a decimal. 0.01 = 1%. Must be > 0 and <= 1.',
  })
  @IsNumber()
  @Min(0.000001)
  @Max(1)
  rate: number;
}
