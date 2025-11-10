import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ShortenService } from './services/shorten.service';
import { ShortenController } from './controllers/shorten.controller';
import { Url } from './entities/url.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Url]), ConfigModule, AuthModule],
  providers: [ShortenService],
  controllers: [ShortenController],
})
export class ShortenModule {}
