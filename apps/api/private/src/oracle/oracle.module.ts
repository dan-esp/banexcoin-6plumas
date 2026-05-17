import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Batch, BatchSchema } from '../batches/schemas/batch.schema';
import { OracleController } from './oracle.controller';
import { OracleService } from './oracle.service';
import { OracleValidator } from './oracle.validator';
import { BatchOracleRepository } from './repositories/batch-oracle.repository';
import { StubBatchOracleRepository } from './repositories/stub-batch-oracle.repository';
import { HttpJsonOracleProvider } from './strategies/http-json-oracle.provider';
import { ManualOracleProvider } from './strategies/manual-oracle.provider';

const isMongoDb = process.env.STORAGE_ADAPTER === 'mongodb';

const oraclePersistenceImports = isMongoDb
  ? [MongooseModule.forFeature([{ name: Batch.name, schema: BatchSchema }])]
  : [];

const batchOracleRepositoryProvider = isMongoDb
  ? BatchOracleRepository
  : { provide: BatchOracleRepository, useClass: StubBatchOracleRepository };

@Module({
  imports: [...oraclePersistenceImports],
  controllers: [OracleController],
  providers: [
    batchOracleRepositoryProvider,
    HttpJsonOracleProvider,
    ManualOracleProvider,
    OracleService,
    OracleValidator,
  ],
  exports: [OracleService],
})
export class OracleModule {}
