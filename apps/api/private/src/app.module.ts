import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI ?? 'mongodb://mongo:27017/banexcoin'),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
