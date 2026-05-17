import { Module } from '@nestjs/common';
import { EtlModule } from './etl/etl.module.js';
import { ProcessingModule } from './processing/processing.module.js';
import { BatchModule } from './batch/batch.module.js';
import { DatabaseModule } from './database/database.module.js';

const isMongoDb = process.env.STORAGE_ADAPTER === 'mongodb';

@Module({
  imports: [
    EtlModule,
    ProcessingModule,
    ...(isMongoDb ? [DatabaseModule] : []),
    BatchModule,
  ],
})
export class AppModule {}
