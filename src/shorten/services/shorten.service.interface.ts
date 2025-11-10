import { CreateShortUrlRequestDto } from '../dtos/create-short-url-request.dto';
import { CreateShortUrlResponseDto } from '../dtos/short-url-response.dto';
import { MyUrlsResponseDto } from '../dtos/my-urls-response.dto';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

export interface ShortenServiceInterface {
  shortenUrl(
    shotUrlDton: CreateShortUrlRequestDto,
    user?: JwtPayload,
  ): Promise<CreateShortUrlResponseDto>;
  getMyUrls(userId: string): Promise<MyUrlsResponseDto[]>;
  updateUrl(id: string, url: string, userId: string): Promise<{ message: string }>;
  deleteUrl(id: string, userId: string): Promise<{ message: string }>;
  redirect(short: string): Promise<string>;
}
