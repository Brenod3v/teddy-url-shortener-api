import { Controller, Get } from '@nestjs/common';
@Controller()
export class AppController {
  constructor() {}

  @Get()
  healthcheck(): string {
    return 'Teddy url shortener is up!';
  }
}
