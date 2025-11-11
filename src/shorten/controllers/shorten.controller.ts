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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { ShortenService } from '../services/shorten.service';
import { ShortenControllerInterface } from './shorten.controller.interface';
import { CreateShortUrlRequestDto } from '../dtos/create-short-url-request.dto';
import { CreateShortUrlResponseDto } from '../dtos/short-url-response.dto';
import { MyUrlsResponseDto } from '../dtos/my-urls-response.dto';
import { OptionalAuthGuard } from '../../auth/guards/optional-auth.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

@ApiTags('urls')
@Controller()
export class ShortenController implements ShortenControllerInterface {
  private readonly logger = new Logger(ShortenController.name);

  constructor(private readonly shortenService: ShortenService) {}

  @Post('shorten')
  @ApiOperation({
    summary: 'Encurtar URL',
    description:
      'Cria uma URL encurtada. A autenticação é opcional - se autenticado, a URL será associada ao usuário.',
  })
  @ApiResponse({
    status: 201,
    description: 'URL encurtada com sucesso',
    type: CreateShortUrlResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiBearerAuth()
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
  @ApiOperation({ summary: 'Listar minhas URLs' })
  @ApiResponse({
    status: 200,
    description: 'Lista de URLs do usuário',
    type: [MyUrlsResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiBearerAuth()
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
  @ApiOperation({ summary: 'Atualizar URL' })
  @ApiParam({ name: 'id', description: 'ID da URL' })
  @ApiBody({
    description: 'Novo URL longo',
    schema: { properties: { url: { type: 'string' } } },
  })
  @ApiResponse({ status: 200, description: 'URL atualizada com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'URL não encontrada' })
  @ApiBearerAuth()
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
  @ApiOperation({ summary: 'Deletar URL' })
  @ApiParam({ name: 'id', description: 'ID da URL' })
  @ApiResponse({ status: 200, description: 'URL deletada com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'URL não encontrada' })
  @ApiBearerAuth()
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
  @ApiOperation({ summary: 'Redirecionar para URL original' })
  @ApiParam({ name: 'short', description: 'Código curto da URL' })
  @ApiResponse({
    status: 302,
    description: 'Redirecionamento para URL original',
  })
  @ApiResponse({ status: 404, description: 'URL não encontrada' })
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
