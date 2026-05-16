import { Module } from '@nestjs/common';
import { EtlModule } from './etl/etl.module.js';
import { ProcessingModule } from './processing/processing.module.js';

@Module({
  imports: [EtlModule, ProcessingModule],
})
export class AppModule {}
