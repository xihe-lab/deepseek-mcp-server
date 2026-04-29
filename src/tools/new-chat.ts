import type { Page } from 'playwright-core';
import { requireNotOnSignInPage } from '../utils/helpers.js';
import { selectors } from '../utils/selectors.js';

export async function deepseekNewChat(page: Page): Promise<{ success: boolean; message: string }> {
  try {
    await requireNotOnSignInPage(page);

    // Try clicking logo first
    const logo = page.locator(selectors.nav.logo).first();
    const logoVisible = await logo.isVisible().catch(() => false);

    if (logoVisible) {
      await logo.click();
    } else {
      // Fallback: navigate directly
      await page.goto('https://chat.deepseek.com/');
    }

    // Wait for input box to appear
    await page.getByRole('textbox', { name: selectors.input.textbox.name }).waitFor({ state: 'visible', timeout: 10000 });

    return { success: true, message: '已创建新对话' };
  } catch (error) {
    const err = error as Error;
    return { success: false, message: err.message };
  }
}