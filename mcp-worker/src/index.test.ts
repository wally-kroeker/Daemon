import { test, expect, describe } from "bun:test";

// Import the worker
import worker from "./index";

// Mock daemon.md content
const MOCK_DAEMON_MD = `# DAEMON DATA FILE

[ABOUT]
Test about content for testing purposes.

[MISSION]
Test mission statement.

[TELOS]
Test TELOS framework content.

[CURRENT_LOCATION]
Test location.

[PREFERENCES]
- Preference 1
- Preference 2

[FAVORITE_BOOKS]
- Book 1
- Book 2

[FAVORITE_MOVIES]
- Movie 1
- Movie 2

[FAVORITE_PODCASTS]
- Podcast 1
- Podcast 2

[DAILY_ROUTINE]
- 8AM: Wake up
- 9AM: Work

[PREDICTIONS]
- Prediction 1 (Probable)
- Prediction 2 (Likely)
`;

// Mock fetch globally
global.fetch = async (url: string | URL | Request) => {
  const urlString = typeof url === 'string' ? url : url.toString();

  if (urlString.includes('daemon.md')) {
    return new Response(MOCK_DAEMON_MD, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  return new Response('Not Found', { status: 404 });
};

describe("MCP Worker", () => {
  describe("CORS Preflight", () => {
    test("should handle OPTIONS request", async () => {
      const request = new Request("http://localhost", {
        method: "OPTIONS",
      });

      const response = await worker.fetch(request);

      expect(response.status).toBe(204);
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
      expect(response.headers.get("Access-Control-Allow-Methods")).toContain("POST");
      expect(response.headers.get("Access-Control-Allow-Headers")).toContain("Content-Type");
    });
  });

  describe("JSON-RPC Validation", () => {
    test("should reject non-POST requests", async () => {
      const request = new Request("http://localhost", {
        method: "GET",
      });

      const response = await worker.fetch(request);
      const data = await response.json();

      expect(response.status).toBe(405);
      expect(data.error.code).toBe(-32600);
      expect(data.error.message).toContain("Only POST");
    });

    test("should reject invalid JSON", async () => {
      const request = new Request("http://localhost", {
        method: "POST",
        body: "invalid json",
      });

      const response = await worker.fetch(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe(-32700);
      expect(data.error.message).toContain("Invalid JSON");
    });

    test("should reject missing jsonrpc version", async () => {
      const request = new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: "tools/list",
          id: 1,
        }),
      });

      const response = await worker.fetch(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe(-32600);
      expect(data.error.message).toContain('jsonrpc must be "2.0"');
    });

    test("should reject missing method", async () => {
      const request = new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
        }),
      });

      const response = await worker.fetch(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe(-32600);
      expect(data.error.message).toContain("method required");
    });

    test("should reject missing id", async () => {
      const request = new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "tools/list",
        }),
      });

      const response = await worker.fetch(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe(-32600);
      expect(data.error.message).toContain("id required");
    });
  });

  describe("tools/list", () => {
    test("should return list of tools", async () => {
      const request = new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "tools/list",
          id: 1,
        }),
      });

      const response = await worker.fetch(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.jsonrpc).toBe("2.0");
      expect(data.id).toBe(1);
      expect(data.result).toBeDefined();
      expect(data.result.content).toBeDefined();
      expect(data.result.content[0].type).toBe("text");

      const tools = JSON.parse(data.result.content[0].text);
      expect(tools.tools).toBeArray();
      expect(tools.tools.length).toBeGreaterThanOrEqual(11);

      // Check for required tools
      const toolNames = tools.tools.map((t: any) => t.name);
      expect(toolNames).toContain("get_about");
      expect(toolNames).toContain("get_mission");
      expect(toolNames).toContain("get_telos");
      expect(toolNames).toContain("get_all");
      expect(toolNames).toContain("get_section");

      // Check tool structure
      const firstTool = tools.tools[0];
      expect(firstTool.name).toBeDefined();
      expect(firstTool.description).toBeDefined();
      expect(firstTool.inputSchema).toBeDefined();
      expect(firstTool.inputSchema.type).toBe("object");
      expect(firstTool.inputSchema.properties).toBeDefined();
      expect(firstTool.inputSchema.required).toBeArray();
    });

    test("should include CORS headers", async () => {
      const request = new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "tools/list",
          id: 1,
        }),
      });

      const response = await worker.fetch(request);

      expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
    });
  });

  describe("tools/call", () => {
    test("should call get_about", async () => {
      const request = new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "tools/call",
          params: {
            name: "get_about",
            arguments: {},
          },
          id: 2,
        }),
      });

      const response = await worker.fetch(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.jsonrpc).toBe("2.0");
      expect(data.id).toBe(2);
      expect(data.result).toBeDefined();
      expect(data.result.content).toBeDefined();
      expect(data.result.content[0].type).toBe("text");
      expect(data.result.content[0].text).toContain("Test about content");
    });

    test("should call get_mission", async () => {
      const request = new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "tools/call",
          params: {
            name: "get_mission",
            arguments: {},
          },
          id: 3,
        }),
      });

      const response = await worker.fetch(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.result.content[0].text).toContain("Test mission");
    });

    test("should call get_telos", async () => {
      const request = new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "tools/call",
          params: {
            name: "get_telos",
            arguments: {},
          },
          id: 4,
        }),
      });

      const response = await worker.fetch(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.result.content[0].text).toContain("TELOS");
    });

    test("should call get_all", async () => {
      const request = new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "tools/call",
          params: {
            name: "get_all",
            arguments: {},
          },
          id: 5,
        }),
      });

      const response = await worker.fetch(request);
      const data = await response.json();

      expect(response.status).toBe(200);

      const allData = JSON.parse(data.result.content[0].text);
      expect(allData.about).toBeDefined();
      expect(allData.mission).toBeDefined();
      expect(allData.telos).toBeDefined();
      expect(allData.last_updated).toBeDefined();
    });

    test("should call get_section with valid section", async () => {
      const request = new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "tools/call",
          params: {
            name: "get_section",
            arguments: {
              section: "TELOS",
            },
          },
          id: 6,
        }),
      });

      const response = await worker.fetch(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.result.content[0].text).toContain("TELOS");
    });

    test("should reject get_section with missing parameter", async () => {
      const request = new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "tools/call",
          params: {
            name: "get_section",
            arguments: {},
          },
          id: 7,
        }),
      });

      const response = await worker.fetch(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.error).toBeDefined();
      expect(data.error.code).toBe(-32602);
      expect(data.error.message).toContain("Missing required parameter");
    });

    test("should reject get_section with invalid section", async () => {
      const request = new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "tools/call",
          params: {
            name: "get_section",
            arguments: {
              section: "NONEXISTENT",
            },
          },
          id: 8,
        }),
      });

      const response = await worker.fetch(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.error).toBeDefined();
      expect(data.error.code).toBe(-32001);
      expect(data.error.message).toContain("Section not found");
      expect(data.error.data.available_sections).toBeArray();
    });

    test("should reject invalid tool name", async () => {
      const request = new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "tools/call",
          params: {
            name: "invalid_tool",
            arguments: {},
          },
          id: 9,
        }),
      });

      const response = await worker.fetch(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.error).toBeDefined();
      expect(data.error.code).toBe(-32601);
      expect(data.error.message).toContain("Tool not found");
    });

    test("should reject tools/call without params", async () => {
      const request = new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "tools/call",
          id: 10,
        }),
      });

      const response = await worker.fetch(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe(-32602);
      expect(data.error.message).toContain("tool name required");
    });
  });

  describe("Error Handling", () => {
    test("should reject unknown method", async () => {
      const request = new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "unknown/method",
          id: 11,
        }),
      });

      const response = await worker.fetch(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe(-32601);
      expect(data.error.message).toContain("Method not found");
    });

    test("should include request id in all responses", async () => {
      const testId = 99;
      const request = new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "tools/list",
          id: testId,
        }),
      });

      const response = await worker.fetch(request);
      const data = await response.json();

      expect(data.id).toBe(testId);
    });
  });
});
