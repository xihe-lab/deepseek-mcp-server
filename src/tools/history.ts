import type { Page } from 'playwright-core';

export async function deepseekGetHistory(
  page: Page,
  params: { count?: number }
): Promise<{ messages: Array<{ role: string; content: string }>; total: number }> {
  // TODO: implement
  throw new Error('Not implemented');
}
