import { Injectable } from '@nestjs/common';
import { ShortenServiceInterface } from './shorten.service.interface';

@Injectable()
export class ShortenService implements ShortenServiceInterface {
  shortenUrl(url: string) {
    return {
      id: '1',
      originalUrl: url,
      shortUrl: 'abc123',
      createdAt: new Date(),
    };
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
}
