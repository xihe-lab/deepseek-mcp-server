import type { Locator, Page } from 'playwright-core';

export async function requireNotOnSignInPage(page: Page): Promise<void> {
  if (page.url().includes('/sign_in')) {
    throw new Error('NOT_LOGGED_IN: 未登录，请先在浏览器中登录 DeepSeek');
  }
}

export function isOnEmptyChatPage(page: Page): boolean {
  return page.url() === 'https://chat.deepseek.com/' || page.url() === 'https://chat.deepseek.com';
}

export async function isToggleButtonActive(locator: Locator): Promise<boolean> {
  return await locator.evaluate((el: HTMLElement) => el.hasAttribute('active'));
}
