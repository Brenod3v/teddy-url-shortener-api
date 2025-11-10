import { Test, TestingModule } from '@nestjs/testing';
import { ShortenController } from '../../src/shorten/controllers/shorten.controller';
import { ShortenService } from '../../src/shorten/services/shorten.service';
import { CreateShortUrlRequestDto } from '../../src/shorten/dtos/create-short-url-request.dto';
import { JwtPayload } from '../../src/auth/interfaces/jwt-payload.interface';

describe('ShortenController', () => {
  let controller: ShortenController;

  const mockShortenService = {
    shortenUrl: jest.fn(),
    getMyUrls: jest.fn(),
    updateUrl: jest.fn(),
    deleteUrl: jest.fn(),
    redirect: jest.fn(),
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

  describe('getMyUrls', () => {
    it('should return user URLs', async () => {
      const user: JwtPayload = { id: '1', email: 'test@test.com' };
      const mockUrls = [
        {
          id: '1',
          longUrl: 'https://example.com',
          shortUrl: 'https://short.ly/abc123',
          slug: 'abc123',
          clicks: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          longUrl: 'https://google.com',
          shortUrl: 'https://short.ly/def456',
          slug: 'def456',
          customAlias: 'google',
          clicks: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockShortenService.getMyUrls.mockResolvedValue(mockUrls);

      const result = await controller.getMyUrls({ user });

      expect(mockShortenService.getMyUrls).toHaveBeenCalledWith(user.id);
      expect(result).toEqual(mockUrls);
    });
  });

  describe('updateUrl', () => {
    it('should update URL for authenticated user', async () => {
      const urlId = '123';
      const newUrl = 'https://updated-example.com';
      const user: JwtPayload = { id: '1', email: 'test@test.com' };
      const mockResponse = { message: 'URL atualizada com sucesso' };

      mockShortenService.updateUrl.mockResolvedValue(mockResponse);

      const result = await controller.updateUrl(
        urlId,
        { url: newUrl },
        { user },
      );

      expect(mockShortenService.updateUrl).toHaveBeenCalledWith(
        urlId,
        newUrl,
        user.id,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteUrl', () => {
    it('should delete URL for authenticated user', async () => {
      const urlId = '123';
      const user: JwtPayload = { id: '1', email: 'test@test.com' };
      const mockResponse = { message: 'URL deletada com sucesso' };

      mockShortenService.deleteUrl.mockResolvedValue(mockResponse);

      const result = await controller.deleteUrl(urlId, { user });

      expect(mockShortenService.deleteUrl).toHaveBeenCalledWith(urlId, user.id);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('redirect', () => {
    it('should redirect to long URL', async () => {
      const slug = 'abc123';
      const longUrl = 'https://example.com';
      const mockRes = {
        redirect: jest.fn(),
      } as unknown as Response;

      mockShortenService.redirect.mockResolvedValue(longUrl);

      await controller.redirect(slug, mockRes);

      expect(mockShortenService.redirect).toHaveBeenCalledWith(slug);
      expect(mockRes.redirect).toHaveBeenCalledWith(longUrl);
    });
  });
});
