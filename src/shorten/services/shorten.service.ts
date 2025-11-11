import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
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
  private readonly logger = new Logger(ShortenService.name);

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
    this.logger.log({
      action: 'shorten_attempt',
      longUrl,
      customAlias,
      userId: user?.id,
    });

    try {
      this.validateUrl(longUrl);

      if (customAlias) {
        if (!user) {
          this.logger.warn({
            action: 'shorten_failed',
            reason: 'custom_alias_requires_auth',
          });
          throw new BadRequestException(
            'Alias customizado requer autenticação',
          );
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
      this.logger.log({
        action: 'shorten_success',
        slug,
        shortUrl,
        userId: user?.id,
      });
      return newUrl;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error({
        action: 'shorten_error',
        longUrl,
        customAlias,
        userId: user?.id,
        error: message,
      });
      throw error;
    }
  }

  async getMyUrls(userId: string): Promise<MyUrlsResponseDto[]> {
    return this.urlRepository.find({
      where: { userId: parseInt(userId, 10) },
      order: { createdAt: 'DESC' },
    });
  }

  async updateUrl(
    id: string,
    url: string,
    userId: string,
  ): Promise<{ message: string }> {
    try {
      this.validateUrl(url);

      const existingUrl = await this.urlRepository.findOne({
        where: { id, userId: parseInt(userId, 10) },
      });

      if (!existingUrl) {
        throw new NotFoundException('URL não encontrada');
      }

      await this.urlRepository.update(id, { longUrl: url });
      return { message: 'URL atualizada com sucesso' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error({
        action: 'update_error',
        urlId: id,
        userId,
        error: message,
      });
      throw error;
    }
  }

  async deleteUrl(id: string, userId: string): Promise<{ message: string }> {
    this.logger.log({ action: 'delete_attempt', urlId: id, userId });

    try {
      const url = await this.urlRepository.findOne({
        where: { id, userId: parseInt(userId, 10) },
      });

      if (!url) {
        this.logger.warn({
          action: 'delete_failed',
          urlId: id,
          userId,
          reason: 'not_found',
        });
        throw new NotFoundException('URL não encontrada');
      }

      await this.urlRepository.softDelete(id);
      this.logger.log({
        action: 'delete_success',
        urlId: id,
        slug: url.slug,
        userId,
      });
      return { message: 'URL deletada com sucesso' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error({
        action: 'delete_error',
        urlId: id,
        userId,
        error: message,
      });
      throw error;
    }
  }

  async redirect(short: string): Promise<string> {
    this.logger.log({ action: 'redirect_attempt', slug: short });

    try {
      const url = await this.urlRepository.findOne({
        where: { slug: short },
        withDeleted: false,
      });

      if (!url) {
        this.logger.warn({
          action: 'redirect_failed',
          slug: short,
          reason: 'not_found',
        });
        throw new NotFoundException('URL não encontrada');
      }

      await this.urlRepository.increment({ id: url.id }, 'clicks', 1);
      this.logger.log({
        action: 'redirect_success',
        slug: short,
        longUrl: url.longUrl,
        clicks: url.clicks + 1,
      });
      return url.longUrl;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error({
        action: 'redirect_error',
        slug: short,
        error: message,
      });
      throw error;
    }
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

    if (trimmedAlias.length < 3 || trimmedAlias.length > 30) {
      throw new BadRequestException('Alias deve ter entre 3 e 30 caracteres');
    }

    if (!/^[a-z0-9_-]+$/i.test(trimmedAlias)) {
      throw new BadRequestException(
        'Alias deve conter apenas letras minúsculas, números, hífens e underscores',
      );
    }

    const reservedRoutes = [
      'auth',
      'docs',
      'shorten',
      'my-urls',
      'api',
      'admin',
      'www',
    ];

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
