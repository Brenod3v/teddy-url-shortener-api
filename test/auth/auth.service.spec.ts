import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../../src/auth/services/auth.service';
import { User } from '../../src/auth/entities/user.entity';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register user and return token', async () => {
      const registerDto = { email: 'test@test.com', password: '123456' };
      const hashedPassword = 'hashedPassword';
      const user = { id: 1, email: 'test@test.com', password: hashedPassword };
      const token = 'jwt-token';

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockUserRepository.create.mockReturnValue(user);
      mockUserRepository.save.mockResolvedValue(user);
      mockJwtService.sign.mockReturnValue(token);

      const result = await service.register(registerDto);

      expect(result).toEqual({ access_token: token });
      expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
      expect(mockUserRepository.save).toHaveBeenCalledWith(user);
    });

    it('should throw BadRequestException if email is missing', async () => {
      const registerDto = { email: '', password: '123456' };

      await expect(service.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if password is missing', async () => {
      const registerDto = { email: 'test@test.com', password: '' };

      await expect(service.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    it('should login user and return token', async () => {
      const loginDto = { email: 'test@test.com', password: '123456' };
      const user = {
        id: 1,
        email: 'test@test.com',
        password: 'hashedPassword',
      };
      const token = 'jwt-token';

      mockUserRepository.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(token);

      const result = await service.login(loginDto);

      expect(result).toEqual({ access_token: token });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@test.com' },
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const loginDto = { email: 'test@test.com', password: '123456' };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const loginDto = { email: 'test@test.com', password: '123456' };
      const user = {
        id: 1,
        email: 'test@test.com',
        password: 'hashedPassword',
      };

      mockUserRepository.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});