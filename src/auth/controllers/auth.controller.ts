import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';
import { AuthResponseDto } from '../dtos/auth-response.dto';

@Controller('auth')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    try {
      return await this.authService.register(registerDto);
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string };
      if (err.message?.includes('already exists') || err.code === '23505') {
        throw new ConflictException('Email já está em uso');
      }
      throw new InternalServerErrorException('Erro interno do servidor');
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    try {
      return await this.authService.login(loginDto);
    } catch (error: unknown) {
      const err = error as { message?: string };
      if (
        err.message?.includes('Invalid credentials') ||
        err.message?.includes('User not found')
      ) {
        throw new UnauthorizedException('Credenciais inválidas');
      }
      throw new InternalServerErrorException('Erro interno do servidor');
    }
  }
}
