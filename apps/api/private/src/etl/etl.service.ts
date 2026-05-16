import { Injectable } from '@nestjs/common';
import { EntityType } from '../common/enums/entity-type.enum.js';
import { ParserFactory } from './factories/parser.factory.js';
import { MapperFactory } from './factories/mapper.factory.js';
import { EtlStore } from './store/etl-store.service.js';
import { UploadResponseDto } from './dto/upload-response.dto.js';

/**
 * Orchestrates the Extract → Transform → Load pipeline.
 *
 * EtlService depends only on interfaces and factories — never on concrete
 * strategies or mappers. Adding a new file format or entity type
 * does not require changes here.
 */
@Injectable()
export class EtlService {
  constructor(
    private readonly parserFactory: ParserFactory,
    private readonly mapperFactory: MapperFactory,
    private readonly etlStore: EtlStore,
  ) {}

  /**
   * Processes an uploaded file end-to-end:
   *  1. Extract — reads buffer via the correct file strategy (CSV or XLSX)
   *  2. Transform — maps raw rows to typed domain objects via the entity mapper
   *  3. Load — replaces the in-memory store entry for the entity type
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

  /** Returns the first `limit` stored rows for the given entity type. */
  preview(entityType: EntityType, limit = 10): unknown[] {
    return this.etlStore.get(entityType).slice(0, limit);
  }

  /** Returns row counts per entity type for all loaded entity types. */
  status(): Record<string, number> {
    return this.etlStore.status();
  }

  /** Clears the in-memory store for the given entity type. */
  clear(entityType: EntityType): void {
    this.etlStore.clear(entityType);
  }
}
