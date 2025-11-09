import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { ShortenServiceInterface } from './shorten.service.interface';
import { CreateShortUrlRequestDto } from '../dtos/createShortUrlRequest.dto';
import { Url } from '../entities/url.entity';
import { customAlphabet } from 'nanoid/non-secure';
import { CreateShortUrlResponseDto } from '../dtos/shortUrlResponse.dto';

@Injectable()
export class ShortenService implements ShortenServiceInterface {
  constructor(
    @InjectRepository(Url)
    private urlRepository: Repository<Url>,
    private configService: ConfigService,
  ) {}

  async shortenUrl(shortenUrlDto: CreateShortUrlRequestDto): Promise<CreateShortUrlResponseDto> {
    try{
      const slug = this.generateSlug();
      const baseUrl = this.configService.get<string>('BASE_URL');
      const shortUrl = `${baseUrl}/${slug}`;
      
      const url = this.urlRepository.create({
        longUrl: shortenUrlDto.longUrl,
        shortUrl,
        slug,
      });

      const newUrl = await this.urlRepository.save(url);
      return newUrl;

    } catch (error) {
      console.error('Database error:', error);
      throw new Error(`Error creating short URL: ${error.message}`);
    }
  }

  getMyUrls() {
    return [
      {
        id: '1',
        originalUrl: 'https://example.com',
        shortUrl: 'abc123',
        clicks: 5,
        createdAt: new Date(),
      },
    ];
  }

  updateUrl(id: string, url: string) {
    return {
      id,
      originalUrl: url,
      shortUrl: 'abc123',
      updatedAt: new Date(),
    };
  }

  deleteUrl(id: string) {
    return { message: 'URL deleted successfully' };
  }

  redirect(short: string) {
    return 'https://example.com';
  }

  private generateSlug(): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const nanoid = customAlphabet(alphabet, 6);
    return nanoid();
  }
}
