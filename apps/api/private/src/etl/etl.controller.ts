import {
  Controller,
  Post,
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
} from '@nestjs/swagger';
import { EntityType } from '../common/enums/entity-type.enum.js';
import { EtlService } from './etl.service.js';
import { UploadResponseDto } from './dto/upload-response.dto.js';
import { ValidationReportDto } from './dto/validation-report.dto.js';

const FILE_INTERCEPTOR = FileInterceptor('file', {
  limits: { fileSize: 50 * 1024 * 1024 },
  storage: undefined,
});

@ApiTags('ETL — Carga de archivos QR')
@Controller('etl')
export class EtlController {
  constructor(private readonly etlService: EtlService) {}

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /etl/validate/:entityType
  // ─────────────────────────────────────────────────────────────────────────────
  @Post('validate/:entityType')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FILE_INTERCEPTOR)
  @ApiOperation({
    summary: 'Validar archivo CSV o XLSX sin cargarlo al sistema',
    description:
      'Realiza un análisis completo del archivo subido y devuelve un reporte de validación estructurado. ' +
      'No se escribe nada en el sistema — el archivo solo es inspeccionado (dry-run).\n\n' +
      '**Validaciones realizadas:**\n' +
      '- **Encabezados**: verifica que todas las columnas requeridas estén presentes.\n' +
      '- **Parseo de campos**: intenta parsear cada fecha, monto y número; reporta filas donde falla (CRITICAL).\n' +
      '- **Reglas de negocio**: campos requeridos no vacíos, amountBob > 0, fxRate > 0.\n' +
      '- **Duplicados**: detecta quoteIds repetidos (se conserva la primera aparición).\n' +
      '- **Simulación de filtros**: indica cuántas filas serán descartadas por el filtro Completed + Sell + BOB.\n' +
      '- **Revisión manual**: marca transacciones que superan el umbral en BOB configurado.\n\n' +
      '`readyForProcessing: true` cuando no hay errores críticos y todos los encabezados están presentes.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'entityType',
    enum: EntityType,
    description: 'Tipo de entidad que contiene el archivo.',
    example: EntityType.QR_PAYMENTS,
  })
  @ApiQuery({
    name: 'manualReviewThreshold',
    required: false,
    type: Number,
    example: 5000,
    description:
      'Monto en BOB por encima del cual una transacción se marca como MANUAL_REVIEW. ' +
      'Por defecto 5,000. Debe coincidir con el valor que se usará en /processing/calculate.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo CSV o XLSX a validar.',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reporte de validación generado. Revisar summary.readyForProcessing.',
    type: ValidationReportDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Tipo de entidad inválido, formato de archivo no soportado o no se envió ningún archivo.',
  })
  async validate(
    @Param('entityType', new ParseEnumPipe(EntityType)) entityType: EntityType,
    @UploadedFile() file: Express.Multer.File,
    @Query('manualReviewThreshold') rawThreshold?: string,
  ): Promise<ValidationReportDto> {
    if (!file) {
      throw new BadRequestException(
        'No se recibió ningún archivo. Envíe el archivo como campo "file" en el form-data.',
      );
    }
    const manualReviewThreshold = rawThreshold ? parseFloat(rawThreshold) : 5000;
    return this.etlService.validateFile(file, entityType, manualReviewThreshold);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // POST /etl/upload/:entityType
  // ─────────────────────────────────────────────────────────────────────────────
  @Post('upload/:entityType')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FILE_INTERCEPTOR)
  @ApiOperation({
    summary: 'Cargar archivo CSV o XLSX al sistema para el cálculo de cashback',
    description:
      'Extrae, transforma y almacena en memoria las filas del archivo. ' +
      'Los datos cargados quedan disponibles para el endpoint `/processing/calculate`.\n\n' +
      '**Se recomienda llamar primero a `/validate`** para asegurarse de que el archivo no tiene errores críticos ' +
      'antes de cargarlo definitivamente.\n\n' +
      'Para Pagos QR: los quoteIds duplicados se descartan (se conserva el primero) y ' +
      'solo se almacenan filas con estado "Completed".',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'entityType',
    enum: EntityType,
    description: 'Tipo de entidad que contiene el archivo.',
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
          description: 'Archivo CSV o XLSX con las transacciones.',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Archivo procesado y cargado correctamente.',
    type: UploadResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Tipo de entidad inválido, formato no soportado o no se envió ningún archivo.',
  })
  async upload(
    @Param('entityType', new ParseEnumPipe(EntityType)) entityType: EntityType,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    if (!file) {
      throw new BadRequestException(
        'No se recibió ningún archivo. Envíe el archivo como campo "file" en el form-data.',
      );
    }
    return this.etlService.processUpload(file, entityType);
  }
}
