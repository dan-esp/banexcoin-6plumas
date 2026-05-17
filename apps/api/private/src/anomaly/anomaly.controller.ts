import {
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type {
  AnomalyRecord,
  IAnomalyRepository,
} from './interfaces/anomaly-repository.interface.js';
import { DismissAnomalyDto } from './dto/dismiss-anomaly.dto.js';
import type { RequestWithClerkAuth } from '../auth/clerk-auth.guard.js';

@ApiTags('anomalies')
@ApiBearerAuth()
@Controller('anomalies')
export class AnomalyController {
  constructor(
    @Inject('ANOMALY_REPOSITORY')
    private readonly repository: IAnomalyRepository,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List anomalies for a batch',
    description:
      'Returns all anomalies detected by the AI service for the given batch, sorted by score ascending (most anomalous first).',
  })
  @ApiQuery({ name: 'batchId', required: true })
  @ApiResponse({ status: 200, description: 'List of anomalies.' })
  async list(@Query('batchId') batchId: string): Promise<AnomalyRecord[]> {
    if (!batchId) return [];
    return this.repository.findByBatch(batchId);
  }

  @Get(':anomalyId')
  @ApiOperation({ summary: 'Get one anomaly by id' })
  @ApiResponse({ status: 200, description: 'Anomaly detail.' })
  @ApiResponse({ status: 404, description: 'Anomaly not found.' })
  async detail(
    @Param('anomalyId') anomalyId: string,
  ): Promise<AnomalyRecord> {
    const found = await this.repository.findOne(anomalyId);
    if (!found) throw new NotFoundException('anomaly not found');
    return found;
  }

  @Patch(':anomalyId/dismiss')
  @ApiOperation({
    summary: 'Dismiss an anomaly',
    description:
      'Marks the anomaly as reviewed/dismissed. Records the dismissing user and an optional reason.',
  })
  @ApiResponse({ status: 200, description: 'Anomaly dismissed.' })
  @ApiResponse({ status: 404, description: 'Anomaly not found.' })
  async dismiss(
    @Param('anomalyId') anomalyId: string,
    @Body() body: DismissAnomalyDto,
    @Req() req: RequestWithClerkAuth,
  ): Promise<AnomalyRecord> {
    const dismissedBy = req.auth?.userId ?? 'unknown';
    const updated = await this.repository.dismiss(anomalyId, {
      dismissedBy,
      reason: body.reason,
    });
    if (!updated) throw new NotFoundException('anomaly not found');
    return updated;
  }
}
