import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator.js';
import { BatchOracleService, RealTimeRateResult } from './oracle.service.js';

@ApiTags('exchange-rate')
@Public()
@Controller('exchange-rate')
export class ExchangeRateController {
  constructor(private readonly batchOracleService: BatchOracleService) {}

  @Get()
  @ApiOperation({
    summary: 'Get the current USDT/BOB exchange rate in real time',
    description:
      'Fetches the live rate from the configured external oracle provider. ' +
      'Always returns a valid rate — falls back to ORACLE_FALLBACK_RATE if the ' +
      'provider is unreachable or returns an invalid payload.',
  })
  @ApiOkResponse({
    description: 'Current USDT/BOB rate. usedFallback=true means the live feed was unavailable.',
    schema: {
      type: 'object',
      properties: {
        rate: { type: 'number', example: 13.75 },
        source: { type: 'string', example: 'dolaresabolivianos-p2p-demo' },
        fetchedAt: { type: 'string', example: '2026-05-17T14:30:00.000Z' },
        mode: { type: 'string', enum: ['live', 'manual'], example: 'live' },
        status: { type: 'string', example: 'valid' },
        usedFallback: { type: 'boolean', example: false },
        fallbackReason: { type: 'string', nullable: true },
      },
    },
  })
  getCurrentRate(): Promise<RealTimeRateResult> {
    return this.batchOracleService.getCurrentRate();
  }
}
