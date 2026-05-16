import { Module } from '@nestjs/common';
import { EtlController } from './etl.controller.js';
import { EtlService } from './etl.service.js';
import { ParserFactory } from './factories/parser.factory.js';
import { MapperFactory } from './factories/mapper.factory.js';
import { CsvStrategy } from './strategies/csv.strategy.js';
import { XlsxStrategy } from './strategies/xlsx.strategy.js';
import { QrPaymentsMapper } from './mappers/qr-payments.mapper.js';
import { EtlStore } from './store/etl-store.service.js';
import { FileValidatorService } from './validators/file-validator.service.js';

@Module({
  controllers: [EtlController],
  providers: [
    EtlService,
    EtlStore,
    ParserFactory,
    MapperFactory,
    CsvStrategy,
    XlsxStrategy,
    QrPaymentsMapper,
    FileValidatorService,
  ],
  exports: [EtlStore],
})
export class EtlModule {}
