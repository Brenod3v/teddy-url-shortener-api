import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ShortenService } from '../../src/shorten/services/shorten.service';
import { Url } from '../../src/shorten/entities/url.entity';
import { CreateShortUrlRequestDto } from '../../src/shorten/dtos/create-short-url-request.dto';
import { JwtPayload } from '../../src/auth/interfaces/jwt-payload.interface';

describe('ShortenService', () => {
  let service: ShortenService;

  const mockUrlRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    softDelete: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShortenService,
        {
          provide: getRepositoryToken(Url),
          useValue: mockUrlRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<ShortenService>(ShortenService);
    jest.clearAllMocks();
  });

  describe('shortenUrl', () => {
    const mockBaseUrl = 'https://short.ly';
    const mockDto: CreateShortUrlRequestDto = {
      longUrl: 'https://example.com',
    };

    beforeEach(() => {
      mockConfigService.get.mockReturnValue(mockBaseUrl);
    });

    it('should create short URL without custom alias', async () => {
      const mockUrl = {
        id: '123',
        longUrl: mockDto.longUrl,
        shortUrl: `${mockBaseUrl}/abc123`,
        slug: 'abc123',
        clicks: 0,
        createdAt: new Date(),
      };

      mockUrlRepository.create.mockReturnValue(mockUrl);
      mockUrlRepository.save.mockResolvedValue(mockUrl);

      const result = await service.shortenUrl(mockDto);

      expect(mockUrlRepository.save).toHaveBeenCalledWith(mockUrl);
      expect(result).toEqual(mockUrl);
    });

    it('should create short URL with custom alias for authenticated user', async () => {
      const customAlias = 'myalias';
      const dtoWithAlias = { ...mockDto, customAlias };
      const user: JwtPayload = { id: '1', email: 'test@test.com' };
      const mockUrl = {
        id: '123',
        longUrl: mockDto.longUrl,
        shortUrl: `${mockBaseUrl}/${customAlias}`,
        slug: customAlias,
        userId: 1,
        clicks: 0,
        createdAt: new Date(),
      };

      mockUrlRepository.findOne.mockResolvedValue(null);
      mockUrlRepository.create.mockReturnValue(mockUrl);
      mockUrlRepository.save.mockResolvedValue(mockUrl);

      const result = await service.shortenUrl(dtoWithAlias, user);

      expect(mockUrlRepository.findOne).toHaveBeenCalledWith({
        where: { slug: customAlias },
      });
      expect(mockUrlRepository.create).toHaveBeenCalledWith({
        longUrl: mockDto.longUrl,
        shortUrl: `${mockBaseUrl}/${customAlias}`,
        slug: customAlias,
        userId: 1,
      });
      expect(result).toEqual(mockUrl);
    });

    it('should throw BadRequestException when custom alias is used without authentication', async () => {
      const dtoWithAlias = { ...mockDto, customAlias: 'myalias' };

      await expect(service.shortenUrl(dtoWithAlias)).rejects.toThrow(
        new BadRequestException('Alias customizado requer autenticação'),
      );
    });

    it('should throw BadRequestException when custom alias is reserved route', async () => {
      const dtoWithAlias = { ...mockDto, customAlias: 'auth' };
      const user: JwtPayload = { id: '1', email: 'test@test.com' };

      await expect(service.shortenUrl(dtoWithAlias, user)).rejects.toThrow(
        new BadRequestException('Alias não pode ser uma rota reservada'),
      );
    });

    it('should throw BadRequestException when custom alias already exists', async () => {
      const customAlias = 'existing';
      const dtoWithAlias = { ...mockDto, customAlias };
      const user: JwtPayload = { id: '1', email: 'test@test.com' };
      const existingUrl = { id: '456', slug: customAlias };

      mockUrlRepository.findOne.mockResolvedValue(existingUrl);

      await expect(service.shortenUrl(dtoWithAlias, user)).rejects.toThrow(
        new BadRequestException('Alias já está em uso'),
      );
    });
  });

  describe('getMyUrls', () => {
    it('should return user URLs ordered by creation date', async () => {
      const userId = '1';
      const mockUrls = [
        {
          id: '2',
          longUrl: 'https://google.com',
          shortUrl: 'https://short.ly/def456',
          slug: 'def456',
          clicks: 10,
          createdAt: new Date('2023-12-02'),
          updatedAt: new Date('2023-12-02'),
        },
        {
          id: '1',
          longUrl: 'https://example.com',
          shortUrl: 'https://short.ly/abc123',
          slug: 'abc123',
          clicks: 5,
          createdAt: new Date('2023-12-01'),
          updatedAt: new Date('2023-12-01'),
        },
      ];

      mockUrlRepository.find.mockResolvedValue(mockUrls);

      const result = await service.getMyUrls(userId);

      expect(mockUrlRepository.find).toHaveBeenCalledWith({
        where: { userId: 1 },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockUrls);
    });

    it('should return empty array when user has no URLs', async () => {
      const userId = '1';
      mockUrlRepository.find.mockResolvedValue([]);

      const result = await service.getMyUrls(userId);

      expect(mockUrlRepository.find).toHaveBeenCalledWith({
        where: { userId: 1 },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual([]);
    });
  });

  describe('deleteUrl', () => {
    it('should soft delete URL when user owns it', async () => {
      const urlId = '123';
      const userId = '1';
      const mockUrl = {
        id: urlId,
        longUrl: 'https://example.com',
        slug: 'abc123',
        userId: 1,
      };

      mockUrlRepository.findOne.mockResolvedValue(mockUrl);
      mockUrlRepository.softDelete.mockResolvedValue({ affected: 1 });

      const result = await service.deleteUrl(urlId, userId);

      expect(mockUrlRepository.findOne).toHaveBeenCalledWith({
        where: { id: urlId, userId: 1 },
      });
      expect(mockUrlRepository.softDelete).toHaveBeenCalledWith(urlId);
      expect(result).toEqual({ message: 'URL deletada com sucesso' });
    });

    it('should throw NotFoundException when URL does not exist', async () => {
      const urlId = '123';
      const userId = '1';

      mockUrlRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteUrl(urlId, userId)).rejects.toThrow(
        new NotFoundException('URL não encontrada'),
      );

      expect(mockUrlRepository.softDelete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when URL belongs to different user', async () => {
      const urlId = '123';
      const userId = '1';

      mockUrlRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteUrl(urlId, userId)).rejects.toThrow(
        new NotFoundException('URL não encontrada'),
      );

      expect(mockUrlRepository.findOne).toHaveBeenCalledWith({
        where: { id: urlId, userId: 1 },
      });
      expect(mockUrlRepository.softDelete).not.toHaveBeenCalled();
    });
  });
});
