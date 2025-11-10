import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../src/auth/controllers/auth.controller';
import { AuthService } from '../../src/auth/services/auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('register', () => {
    it('should call authService.register', async () => {
      const registerDto = { email: 'test@test.com', password: '123456' };
      const result = { access_token: 'token' };

      mockAuthService.register.mockResolvedValue(result);

      expect(await controller.register(registerDto)).toBe(result);
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should call authService.login', async () => {
      const loginDto = { email: 'test@test.com', password: '123456' };
      const result = { access_token: 'token' };

      mockAuthService.login.mockResolvedValue(result);

      expect(await controller.login(loginDto)).toBe(result);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });
  });
});
