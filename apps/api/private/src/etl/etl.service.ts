import { Injectable } from '@nestjs/common';
import { EntityType } from '../common/enums/entity-type.enum.js';
import { ParserFactory } from './factories/parser.factory.js';
import { MapperFactory } from './factories/mapper.factory.js';
import { EtlStore } from './store/etl-store.service.js';
import { UploadResponseDto } from './dto/upload-response.dto.js';
import { ValidationReportDto } from './dto/validation-report.dto.js';
import { FileValidatorService } from './validators/file-validator.service.js';

/**
 * Orquesta el pipeline Extract → Transform → Load y la validación en seco.
 *
 * Depende únicamente de interfaces y factories — nunca de estrategias o mappers
 * concretos, por lo que agregar un nuevo formato o tipo de entidad no requiere
 * cambios aquí.
 */
@Injectable()
export class EtlService {
  constructor(
    private readonly parserFactory: ParserFactory,
    private readonly mapperFactory: MapperFactory,
    private readonly etlStore: EtlStore,
    private readonly fileValidator: FileValidatorService,
  ) {}

  /**
   * Procesa un archivo subido de extremo a extremo:
   *  1. Extract — lee el buffer con la estrategia correcta (CSV o XLSX)
   *  2. Transform — convierte las filas crudas en objetos tipados mediante el mapper de entidad
   *  3. Load — reemplaza la entrada del store en memoria para el tipo de entidad
   */
  async processUpload(
    file: Express.Multer.File,
    entityType: EntityType,
  ): Promise<UploadResponseDto> {
    const strategy = this.parserFactory.resolve(file.mimetype, file.originalname);
    const rawRows = await strategy.extractRows(file.buffer);

    const mapper = this.mapperFactory.resolve(entityType);
    const { results, errors } = mapper.processAll(rawRows);

    this.etlStore.set(entityType, results);

    return {
      entityType,
      rowsLoaded: results.length,
      skipped: rawRows.length - results.length,
      errors,
    };
  }

  /**
   * Valida un archivo sin escribir nada en el store (dry-run completo).
   * Verifica encabezados, parseo de campos, reglas de negocio, duplicados,
   * simulación de filtros y flag de revisión manual.
   */
  async validateFile(
    file: Express.Multer.File,
    entityType: EntityType,
    manualReviewThreshold = 5000,
  ): Promise<ValidationReportDto> {
    const fileFormat = file.originalname.toLowerCase().endsWith('.csv') ? 'csv' : 'xlsx';
    const strategy = this.parserFactory.resolve(file.mimetype, file.originalname);
    const rawRows = await strategy.extractRows(file.buffer);
    return this.fileValidator.validate(
      rawRows,
      entityType,
      file.originalname,
      fileFormat,
      manualReviewThreshold,
    );
  }
}
