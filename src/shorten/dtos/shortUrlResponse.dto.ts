export class CreateShortUrlResponseDto{
      longUrl: string;
      shortUrl: string;
      slug: string;
      clicks: number;    
      createdAt: Date;
}