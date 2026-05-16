import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  ParseEnumPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { EntityType } from '../common/enums/entity-type.enum.js';
import { EtlService } from './etl.service.js';
import { UploadResponseDto } from './dto/upload-response.dto.js';

@ApiTags('ETL — File Ingestion')
@Controller('etl')
export class EtlController {
  constructor(private readonly etlService: EtlService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /etl/upload/:entityType
  // ─────────────────────────────────────────────────────────────────────────────
  @Post('upload/:entityType')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 50 * 1024 * 1024 },
      storage: undefined,
    }),
  )
  @ApiOperation({
    summary: 'Upload a CSV or XLSX file for a given entity type',
    description:
      'Extracts rows from the uploaded file, transforms them into typed domain objects, ' +
      'and stores the result in memory. Existing data for the entity type is replaced. ' +
      'For QR Payments: duplicate quoteIds are discarded (first wins) and only ' +
      '"Completed" status rows are kept.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'entityType',
    enum: EntityType,
    description: 'The entity type the file contains data for.',
    example: EntityType.QR_PAYMENTS,
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'CSV or XLSX file containing the transaction rows.',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'File processed successfully.',
    type: UploadResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid entity type, unsupported file format, or parse failure.',
  })
  async upload(
    @Param('entityType', new ParseEnumPipe(EntityType)) entityType: EntityType,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded. Send the file as form-data field "file".');
    }
    return this.etlService.processUpload(file, entityType);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /etl/status
  // ─────────────────────────────────────────────────────────────────────────────
  @Get('status')
  @ApiOperation({
    summary: 'Row counts for all loaded entity types',
    description:
      'Returns the number of rows currently held in memory for each entity type that ' +
      'has been uploaded in this server session. Entity types not yet loaded are omitted.',
  })
  @ApiOkResponse({
    description: 'Snapshot of row counts per entity type.',
    schema: {
      type: 'object',
      example: { 'qr-payments': 5238 },
      additionalProperties: { type: 'number' },
    },
  })
  status(): Record<string, number> {
    return this.etlService.status();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GET /etl/preview/:entityType
  // ─────────────────────────────────────────────────────────────────────────────
  @Get('preview/:entityType')
  @ApiOperation({
    summary: 'Preview first 10 parsed rows for an entity type',
    description:
      'Returns up to 10 typed rows from the in-memory store for quick validation ' +
      'that the file was parsed correctly. Upload the file first.',
  })
  @ApiParam({
    name: 'entityType',
    enum: EntityType,
    description: 'The entity type to preview.',
    example: EntityType.QR_PAYMENTS,
  })
  @ApiOkResponse({
    description: 'Array of up to 10 typed rows.',
    schema: {
      type: 'array',
      items: { type: 'object' },
      example: [
        {
          quoteId: 8,
          createdAt: '2025-04-15T13:01:55.000Z',
          status: 'Completed',
          side: 'Sell',
          username: 'VictorFernandez452024',
          accountId: 10001,
          amountUsdt: 0.38,
          amountBob: 5,
          currency: 'BOB',
          fxRate: 13.21,
          commission: 0.03,
          updatedAt: '2025-04-15T09:02:17.000Z',
          transactionId: '207681530',
          serviceType: 'S-001',
          oms: 'Banexcoin Bolivia',
        },
      ],
    },
  })
  preview(
    @Param('entityType', new ParseEnumPipe(EntityType)) entityType: EntityType,
  ): unknown[] {
    return this.etlService.preview(entityType);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DELETE /etl/clear/:entityType
  // ─────────────────────────────────────────────────────────────────────────────
  @Delete('clear/:entityType')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Clear in-memory store for an entity type',
    description:
      'Removes all rows stored for the given entity type. ' +
      'Upload the file again to reload. Useful when re-running the ETL with corrected data.',
  })
  @ApiParam({
    name: 'entityType',
    enum: EntityType,
    description: 'The entity type to clear.',
    example: EntityType.QR_PAYMENTS,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Store cleared successfully.',
  })
  clear(
    @Param('entityType', new ParseEnumPipe(EntityType)) entityType: EntityType,
  ): void {
    this.etlService.clear(entityType);
  }
}
