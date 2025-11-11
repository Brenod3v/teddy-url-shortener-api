import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MyUrlsResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'https://www.example.com/very/long/url' })
  longUrl: string;

  @ApiProperty({ example: 'http://localhost:3000/abc123' })
  shortUrl: string;

  @ApiProperty({ example: 'abc123' })
  slug: string;

  @ApiPropertyOptional({ example: 'my-custom-link' })
  customAlias?: string;

  @ApiProperty({ example: 42 })
  clicks: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-02T00:00:00.000Z' })
  updatedAt: Date;
}
