import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnomalyController } from './anomaly.controller.js';
import { AnomalyService } from './anomaly.service.js';
import { Anomaly, AnomalySchema } from './schemas/anomaly.schema.js';
import { MongoAnomalyRepository } from './repositories/mongo-anomaly.repository.js';
import { NoopAnomalyRepository } from './repositories/noop-anomaly.repository.js';

const isMongoDb = process.env.STORAGE_ADAPTER === 'mongodb';

@Module({
  imports: isMongoDb
    ? [
        MongooseModule.forFeature([
          { name: Anomaly.name, schema: AnomalySchema },
        ]),
      ]
    : [],
  controllers: [AnomalyController],
  providers: [
    AnomalyService,
    {
      provide: 'ANOMALY_REPOSITORY',
      useClass: isMongoDb ? MongoAnomalyRepository : NoopAnomalyRepository,
    },
  ],
  exports: [AnomalyService, 'ANOMALY_REPOSITORY'],
})
export class AnomalyModule {}
