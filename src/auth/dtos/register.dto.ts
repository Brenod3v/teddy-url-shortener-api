import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Email deve ser válido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @ApiProperty({ example: 'Password123', minLength: 8, maxLength: 128 })
  @IsNotEmpty({ message: 'Password é obrigatório' })
  @MinLength(8, { message: 'Password deve ter pelo menos 8 caracteres' })
  @MaxLength(128, { message: 'Password deve ter no máximo 128 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password deve conter pelo menos uma letra minúscula, uma maiúscula e um número',
  })
  password: string;
}
