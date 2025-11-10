import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
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

    this.validateUrl(longUrl);

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

  updateUrl(id: string, url: string): string {
    return id + url;
  }

  async deleteUrl(id: string, userId: string): Promise<{ message: string }> {
    const url = await this.urlRepository.findOne({
      where: { id, userId: parseInt(userId, 10) },
    });

    if (!url) {
      throw new NotFoundException('URL não encontrada');
    }

    await this.urlRepository.softDelete(id);
    return { message: 'URL deletada com sucesso' };
  }

  async redirect(short: string): Promise<string> {
    const url = await this.urlRepository.findOne({
      where: { slug: short },
    });

    if (!url) {
      throw new NotFoundException('URL não encontrada');
    }

    await this.urlRepository.increment({ id: url.id }, 'clicks', 1);
    return url.longUrl;
  }

  private generateSlug(): string {
    const alphabet =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const nanoid = customAlphabet(alphabet, 6);
    return nanoid();
  }

  private validateUrl(url: string): void {
    if (!url || url.trim() === '') {
      throw new BadRequestException('URL é obrigatória');
    }

    try {
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        throw new BadRequestException('URL deve usar protocolo HTTP ou HTTPS');
      }
    } catch {
      throw new BadRequestException('URL inválida');
    }
  }

  private async validateCustomAlias(alias: string): Promise<void> {
    if (!alias || alias.trim() === '') {
      throw new BadRequestException('Alias não pode ser vazio');
    }

    const trimmedAlias = alias.trim();
    
    if (trimmedAlias.length < 3 || trimmedAlias.length > 50) {
      throw new BadRequestException('Alias deve ter entre 3 e 50 caracteres');
    }

    if (!/^[a-zA-Z0-9-_]+$/.test(trimmedAlias)) {
      throw new BadRequestException('Alias deve conter apenas letras, números, hífens e underscores');
    }

    const reservedRoutes = ['auth', 'docs', 'shorten', 'my-urls', 'api', 'admin', 'www'];

    if (reservedRoutes.includes(trimmedAlias.toLowerCase())) {
      throw new BadRequestException('Alias não pode ser uma rota reservada');
    }

    const existing = await this.urlRepository.findOne({
      where: { slug: trimmedAlias },
    });

    if (existing) {
      throw new BadRequestException('Alias já está em uso');
    }
  }
}
