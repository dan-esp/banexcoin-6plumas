import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { RequestWithClerkAuth } from '../auth/clerk-auth.guard.js';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { BatchProcessService, ProcessBatchDto } from './batch-process.service.js';
import { TierLevelDto } from '../processing/dto/tier-level.dto.js';

@ApiTags('batches')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token.' })
@Controller('batches')
export class BatchController {
  constructor(private readonly batchProcessService: BatchProcessService) {}

  @Post('process')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload file, run full ETL + cashback pipeline, and persist results',
    description:
      'Accepts a CSV or Excel file (must contain the "Pago QR" sheet) along with cashback ' +
      'configuration. Automatically cleans data, removes duplicates, validates rows, ' +
      'calculates cashback by account tier, and saves the full batch to storage. ' +
      'Returns a batchId plus the complete cashback report.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'batchName', 'tiers', 'minimumBob'],
      properties: {
        file: { type: 'string', format: 'binary', description: 'CSV or Excel with Pago QR sheet' },
        batchName: { type: 'string', example: 'April 2025', description: 'Human-readable batch label' },
        tiers: {
          type: 'string',
          example: '[{"name":"Nivel 1","minBob":500,"maxBob":1500,"rate":0.01},{"name":"Nivel 2","minBob":1500,"maxBob":5000,"rate":0.015},{"name":"Nivel 3","minBob":5000,"maxBob":999999999,"rate":0.02}]',
          description: 'JSON array of cashback tier definitions',
        },
        minimumBob: { type: 'number', example: 500, description: 'Minimum monthly BOB to qualify' },
        outputFxRate: { type: 'number', example: 13.5, description: 'Optional: payout FX rate BOB/USDT (omit to use weighted average from transactions)' },
        manualReviewThreshold: { type: 'number', example: 5000, description: 'Optional: BOB threshold for flagging high-value transactions (default 5000)' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Batch processed and saved. Returns batchId + full cashback report.' })
  @ApiResponse({ status: 400, description: 'Invalid file, missing columns, or bad tier config.' })
  @ApiResponse({ status: 422, description: 'No eligible rows found after filtering.' })
  async process(
    @UploadedFile() file: Express.Multer.File,
    @Body('batchName') batchName: string,
    @Body('tiers') tiersRaw: string,
    @Body('minimumBob') minimumBobRaw: string,
    @Body('outputFxRate') outputFxRateRaw?: string,
    @Body('manualReviewThreshold') manualReviewThresholdRaw?: string,
    @Req() req?: RequestWithClerkAuth,
  ) {
    if (!file) {
      throw new BadRequestException('A file is required.');
    }
    if (!batchName || batchName.trim().length === 0) {
      throw new BadRequestException('batchName is required.');
    }
    if (!tiersRaw) {
      throw new BadRequestException('tiers is required (JSON string).');
    }
    if (!minimumBobRaw) {
      throw new BadRequestException('minimumBob is required.');
    }

    let tiers: TierLevelDto[];
    try {
      tiers = JSON.parse(tiersRaw) as TierLevelDto[];
    } catch {
      throw new BadRequestException('tiers must be a valid JSON array.');
    }

    const minimumBob = parseFloat(minimumBobRaw);
    if (isNaN(minimumBob) || minimumBob < 0) {
      throw new BadRequestException('minimumBob must be a non-negative number.');
    }

    const outputFxRate = outputFxRateRaw ? parseFloat(outputFxRateRaw) : undefined;
    const manualReviewThreshold = manualReviewThresholdRaw
      ? parseFloat(manualReviewThresholdRaw)
      : undefined;

    const dto: ProcessBatchDto = {
      batchName: batchName.trim(),
      tiers,
      minimumBob,
      outputFxRate,
      manualReviewThreshold,
    };

    return this.batchProcessService.process(file, dto, req?.auth?.token);
  }
}
