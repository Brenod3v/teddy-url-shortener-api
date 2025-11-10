import { Response } from 'express';
import { CreateShortUrlRequestDto } from '../dtos/createShortUrlRequest.dto';
import { CreateShortUrlResponseDto } from '../dtos/shortUrlResponse.dto';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

export interface ShortenControllerInterface {
  shortenUrl(
    ShortenUrlDto: CreateShortUrlRequestDto,
    req: { user: JwtPayload },
  ): Promise<CreateShortUrlResponseDto>;
  getMyUrls(): any;
  updateUrl(id: string, body: { url: string }): any;
  deleteUrl(id: string): any;
  redirect(short: string, res: Response): any;
}
