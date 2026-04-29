# DeepSeek MCP Server

MCP Server that automates [DeepSeek](https://chat.deepseek.com/) web chat via Playwright browser automation, enabling any MCP client (Claude Code, VS Code, Cursor, etc.) to use DeepSeek.

## Features

- Send messages and get replies from DeepSeek
- Support fast mode and expert mode
- Support deep thinking and smart search
- Create new conversations
- Get conversation history

## Prerequisites

- Node.js >= 18
- Chrome/Chromium browser with remote debugging enabled
- DeepSeek account (logged in via browser)

## Install

```bash
pnpm install
```

## Usage

### 1. Start Chrome with remote debugging

```bash
chrome --remote-debugging-port=9222
```

### 2. Log in to DeepSeek

Open `https://chat.deepseek.com/` in the Chrome window and log in.

### 3. Start the MCP server

```bash
pnpm dev -- --cdp-endpoint http://localhost:9222
```

### 4. Configure your MCP client

Add to your MCP client config (e.g. `.claude/settings.json` for Claude Code):

```json
{
  "mcpServers": {
    "deepseek": {
      "command": "npx",
      "args": ["deepseek-mcp-server", "--cdp-endpoint", "http://localhost:9222"]
    }
  }
}
```

## MCP Tools

### `deepseek_chat`

Send a message to DeepSeek and get a reply.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| message | string | Yes | Message to send |
| mode | string | No | `fast` (default) or `expert` |
| deep_thinking | boolean | No | Enable deep thinking (default: false) |
| search | boolean | No | Enable smart search (default: false) |
| timeout | number | No | Timeout in seconds (default: 120) |

### `deepseek_new_chat`

Create a new conversation (clear context).

### `deepseek_get_history`

Get conversation history.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| count | number | No | Number of recent messages (default: 10) |

## License

[Apache-2.0](LICENSE)
