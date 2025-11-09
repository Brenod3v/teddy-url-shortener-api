import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ShortenModule } from './shorten/shorten.module';

@Module({
  imports: [ShortenModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
