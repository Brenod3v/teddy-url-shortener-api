import { Response } from 'express';
import { CreateShortUrlRequestDto } from '../dtos/create-short-url-request.dto';
import { CreateShortUrlResponseDto } from '../dtos/short-url-response.dto';
import { MyUrlsResponseDto } from '../dtos/my-urls-response.dto';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

export interface ShortenControllerInterface {
  shortenUrl(
    ShortenUrlDto: CreateShortUrlRequestDto,
    req: { user?: JwtPayload },
  ): Promise<CreateShortUrlResponseDto>;
  getMyUrls(req: { user: JwtPayload }): Promise<MyUrlsResponseDto[]>;
  updateUrl(id: string, body: { url: string }): any;
  deleteUrl(
    id: string,
    req: { user: JwtPayload },
  ): Promise<{ message: string }>;
  redirect(short: string, res: Response): any;
}
