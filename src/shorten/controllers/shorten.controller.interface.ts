import { Response } from 'express';
import { CreateShortUrlRequestDto } from '../dtos/createShortUrlRequest.dto';
import { CreateShortUrlResponseDto } from '../dtos/shortUrlResponse.dto';

export interface ShortenControllerInterface {
  shortenUrl(ShortenUrlDto: CreateShortUrlRequestDto, req: Request): Promise<CreateShortUrlResponseDto>;
  getMyUrls(): any;
  updateUrl(id: string, body: { url: string }): any;
  deleteUrl(id: string): any;
  redirect(short: string, res: Response): any;
}
