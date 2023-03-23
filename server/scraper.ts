import puppeteer, { Browser, Page } from 'puppeteer';

export interface Flat {
  title: string;
  imageUrl: string;
}

export class Scraper {
  private browser: Browser | null = null;
  private page: Page | null = null;

  public async init(): Promise<void> {
    this.browser = await puppeteer.launch();
    this.page = await this.browser.newPage();
  }

  public async scrapeFlats(url: string): Promise<Flat[]> {
    if (!this.page) throw new Error('Page not initialized');

    await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

    let currentPageItems: Flat[] = [];
    currentPageItems = await this.scrapeFlatsOnPage();
  

    return currentPageItems;
  }

  private async scrapeFlatsOnPage(): Promise<Flat[]> {
    if (!this.page) throw new Error('Page not initialized');

    const flats = await this.page.$$eval(
      '.property',
      (elements) =>
        elements.map((element) => {
          const titleElement = element.querySelector('.text-wrap h2 a');
          const title = titleElement ? titleElement.textContent?.trim() : '';
          const imageElement = element.querySelector('.ng-isolate-scope a img');
          const imageUrl = imageElement ? (imageElement as HTMLImageElement).src : '';

          return { title, imageUrl } as Flat;
        }),
    );

    return flats;
  }

  public async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
