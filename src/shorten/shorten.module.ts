import { Module } from '@nestjs/common';
import { ShortenService } from './services/shorten.service';
import { ShortenController } from './controllers/shorten.controller';

@Module({
  providers: [ShortenService],
  controllers: [ShortenController],
})
export class ShortenModule {}
