import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EtlModule } from '../etl/etl.module.js';
import { ProcessingModule } from '../processing/processing.module.js';
import { AnomalyModule } from '../anomaly/anomaly.module.js';
import { BatchController } from './batch.controller.js';
import { BatchProcessService } from './batch-process.service.js';
import { OracleService } from './oracle.service.js';
import { JsonBatchRepository } from './repositories/json-batch.repository.js';
import { MongoBatchRepository } from './repositories/mongo-batch.repository.js';
import { Batch, BatchSchema } from './schemas/batch.schema.js';
import { QrTransaction, QrTransactionSchema } from './schemas/qr-transaction.schema.js';
import { CashbackResult, CashbackResultSchema } from './schemas/cashback-result.schema.js';

const isMongoDb = process.env.STORAGE_ADAPTER === 'mongodb';

@Module({
  imports: [
    EtlModule,
    ProcessingModule,
    AnomalyModule,
    ...(isMongoDb
      ? [
          MongooseModule.forFeature([
            { name: Batch.name, schema: BatchSchema },
            { name: QrTransaction.name, schema: QrTransactionSchema },
            { name: CashbackResult.name, schema: CashbackResultSchema },
          ]),
        ]
      : []),
  ],
  controllers: [BatchController],
  providers: [
    BatchProcessService,
    OracleService,
    {
      provide: 'BATCH_REPOSITORY',
      useClass: isMongoDb ? MongoBatchRepository : JsonBatchRepository,
    },
  ],
})
export class BatchModule {}
