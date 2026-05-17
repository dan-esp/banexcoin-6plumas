import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CurrentOracleRateResponseDto,
  LockedOracleContextResponseDto,
} from './dto/oracle-rate-response.dto';
import { OverrideOracleRateDto } from './dto/override-oracle-rate.dto';
import { ORACLE_ROUTES } from './oracle.constants';
import { OracleService } from './oracle.service';

@ApiTags('oracle')
@Controller()
export class OracleController {
  constructor(private readonly oracleService: OracleService) {}

  @ApiOperation({
    summary: 'Fetch and validate the current USDT/BOB oracle rate',
  })
  @ApiOkResponse({ type: CurrentOracleRateResponseDto })
  @ApiBadRequestResponse({
    description: 'Provider payload is reachable but invalid',
  })
  @ApiServiceUnavailableResponse({
    description: 'Configured oracle provider is unavailable',
  })
  @Get(ORACLE_ROUTES.CURRENT)
  getCurrentRate() {
    return this.oracleService.getCurrentRate();
  }

  @ApiOperation({
    summary: 'Lock the current live oracle context onto a batch',
  })
  @ApiParam({ name: 'batchId' })
  @ApiOkResponse({ type: LockedOracleContextResponseDto })
  @ApiBadRequestResponse({
    description: 'Provider payload is reachable but invalid',
  })
  @ApiNotFoundResponse({ description: 'Batch was not found' })
  @ApiConflictResponse({ description: 'Batch is immutable or already locked' })
  @ApiServiceUnavailableResponse({
    description: 'Configured oracle provider is unavailable',
  })
  @Post(ORACLE_ROUTES.LOCK_BATCH)
  lockBatchRate(@Param('batchId') batchId: string) {
    return this.oracleService.lockBatchRate(batchId);
  }

  @ApiOperation({
    summary: 'Apply a validated manual oracle override to a batch',
  })
  @ApiParam({ name: 'batchId' })
  @ApiOkResponse({ type: LockedOracleContextResponseDto })
  @ApiBadRequestResponse({ description: 'Manual override input is invalid' })
  @ApiNotFoundResponse({ description: 'Batch was not found' })
  @ApiConflictResponse({ description: 'Batch is immutable or already locked' })
  @Post(ORACLE_ROUTES.OVERRIDE_BATCH)
  overrideBatchRate(
    @Param('batchId') batchId: string,
    @Body() dto: OverrideOracleRateDto,
  ) {
    return this.oracleService.overrideBatchRate(batchId, dto);
  }

  @ApiOperation({
    summary: 'Read the locked oracle context for finance review',
  })
  @ApiParam({ name: 'batchId' })
  @ApiOkResponse({ type: LockedOracleContextResponseDto })
  @ApiNotFoundResponse({ description: 'Batch was not found' })
  @Get(ORACLE_ROUTES.BATCH_CONTEXT)
  getBatchOracleContext(@Param('batchId') batchId: string) {
    return this.oracleService.getBatchOracleContext(batchId);
  }
}
