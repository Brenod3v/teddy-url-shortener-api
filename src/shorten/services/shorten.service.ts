import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { ShortenServiceInterface } from './shorten.service.interface';
import { CreateShortUrlRequestDto } from '../dtos/create-short-url-request.dto';
import { Url } from '../entities/url.entity';
import { customAlphabet } from 'nanoid/non-secure';
import { CreateShortUrlResponseDto } from '../dtos/short-url-response.dto';
import { MyUrlsResponseDto } from '../dtos/my-urls-response.dto';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

@Injectable()
export class ShortenService implements ShortenServiceInterface {
  constructor(
    @InjectRepository(Url)
    private urlRepository: Repository<Url>,
    private configService: ConfigService,
  ) {}

  async shortenUrl(
    shortenUrlDto: CreateShortUrlRequestDto,
    user?: JwtPayload,
  ): Promise<CreateShortUrlResponseDto> {
    const { longUrl, customAlias } = shortenUrlDto;

    if (customAlias) {
      if (!user) {
        throw new BadRequestException('Alias customizado requer autenticação');
      }
      await this.validateCustomAlias(customAlias);
    }

    const slug = customAlias || this.generateSlug();
    const baseUrl = this.configService.get<string>('BASE_URL');
    const shortUrl = `${baseUrl}/${slug}`;

    const url = this.urlRepository.create({
      longUrl,
      shortUrl,
      slug,
      userId: user?.id ? parseInt(user.id, 10) : undefined,
    });

    const newUrl = await this.urlRepository.save(url);
    return newUrl;
  }

  async getMyUrls(userId: string): Promise<MyUrlsResponseDto[]> {
    return this.urlRepository.find({
      where: { userId: parseInt(userId, 10) },
      order: { createdAt: 'DESC' },
    });
  }

  updateUrl(id: string, url: string) {
    return {
      id,
      originalUrl: url,
      shortUrl: 'abc123',
      updatedAt: new Date(),
    };
  }

  deleteUrl(id: string) {
    return { message: id };
  }

  redirect(short: string) {
    return short;
  }

  private generateSlug(): string {
    const alphabet =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const nanoid = customAlphabet(alphabet, 6);
    return nanoid();
  }

  private async validateCustomAlias(alias: string): Promise<void> {
    const reservedRoutes = ['auth', 'docs', 'shorten', 'my-urls', 'api'];

    if (reservedRoutes.includes(alias.toLowerCase())) {
      throw new BadRequestException('Alias não pode ser uma rota reservada');
    }

    const existing = await this.urlRepository.findOne({
      where: { slug: alias },
    });

    if (existing) {
      throw new BadRequestException('Alias já está em uso');
    }
  }
}
