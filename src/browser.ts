import { chromium, type Browser, type Page } from 'playwright-core';

export interface BrowserConfig {
  cdpEndpoint: string;
  headless: boolean;
  timeout: number;
  userDataDir?: string;
}

export class BrowserManager {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private config: BrowserConfig;

  constructor(config: BrowserConfig) {
    this.config = config;
  }

  async connect(): Promise<Page> {
    this.browser = await chromium.connectOverCDP(this.config.cdpEndpoint);
    const context = this.browser.contexts()[0];
    this.page = context.pages().find(p => p.url().includes('deepseek.com')) || await context.newPage();
    await this.page.goto('https://chat.deepseek.com/');
    return this.page;
  }

  getPage(): Page {
    if (!this.page) throw new Error('Browser not connected. Call connect() first.');
    return this.page;
  }

  async disconnect(): Promise<void> {
    await this.browser?.close();
    this.browser = null;
    this.page = null;
  }
}
