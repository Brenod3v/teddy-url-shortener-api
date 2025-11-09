import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ShortenService } from './services/shorten.service';
import { ShortenController } from './controllers/shorten.controller';
import { Url } from './entities/url.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Url]),
    ConfigModule,
  ],
  providers: [ShortenService],
  controllers: [ShortenController],
})
export class ShortenModule {}
