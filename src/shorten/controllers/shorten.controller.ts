import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Res,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { ShortenService } from '../services/shorten.service';
import { ShortenControllerInterface } from './shorten.controller.interface';
import { CreateShortUrlRequestDto } from '../dtos/create-short-url-request.dto';
import { CreateShortUrlResponseDto } from '../dtos/short-url-response.dto';
import { MyUrlsResponseDto } from '../dtos/my-urls-response.dto';
import { OptionalAuthGuard } from '../../auth/guards/optional-auth.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

@Controller()
export class ShortenController implements ShortenControllerInterface {
  private readonly logger = new Logger(ShortenController.name);

  constructor(private readonly shortenService: ShortenService) {}

  @Post('shorten')
  @UseGuards(OptionalAuthGuard)
  async shortenUrl(
    @Body() body: CreateShortUrlRequestDto,
    @Request() req: { user?: JwtPayload },
  ): Promise<CreateShortUrlResponseDto> {
    this.logger.log({ endpoint: 'POST /shorten', userId: req.user?.id });
    const result = await this.shortenService.shortenUrl(body, req.user);
    this.logger.log({
      endpoint: 'POST /shorten',
      status: 'success',
      slug: result.slug,
    });
    return result;
  }

  @Get('my-urls')
  @UseGuards(JwtAuthGuard)
  async getMyUrls(
    @Request() req: { user: JwtPayload },
  ): Promise<MyUrlsResponseDto[]> {
    this.logger.log({ endpoint: 'GET /my-urls', userId: req.user.id });
    const result = await this.shortenService.getMyUrls(req.user.id);
    this.logger.log({
      endpoint: 'GET /my-urls',
      status: 'success',
      count: result.length,
    });
    return result;
  }

  @Put('my-urls/:id')
  @UseGuards(JwtAuthGuard)
  async updateUrl(
    @Param('id') id: string,
    @Body() body: { url: string },
    @Request() req: { user: JwtPayload },
  ) {
    this.logger.log({
      endpoint: 'PUT /my-urls/:id',
      urlId: id,
      userId: req.user.id,
    });
    const result = await this.shortenService.updateUrl(
      id,
      body.url,
      req.user.id,
    );
    this.logger.log({ endpoint: 'PUT /my-urls/:id', status: 'success' });
    return result;
  }

  @Delete('my-urls/:id')
  @UseGuards(JwtAuthGuard)
  async deleteUrl(
    @Param('id') id: string,
    @Request() req: { user: JwtPayload },
  ) {
    this.logger.log({
      endpoint: 'DELETE /my-urls/:id',
      urlId: id,
      userId: req.user.id,
    });
    const result = await this.shortenService.deleteUrl(id, req.user.id);
    this.logger.log({ endpoint: 'DELETE /my-urls/:id', status: 'success' });
    return result;
  }

  @Get(':short')
  async redirect(@Param('short') short: string, @Res() res: Response) {
    this.logger.log({ endpoint: 'GET /:short', slug: short });
    const url = await this.shortenService.redirect(short);
    this.logger.log({
      endpoint: 'GET /:short',
      status: 'redirect',
      slug: short,
    });
    return res.redirect(302, url);
  }
}
