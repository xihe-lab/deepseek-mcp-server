import type { Page } from 'playwright-core';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function deepseekGetHistory(
  page: Page,
  params: { count?: number }
): Promise<{ messages: Message[]; total: number }> {
  const count = params.count ?? 10;

  const messages = await page.evaluate(() => {
    const results: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    // Find all message containers in the chat area
    // User messages are right-aligned, assistant messages are left-aligned with paragraphs
    const chatArea = document.querySelector('[class*="chat"]') || document.body;
    const containers = chatArea.querySelectorAll('dslc-reply-wrapper');

    containers.forEach((container) => {
      const element = container as HTMLElement;

      // Check alignment to determine role
      const style = window.getComputedStyle(element);
      const isRightAligned = style.justifyContent === 'flex-end' || style.textAlign === 'right';

      // Check if it contains a paragraph (assistant message)
      const hasParagraph = element.querySelector('dslc-markdown') !== null;

      if (hasParagraph && !isRightAligned) {
        // Assistant message - extract from markdown element
        const markdown = element.querySelector('dslc-markdown');
        if (markdown) {
          results.push({
            role: 'assistant',
            content: (markdown as HTMLElement).innerText.trim(),
          });
        }
      } else if (!hasParagraph) {
        // User message - extract text directly
        const text = element.innerText?.trim();
        if (text && !text.startsWith('重新生成') && !text.startsWith('复制') && !text.startsWith('点赞')) {
          results.push({
            role: 'user',
            content: text,
          });
        }
      }
    });

    return results;
  }) as Message[];

  // Get last count messages
  const recentMessages = messages.slice(-count);

  return {
    messages: recentMessages,
    total: messages.length,
  };
}