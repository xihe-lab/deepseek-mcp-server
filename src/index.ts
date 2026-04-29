#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { BrowserManager } from './browser.js';
import { deepseekChat } from './tools/chat.js';
import { deepseekNewChat } from './tools/new-chat.js';
import { deepseekGetHistory } from './tools/history.js';

const server = new McpServer({ name: 'deepseek-mcp-server', version: '0.1.0' });

// TODO: parse CLI args for cdpEndpoint, headless, timeout
const browserManager = new BrowserManager({
  cdpEndpoint: 'http://localhost:9222',
  headless: false,
  timeout: 120,
});

server.tool('deepseek_chat', 'Send a message to DeepSeek and get a reply', {
  message: { type: 'string', description: 'Message to send' },
  mode: { type: 'string', enum: ['fast', 'expert'], default: 'fast' },
  deep_thinking: { type: 'boolean', default: false },
  search: { type: 'boolean', default: false },
  timeout: { type: 'number', default: 120 },
}, async (params) => {
  const page = browserManager.getPage();
  const result = await deepseekChat(page, params);
  return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
});

server.tool('deepseek_new_chat', 'Create a new DeepSeek conversation', {}, async () => {
  const page = browserManager.getPage();
  const result = await deepseekNewChat(page);
  return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
});

server.tool('deepseek_get_history', 'Get current conversation history', {
  count: { type: 'number', default: 10 },
}, async (params) => {
  const page = browserManager.getPage();
  const result = await deepseekGetHistory(page, params);
  return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
});

async function main() {
  await browserManager.connect();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
