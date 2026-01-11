# Daemon MCP Worker

Model Context Protocol (MCP) implementation for the Daemon API. This Cloudflare Worker serves daemon data following the MCP specification (2024-11-05) and JSON-RPC 2.0 protocol.

## Overview

This worker provides a standardized MCP interface to access daemon.md content via JSON-RPC 2.0. It fetches daemon.md from `https://daemon.wallykroeker.com/daemon.md` and exposes it through 13 standard tools.

**Endpoint:** `https://mcp.daemon.wallykroeker.com`

## Features

- Full MCP 2024-11-05 compliance
- JSON-RPC 2.0 protocol
- 13 standard daemon tools
- CORS support for browser access
- Comprehensive error handling
- No external dependencies (vanilla Cloudflare Worker)

## Tools

### Core Identity Tools

1. **get_about** - Get basic biographical information
2. **get_mission** - Get the person's mission statement
3. **get_current_location** - Get current location

### Framework Tools

4. **get_telos** - Get the complete TELOS framework

### Preferences & Lists

5. **get_preferences** - Get work style and preferences
6. **get_favorite_books** - Get list of recommended books
7. **get_favorite_movies** - Get list of recommended movies
8. **get_favorite_podcasts** - Get list of recommended podcasts

### Routine & Predictions

9. **get_daily_routine** - Get typical daily schedule
10. **get_predictions** - Get future predictions with confidence levels

### Projects

11. **get_projects** - Get list of active projects

### Utility Tools

12. **get_all** - Get all daemon data in one call (returns JSON)
13. **get_section** - Get any section by name dynamically (requires `section` parameter)

## Usage

### List Available Tools

```bash
curl -X POST https://mcp.daemon.wallykroeker.com \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "id": 1
  }'
```

### Call a Tool

```bash
curl -X POST https://mcp.daemon.wallykroeker.com \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "get_mission",
      "arguments": {}
    },
    "id": 2
  }'
```

### Get Specific Section

```bash
curl -X POST https://mcp.daemon.wallykroeker.com \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "get_section",
      "arguments": {
        "section": "TELOS"
      }
    },
    "id": 3
  }'
```

### Get All Data

```bash
curl -X POST https://mcp.daemon.wallykroeker.com \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "get_all",
      "arguments": {}
    },
    "id": 4
  }'
```

## Response Format

All successful responses follow the MCP content format:

```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "..."
      }
    ]
  },
  "id": 1
}
```

## Error Codes

Standard JSON-RPC 2.0 error codes:

| Code | Message | Description |
|------|---------|-------------|
| -32700 | Parse error | Invalid JSON received |
| -32600 | Invalid Request | JSON-RPC structure invalid |
| -32601 | Method not found | Method doesn't exist |
| -32602 | Invalid params | Invalid method parameters |
| -32603 | Internal error | Server internal error |

Custom error codes:

| Code | Message | Description |
|------|---------|-------------|
| -32001 | Section not found | Requested section doesn't exist in daemon.md |
| -32002 | Parse error | Failed to parse daemon.md |

## Development

### Prerequisites

- [Bun](https://bun.sh) - For testing
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) - For deployment

### Install Dependencies

```bash
bun install
```

### Run Tests

```bash
bun test
```

### Local Development

```bash
bun run dev
```

This starts a local development server with hot reloading.

### Deploy

```bash
bun run deploy
```

This deploys to Cloudflare Workers at `mcp.daemon.wallykroeker.com`.

## Architecture

### Data Flow

1. Worker receives JSON-RPC request
2. Fetches `daemon.md` from `https://daemon.wallykroeker.com/daemon.md`
3. Parses daemon.md into sections
4. Executes requested tool
5. Returns MCP-compliant response with CORS headers

### Parser

The daemon.md parser uses a simple section-based format:

```markdown
[SECTION_NAME]
Section content goes here...

[NEXT_SECTION]
More content...
```

Sections are parsed into a key-value map where keys are section names (e.g., "ABOUT") and values are the trimmed content.

### CORS

All responses include CORS headers for browser compatibility:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
Access-Control-Max-Age: 86400
```

## Registry Compatibility

This worker is designed to pass UL Daemon Registry health checks:

- Responds to OPTIONS preflight requests
- Returns valid `tools/list` response
- Includes proper CORS headers
- Response time < 5 seconds

## Security

- **Public Access:** No authentication required (by design)
- **Rate Limiting:** Cloudflare's automatic DDoS protection
- **Input Validation:** All inputs validated and sanitized
- **No Secrets:** All data in daemon.md is intentionally public

## Testing

The test suite covers:

- CORS preflight handling
- JSON-RPC validation (missing fields, invalid JSON)
- tools/list method
- All 13 tools/call methods
- Error handling (invalid tools, missing sections, parameters)
- Response format compliance

Run tests with:

```bash
bun test
```

Watch mode:

```bash
bun test --watch
```

## Files

- `src/index.ts` - Main worker implementation
- `src/index.test.ts` - Test suite
- `wrangler.toml` - Cloudflare Worker configuration
- `package.json` - Dependencies and scripts

## License

Part of the Daemon project. See main project LICENSE.
