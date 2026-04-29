import type { Page } from 'playwright-core';

export async function deepseekChat(
  page: Page,
  params: {
    message: string;
    mode?: 'fast' | 'expert';
    deep_thinking?: boolean;
    search?: boolean;
    timeout?: number;
  }
): Promise<{
  content: string;
  mode: string;
  deep_thinking: boolean;
  search: boolean;
  thinking_content?: string;
  is_partial: boolean;
}> {
  // TODO: implement
  throw new Error('Not implemented');
}
