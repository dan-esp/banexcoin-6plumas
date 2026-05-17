import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Batch, BatchSchema } from '../batches/schemas/batch.schema';
import { OracleController } from './oracle.controller';
import { OracleService } from './oracle.service';
import { OracleValidator } from './oracle.validator';
import { BatchOracleRepository } from './repositories/batch-oracle.repository';
import { HttpJsonOracleProvider } from './strategies/http-json-oracle.provider';
import { ManualOracleProvider } from './strategies/manual-oracle.provider';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Batch.name, schema: BatchSchema }]),
  ],
  controllers: [OracleController],
  providers: [
    BatchOracleRepository,
    HttpJsonOracleProvider,
    ManualOracleProvider,
    OracleService,
    OracleValidator,
  ],
  exports: [OracleService],
})
export class OracleModule {}
