import { IsUrl, IsOptional, IsString, Length, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShortUrlRequestDto {
  @ApiProperty({ example: 'https://www.example.com/very/long/url' })
  @IsUrl({}, { message: 'URL deve ser válida' })
  longUrl: string;

  @ApiPropertyOptional({
    example: 'my-custom-link',
    minLength: 3,
    maxLength: 30,
  })
  @IsOptional()
  @IsString()
  @Length(3, 30, { message: 'Alias deve ter entre 3 e 30 caracteres' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Alias deve conter apenas letras, números, hífen e underscore',
  })
  customAlias?: string;
}
