#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { BrowserManager } from './browser.js';
import { ChatLock } from './utils/lock.js';
import { deepseekChat } from './tools/chat.js';
import { deepseekNewChat } from './tools/new-chat.js';
import { deepseekGetHistory } from './tools/history.js';

const server = new McpServer({ name: 'deepseek-mcp-server', version: '0.1.0' });
const chatLock = new ChatLock();

// TODO: parse CLI args for cdpEndpoint, headless, timeout
const browserManager = new BrowserManager({
  cdpEndpoint: 'http://localhost:9222',
  headless: false,
  timeout: 120,
});

server.tool('deepseek_chat', 'Send a message to DeepSeek and get a reply', {
  message: z.string().describe('Message to send'),
  mode: z.enum(['fast', 'expert']).default('fast'),
  deep_thinking: z.boolean().default(false),
  search: z.boolean().default(false),
  timeout: z.number().default(120),
}, async (params) => {
  await chatLock.acquire();
  try {
    const page = browserManager.getPage();
    const result = await deepseekChat(page, params);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    const err = error as Error;
    return { content: [{ type: 'text', text: JSON.stringify({ error: err.message }, null, 2) }] };
  } finally {
    chatLock.release();
  }
});

server.tool('deepseek_new_chat', 'Create a new DeepSeek conversation', {}, async () => {
  try {
    const page = browserManager.getPage();
    const result = await deepseekNewChat(page);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    const err = error as Error;
    return { content: [{ type: 'text', text: JSON.stringify({ error: err.message }, null, 2) }] };
  }
});

server.tool('deepseek_get_history', 'Get current conversation history', {
  count: z.number().default(10),
}, async (params) => {
  try {
    const page = browserManager.getPage();
    const result = await deepseekGetHistory(page, params);
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    const err = error as Error;
    return { content: [{ type: 'text', text: JSON.stringify({ error: err.message }, null, 2) }] };
  }
});

async function main() {
  await browserManager.connect();
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Cleanup on process exit
  process.on('SIGINT', async () => {
    await browserManager.disconnect();
    process.exit(0);
  });
  process.on('SIGTERM', async () => {
    await browserManager.disconnect();
    process.exit(0);
  });
}

main().catch(console.error);