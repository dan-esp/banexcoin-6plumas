import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
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
  ApiQuery,
  ApiResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { EntityType } from '../common/enums/entity-type.enum.js';
import { EtlService } from './etl.service.js';
import { UploadResponseDto } from './dto/upload-response.dto.js';
import { ValidationReportDto } from './dto/validation-report.dto.js';

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
  // POST /etl/validate/:entityType
  // ─────────────────────────────────────────────────────────────────────────────
  @Post('validate/:entityType')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 50 * 1024 * 1024 },
      storage: undefined,
    }),
  )
  @ApiOperation({
    summary: 'Validate a CSV or XLSX file without loading it into the store',
    description:
      'Performs a full dry-run analysis of the uploaded file and returns a structured ' +
      'validation report. Nothing is written to the store — the file is only inspected.\n\n' +
      '**Checks performed:**\n' +
      '- **Header validation**: verifies all required columns are present.\n' +
      '- **Parse validation**: attempts to parse every date, amount, and numeric field ' +
      '  and reports rows where parsing fails (CRITICAL).\n' +
      '- **Business rules**: checks required fields are non-empty, amountBob > 0, fxRate > 0.\n' +
      '- **Duplicate detection**: flags rows whose quoteId was already seen (DUPLICATE).\n' +
      '- **Filter simulation**: reports rows that will be discarded by the ' +
      '  Completed + Sell + BOB triple filter (FILTERED).\n\n' +
      '`readyForProcessing: true` when there are zero CRITICAL issues and all required headers are present. ' +
      'FILTERED and DUPLICATE rows are normal and do not block processing.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'entityType',
    enum: EntityType,
    description: 'The entity type the file should contain.',
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
          description: 'CSV or XLSX file to validate.',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Validation report returned. Check summary.readyForProcessing.',
    type: ValidationReportDto,
  })
  @ApiQuery({
    name: 'manualReviewThreshold',
    required: false,
    type: Number,
    example: 5000,
    description:
      'BOB amount above which a single transaction is flagged as MANUAL_REVIEW. ' +
      'Defaults to 5000. Must match the value you plan to use in /processing/calculate.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Validation report returned. Check summary.readyForProcessing.',
    type: ValidationReportDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid entity type, unsupported file format, or no file sent.',
  })
  async validate(
    @Param('entityType', new ParseEnumPipe(EntityType)) entityType: EntityType,
    @UploadedFile() file: Express.Multer.File,
    @Query('manualReviewThreshold') rawThreshold?: string,
  ): Promise<ValidationReportDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded. Send the file as form-data field "file".');
    }
    const manualReviewThreshold = rawThreshold ? parseFloat(rawThreshold) : 5000;
    return this.etlService.validateFile(file, entityType, manualReviewThreshold);
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
