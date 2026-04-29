import type { Page } from 'playwright-core';
import { requireNotOnSignInPage, isOnEmptyChatPage, isToggleButtonActive } from '../utils/helpers.js';
import { selectors } from '../utils/selectors.js';
import { deepseekNewChat } from './new-chat.js';

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
  await requireNotOnSignInPage(page);

  const mode = params.mode ?? 'fast';
  const deepThinking = params.deep_thinking ?? false;
  const searchEnabled = params.search ?? false;
  const timeoutMs = (params.timeout ?? 120) * 1000;

  // Step 1: Handle mode switching
  if (isOnEmptyChatPage(page)) {
    // Radiogroup is visible, can switch mode directly
    const targetRadio = page.getByRole('radio', { name: mode === 'fast' ? '快速模式' : '专家模式' });
    const isChecked = await targetRadio.isChecked().catch(() => false);
    if (!isChecked) {
      await targetRadio.click();
    }
  } else {
    // During active chat, check current mode indicator in header
    // If mismatch, create new chat first
    const modeIndicator = page.locator('generic').filter({ hasText: mode === 'fast' ? '快速模式' : '专家模式' });
    const modeVisible = await modeIndicator.count();

    if (modeVisible === 0) {
      // Mode mismatch - need to create new chat
      await deepseekNewChat(page);
      // Now on empty chat page, switch mode
      const targetRadio = page.getByRole('radio', { name: mode === 'fast' ? '快速模式' : '专家模式' });
      await targetRadio.click();
    }
  }

  // Step 2: Handle deep thinking / search toggles (mutually exclusive)
  // If both requested, prefer deep_thinking
  const effectiveSearch = !deepThinking && searchEnabled;

  const deepThinkingBtn = page.getByRole('button', { name: selectors.input.deepThinking.name });
  const searchBtn = page.getByRole('button', { name: selectors.input.search.name });

  const deepThinkingActive = await isToggleButtonActive(deepThinkingBtn).catch(() => false);
  const searchActive = await isToggleButtonActive(searchBtn).catch(() => false);

  // Turn on deep thinking if needed
  if (deepThinking && !deepThinkingActive) {
    await deepThinkingBtn.click();
  }
  // Turn off search if deep thinking is on
  if (deepThinking && searchActive) {
    await searchBtn.click();
  }

  // Turn on search if needed (and deep thinking not requested)
  if (effectiveSearch && !searchActive) {
    await searchBtn.click();
  }
  // Turn off deep thinking if search is on
  if (effectiveSearch && deepThinkingActive) {
    await deepThinkingBtn.click();
  }

  // Turn off both if neither requested
  if (!deepThinking && !searchEnabled) {
    if (deepThinkingActive) await deepThinkingBtn.click();
    if (searchActive) await searchBtn.click();
  }

  // Step 3: Send message
  const textbox = page.getByRole('textbox', { name: selectors.input.textbox.name });
  await textbox.waitFor({ state: 'visible' });
  await textbox.fill(params.message);
  await textbox.press('Enter');

  // Step 4: Wait for reply completion
  const startTime = Date.now();
  let isPartial = false;
  let replyText = '';
  let thinkingText: string | undefined;

  // Strategy A: Wait for action buttons (≥5) under reply
  const replyComplete = await page.waitForFunction(
    () => {
      const replies = document.querySelectorAll('dslc-reply-wrapper');
      // Find last assistant reply (contains markdown)
      for (let i = replies.length - 1; i >= 0; i--) {
        const reply = replies[i];
        if (reply.querySelector('dslc-markdown')) {
          const buttons = reply.querySelectorAll('button');
          return buttons.length >= 5;
        }
      }
      return false;
    },
    { timeout: timeoutMs }
  ).catch(() => null);

  if (replyComplete) {
    // Reply completed normally
    isPartial = false;
  } else {
    // Timeout - partial reply
    isPartial = true;
  }

  // Step 5: Extract reply content
  // Find last assistant reply
  const replies = await page.locator('dslc-reply-wrapper').all();
  for (let i = replies.length - 1; i >= 0; i--) {
    const reply = replies[i];
    const markdown = reply.locator('dslc-markdown');
    if (await markdown.count()) {
      replyText = await markdown.innerText();

      // Extract thinking content if deep thinking was enabled
      if (deepThinking) {
        const thinkingBlock = reply.locator('[class*="thinking"], [class*="reasoning"]');
        if (await thinkingBlock.count()) {
          thinkingText = await thinkingBlock.innerText();
        }
      }
      break;
    }
  }

  return {
    content: replyText,
    mode,
    deep_thinking: deepThinking,
    search: effectiveSearch,
    thinking_content: thinkingText,
    is_partial: isPartial,
  };
}