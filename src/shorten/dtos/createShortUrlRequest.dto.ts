import { IsUrl, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateShortUrlRequestDto {
  @IsUrl({}, { message: 'URL deve ser válida' })
  longUrl: string;

  @IsOptional()
  @IsString()
  @Length(3, 30, { message: 'Alias deve ter entre 3 e 30 caracteres' })
  @Matches(/^[a-zA-Z0-9_-]+$/, { message: 'Alias deve conter apenas letras, números, hífen e underscore' })
  customAlias?: string;
}