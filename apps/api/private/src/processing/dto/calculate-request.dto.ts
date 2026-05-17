import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TierLevelDto } from './tier-level.dto.js';

export class CalculateRequestDto {
  @ApiProperty({
    example: 'April 2025',
    description:
      'Human-readable label for the reporting period. Included in the output report header.',
  })
  @IsString()
  @IsNotEmpty()
  period: string;

  @ApiProperty({
    type: [TierLevelDto],
    description:
      'Cashback tier definitions. Must have at least one tier. Ranges must be contiguous and non-overlapping. ' +
      'The system validates BL-PRE-001 through BL-PRE-004 before touching any data.',
    example: [
      { name: 'Nivel 1', minBob: 500, maxBob: 1500, rate: 0.01 },
      { name: 'Nivel 2', minBob: 1500, maxBob: 5000, rate: 0.015 },
      { name: 'Nivel 3', minBob: 5000, maxBob: 999999999, rate: 0.02 },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TierLevelDto)
  tiers: TierLevelDto[];

  @ApiProperty({
    example: 500,
    description:
      'Minimum monthly spend in BOB for a user to qualify for cashback. ' +
      'Users below this threshold are counted in the audit but excluded from results and BanexTransfer lines.',
  })
  @IsNumber()
  @Min(0)
  minimumBob: number;

  @ApiPropertyOptional({
    example: 13.5,
    description:
      'Exchange rate BOB/USDT used to convert cashback amounts for the BanexTransfer output. ' +
      'If omitted, the weighted average fxRate from the transactions is used.',
  })
  @IsOptional()
  @IsNumber()
  @Min(0.000001)
  outputFxRate?: number;

  @ApiPropertyOptional({
    example: 5000,
    default: 5000,
    description:
      'BOB threshold above which a single transaction is flagged for manual review. ' +
      'Default is 5000. These transactions are counted in the audit log and per-user results.',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  manualReviewThreshold?: number;
}
