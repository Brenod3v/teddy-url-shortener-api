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
  constructor(private readonly shortenService: ShortenService) {}

  @Post('shorten')
  @UseGuards(OptionalAuthGuard)
  shortenUrl(
    @Body() body: CreateShortUrlRequestDto,
    @Request() req: { user?: JwtPayload },
  ): Promise<CreateShortUrlResponseDto> {
    return this.shortenService.shortenUrl(body, req.user);
  }

  @Get('my-urls')
  @UseGuards(JwtAuthGuard)
  getMyUrls(
    @Request() req: { user: JwtPayload },
  ): Promise<MyUrlsResponseDto[]> {
    return this.shortenService.getMyUrls(req.user.id);
  }

  @Put('my-urls/:id')
  updateUrl(@Param('id') id: string, @Body() body: { url: string }) {
    return this.shortenService.updateUrl(id, body.url);
  }

  @Delete('my-urls/:id')
  @UseGuards(JwtAuthGuard)
  deleteUrl(@Param('id') id: string, @Request() req: { user: JwtPayload }) {
    return this.shortenService.deleteUrl(id, req.user.id);
  }

  @Get(':short')
  async redirect(@Param('short') short: string, @Res() res: Response) {
    const url = await this.shortenService.redirect(short);
    return res.redirect(url);
  }
}
