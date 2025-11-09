export interface ShortenServiceInterface {
  shortenUrl(url: string): any;
  getMyUrls(): any;
  updateUrl(id: string, url: string): any;
  deleteUrl(id: string): any;
  redirect(short: string): string;
}