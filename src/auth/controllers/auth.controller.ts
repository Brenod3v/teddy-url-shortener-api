import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';
import { AuthResponseDto } from '../dtos/auth-response.dto';

@Controller('auth')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    this.logger.log({
      endpoint: 'POST /auth/register',
      email: registerDto.email,
    });
    try {
      const result = await this.authService.register(registerDto);
      this.logger.log({ endpoint: 'POST /auth/register', status: 'success' });
      return result;
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string };
      if (err.message?.includes('already exists') || err.code === '23505') {
        this.logger.warn({
          endpoint: 'POST /auth/register',
          error: 'email_conflict',
        });
        throw new ConflictException('Email já está em uso');
      }
      this.logger.error({
        endpoint: 'POST /auth/register',
        error: err.message,
      });
      throw new InternalServerErrorException('Erro interno do servidor');
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    this.logger.log({ endpoint: 'POST /auth/login', email: loginDto.email });
    try {
      const result = await this.authService.login(loginDto);
      this.logger.log({ endpoint: 'POST /auth/login', status: 'success' });
      return result;
    } catch (error: unknown) {
      const err = error as { message?: string };
      if (
        err.message?.includes('Invalid credentials') ||
        err.message?.includes('User not found')
      ) {
        this.logger.warn({
          endpoint: 'POST /auth/login',
          error: 'invalid_credentials',
        });
        throw new UnauthorizedException('Credenciais inválidas');
      }
      this.logger.error({ endpoint: 'POST /auth/login', error: err.message });
      throw new InternalServerErrorException('Erro interno do servidor');
    }
  }
}
