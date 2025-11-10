import { CreateShortUrlRequestDto } from '../dtos/createShortUrlRequest.dto';
import { CreateShortUrlResponseDto } from '../dtos/shortUrlResponse.dto';

export interface ShortenServiceInterface {
  shortenUrl(
    shotUrlDton: CreateShortUrlRequestDto,
  ): Promise<CreateShortUrlResponseDto>;
  getMyUrls(): any;
  updateUrl(id: string, url: string): any;
  deleteUrl(id: string): any;
  redirect(short: string): string;
}
