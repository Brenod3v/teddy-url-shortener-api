import { Response } from 'express';

export interface ShortenControllerInterface {
  shortenUrl(body: { url: string }): any;
  getMyUrls(): any;
  updateUrl(id: string, body: { url: string }): any;
  deleteUrl(id: string): any;
  redirect(short: string, res: Response): any;
}
