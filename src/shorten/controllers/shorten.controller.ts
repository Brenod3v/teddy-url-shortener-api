import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ShortenService } from '../services/shorten.service';
import { ShortenControllerInterface } from './shorten.controller.interface';
import { CreateShortUrlRequestDto } from '../dtos/createShortUrlRequest.dto';
import { CreateShortUrlResponseDto } from '../dtos/shortUrlResponse.dto';

@Controller()
export class ShortenController implements ShortenControllerInterface {
  constructor(private readonly shortenService: ShortenService) {}

  @Post('shorten')
  shortenUrl(@Body() body: CreateShortUrlRequestDto): Promise<CreateShortUrlResponseDto> {
    try{
      return this.shortenService.shortenUrl(body);
    } catch (error) {
      throw new Error('Error in controller while creating short URL');
    }
  }

  @Get('my-urls')
  getMyUrls() {
    return this.shortenService.getMyUrls();
  }

  @Put('my-urls/:id')
  updateUrl(@Param('id') id: string, @Body() body: { url: string }) {
    return this.shortenService.updateUrl(id, body.url);
  }

  @Delete('my-urls/:id')
  deleteUrl(@Param('id') id: string) {
    return this.shortenService.deleteUrl(id);
  }

  @Get(':short')
  redirect(@Param('short') short: string, @Res() res: Response) {
    const url = this.shortenService.redirect(short);
    return res.redirect(url);
  }
}
