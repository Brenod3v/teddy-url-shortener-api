export class CreateShortUrlResponseDto {
  id: string;
  longUrl: string;
  shortUrl: string;
  slug: string;
  customAlias?: string;
  clicks: number;
  createdAt: Date;
  userId?: number;
}
