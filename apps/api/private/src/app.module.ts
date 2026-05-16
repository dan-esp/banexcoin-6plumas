import { Module } from '@nestjs/common';
import { EtlModule } from './etl/etl.module.js';

@Module({
  imports: [EtlModule],
})
export class AppModule {}
