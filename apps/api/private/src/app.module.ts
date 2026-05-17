import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller.js';
import { ClerkAuthGuard } from './auth/clerk-auth.guard.js';
import { BatchModule } from './batch/batch.module.js';
import { DatabaseModule } from './database/database.module.js';
import { EtlModule } from './etl/etl.module.js';
import { OracleModule } from './oracle/oracle.module.js';
import { ProcessingModule } from './processing/processing.module.js';
import { AnomalyModule } from './anomaly/anomaly.module.js';

const isMongoDb = process.env.STORAGE_ADAPTER === 'mongodb';

@Module({
  imports: [
    EtlModule,
    ProcessingModule,
    OracleModule,
    ...(isMongoDb ? [DatabaseModule, OracleModule] : []),
    AnomalyModule,
    BatchModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ClerkAuthGuard,
    },
  ],
})
export class AppModule {}
