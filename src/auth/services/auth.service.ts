import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';
import { AuthResponseDto } from '../dtos/auth-response.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    this.logger.log({ action: 'register_attempt', email: registerDto.email });

    try {
      if (
        !registerDto.email ||
        !registerDto.password ||
        registerDto.email.trim() === '' ||
        registerDto.password.trim() === ''
      ) {
        this.logger.warn({
          action: 'register_failed',
          reason: 'missing_fields',
        });
        throw new BadRequestException('Email and password are required');
      }

      const hashedPassword = await bcrypt.hash(registerDto.password.trim(), 10);

      const user = this.userRepository.create({
        email: registerDto.email,
        password: hashedPassword,
      });

      const savedUser = await this.userRepository.save(user);
      this.logger.log({
        action: 'register_success',
        userId: savedUser.id,
        email: savedUser.email,
      });

      const payload = { sub: savedUser.id, email: savedUser.email };
      return {
        access_token: this.jwtService.sign(payload),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error({
        action: 'register_error',
        email: registerDto.email,
        error: message,
      });
      throw error;
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    this.logger.log({ action: 'login_attempt', email: loginDto.email });

    try {
      const user = await this.userRepository.findOne({
        where: { email: loginDto.email },
      });

      if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
        this.logger.warn({ action: 'login_failed', email: loginDto.email });
        throw new UnauthorizedException('Invalid credentials');
      }

      this.logger.log({
        action: 'login_success',
        userId: user.id,
        email: user.email,
      });
      const payload = { sub: user.id, email: user.email };
      return {
        access_token: this.jwtService.sign(payload),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error({
        action: 'login_error',
        email: loginDto.email,
        error: message,
      });
      throw error;
    }
  }
}
