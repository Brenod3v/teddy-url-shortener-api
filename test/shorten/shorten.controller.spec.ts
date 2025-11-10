import { Test, TestingModule } from '@nestjs/testing';
import { ShortenController } from '../../src/shorten/controllers/shorten.controller';
import { ShortenService } from '../../src/shorten/services/shorten.service';
import { CreateShortUrlRequestDto } from '../../src/shorten/dtos/create-short-url-request.dto';
import { JwtPayload } from '../../src/auth/interfaces/jwt-payload.interface';

describe('ShortenController', () => {
  let controller: ShortenController;

  const mockShortenService = {
    shortenUrl: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShortenController],
      providers: [
        {
          provide: ShortenService,
          useValue: mockShortenService,
        },
      ],
    }).compile();

    controller = module.get<ShortenController>(ShortenController);
    jest.clearAllMocks();
  });

  describe('shortenUrl', () => {
    const mockDto: CreateShortUrlRequestDto = {
      longUrl: 'https://example.com',
    };

    it('should call service to shorten URL without user', async () => {
      const mockResponse = {
        id: '123',
        longUrl: mockDto.longUrl,
        shortUrl: 'https://short.ly/abc123',
        slug: 'abc123',
        clicks: 0,
        createdAt: new Date(),
      };

      mockShortenService.shortenUrl.mockResolvedValue(mockResponse);

      const result = await controller.shortenUrl(mockDto, {});

      expect(mockShortenService.shortenUrl).toHaveBeenCalledWith(
        mockDto,
        undefined,
      );
      expect(result).toEqual(mockResponse);
    });

    it('should call service to shorten URL with authenticated user', async () => {
      const user: JwtPayload = { id: '1', email: 'test@test.com' };
      const mockResponse = {
        id: '123',
        longUrl: mockDto.longUrl,
        shortUrl: 'https://short.ly/abc123',
        slug: 'abc123',
        userId: 1,
        clicks: 0,
        createdAt: new Date(),
      };

      mockShortenService.shortenUrl.mockResolvedValue(mockResponse);

      const result = await controller.shortenUrl(mockDto, { user });

      expect(mockShortenService.shortenUrl).toHaveBeenCalledWith(mockDto, user);
      expect(result).toEqual(mockResponse);
    });

    it('should call service with custom alias', async () => {
      const customAlias = 'myalias';
      const dtoWithAlias = { ...mockDto, customAlias };
      const user: JwtPayload = { id: '1', email: 'test@test.com' };
      const mockResponse = {
        id: '123',
        longUrl: mockDto.longUrl,
        shortUrl: `https://short.ly/${customAlias}`,
        slug: customAlias,
        customAlias,
        userId: 1,
        clicks: 0,
        createdAt: new Date(),
      };

      mockShortenService.shortenUrl.mockResolvedValue(mockResponse);

      const result = await controller.shortenUrl(dtoWithAlias, { user });

      expect(mockShortenService.shortenUrl).toHaveBeenCalledWith(
        dtoWithAlias,
        user,
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
