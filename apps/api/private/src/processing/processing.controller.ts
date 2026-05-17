import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CalculateRequestDto } from './dto/calculate-request.dto.js';
import { ProcessingReportDto } from './dto/processing-report.dto.js';
import { ProcessingService } from './processing.service.js';

@ApiTags('Processing — Cashback Calculation')
@Controller('processing')
export class ProcessingController {
  constructor(private readonly processingService: ProcessingService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /processing/calculate
  // ─────────────────────────────────────────────────────────────────────────────
  @Post('calculate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Run the full cashback calculation pipeline',
    description:
      'Reads the QR Payment rows loaded by the ETL stage, runs the complete business logic pipeline, ' +
      'and returns a structured cashback report.\n\n' +
      '**Pipeline steps executed:**\n' +
      '1. Pre-flight config validation (BL-PRE-001..006) — throws 400 on bad config\n' +
      '2. Scope filter — reads QrPaymentRow[] from ETL store (throws 422 if empty)\n' +
      '3. Triple business filter — Completed + Sell + BOB\n' +
      '4. Field-level row validation — BL-005..011 (critical errors discard row)\n' +
      '5. Deduplication — Set-based O(n) by quoteId\n' +
      '6. Aggregation — totalBob per accountId\n' +
      '7. Tier classification — assigns tier or marks as non-qualifying\n' +
      '8. Cashback calculation — BOB and USDT amounts\n\n' +
      '**Upload your file first:** `POST /api/v1/etl/upload/qr-payments`',
  })
  @ApiBody({
    type: CalculateRequestDto,
    examples: {
      standard: {
        summary: 'Standard 3-tier config (Hackaton 2026 parameters)',
        value: {
          period: 'April 2025',
          minimumBob: 500,
          manualReviewThreshold: 5000,
          outputFxRate: 13.5,
          tiers: [
            { name: 'Nivel 1', minBob: 500, maxBob: 1500, rate: 0.01 },
            { name: 'Nivel 2', minBob: 1500, maxBob: 5000, rate: 0.015 },
            { name: 'Nivel 3', minBob: 5000, maxBob: 999999999, rate: 0.02 },
          ],
        },
      },
      singleTier: {
        summary: 'Flat 2% cashback for everyone above 100 Bs',
        value: {
          period: 'May 2025',
          minimumBob: 100,
          outputFxRate: 13.8,
          tiers: [{ name: 'Único', minBob: 100, maxBob: 999999999, rate: 0.02 }],
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Calculation completed. Returns audit log, per-user results, and BanexTransfer lines.',
    type: ProcessingReportDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Invalid tier configuration (BL-PRE-001..006). The pipeline did not start. ' +
      'Fix the config and retry.',
    schema: {
      example: {
        statusCode: 400,
        message:
          "Tier gap or overlap between 'Nivel 1' (maxBob=1500) and 'Nivel 2' (minBob=2000).",
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description:
      'Config is valid but the ETL store has no QR Payment rows. ' +
      'Upload the file first using POST /api/v1/etl/upload/qr-payments.',
    schema: {
      example: {
        statusCode: 422,
        message:
          'No QR Payment rows found in the store. Upload a file first using POST /api/v1/etl/upload/qr-payments.',
        error: 'Unprocessable Entity',
      },
    },
  })
  async calculate(@Body() dto: CalculateRequestDto): Promise<ProcessingReportDto> {
    return this.processingService.calculate(dto);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /processing/last-result
  // ─────────────────────────────────────────────────────────────────────────────
  @Get('last-result')
  @ApiOperation({
    summary: 'Retrieve the cached result from the most recent calculation',
    description:
      'Returns the in-memory cached report from the last successful `POST /processing/calculate` call. ' +
      'Useful for re-inspecting the results without re-running the pipeline. ' +
      'The cache is cleared when the server restarts.',
  })
  @ApiOkResponse({
    description: 'Cached calculation result.',
    type: ProcessingReportDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No calculation has been run in this server session yet.',
    schema: {
      example: {
        statusCode: 404,
        message:
          'No calculation has been run yet. Call POST /api/v1/processing/calculate first.',
        error: 'Not Found',
      },
    },
  })
  getLastResult(): ProcessingReportDto {
    return this.processingService.getLastResult();
  }
}
