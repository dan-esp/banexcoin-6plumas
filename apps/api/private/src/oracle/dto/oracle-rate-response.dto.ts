import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type {
  OracleMode,
  OracleRateContext,
  OracleStatus,
} from '../oracle.types';

export class CurrentOracleRateResponseDto {
  @ApiPropertyOptional({ example: 6.96 })
  rate?: number;

  @ApiPropertyOptional({ example: 'dolaresabolivianos-p2p-demo' })
  source?: string;

  @ApiPropertyOptional({ example: '2026-05-16T12:00:00.000Z' })
  fetchedAt?: Date;

  @ApiProperty({ enum: ['live', 'manual'], example: 'live' })
  mode: OracleMode;

  @ApiProperty({
    enum: [
      'valid',
      'missing_rate',
      'invalid_rate',
      'missing_timestamp',
      'missing_source',
      'stale',
      'out_of_range',
      'provider_error',
    ],
    example: 'valid',
  })
  status: OracleStatus;
}

export class LockedOracleContextResponseDto extends CurrentOracleRateResponseDto {
  @ApiPropertyOptional({ example: 'Treasury approved quote' })
  reason?: string;

  @ApiPropertyOptional({ example: 'finance-operator-1' })
  operatorId?: string;

  @ApiPropertyOptional({ example: '2026-05-16T12:05:00.000Z' })
  lockedAt?: Date;
}

export const toCurrentOracleRateResponseDto = (
  context: OracleRateContext,
): CurrentOracleRateResponseDto => ({
  rate: context.rate,
  source: context.source,
  fetchedAt: context.fetchedAt,
  mode: context.mode,
  status: context.status,
});

export const toLockedOracleContextResponseDto = (
  context: OracleRateContext,
): LockedOracleContextResponseDto => ({
  ...toCurrentOracleRateResponseDto(context),
  reason: context.reason,
  operatorId: context.operatorId,
  lockedAt: context.lockedAt,
});
