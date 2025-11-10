export class MyUrlsResponseDto {
  id: string;
  longUrl: string;
  shortUrl: string;
  slug: string;
  customAlias?: string;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
}
