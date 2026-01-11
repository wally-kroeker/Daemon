/**
 * MCP Worker - Model Context Protocol implementation for Daemon API
 * Serves daemon data at mcp.daemon.wallykroeker.com
 */

// JSON-RPC Error Codes
const JSONRPC_ERRORS = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
  TOOL_NOT_FOUND: -32601,
  SECTION_NOT_FOUND: -32001,
  PARSE_ERROR_DAEMON: -32002,
};

// Tool Definitions
const TOOLS = [
  {
    name: "get_about",
    description: "Get basic information about the person",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_mission",
    description: "Get the person's mission statement",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_telos",
    description: "Get the complete TELOS framework (Problems, Missions, Goals)",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_current_location",
    description: "Get the person's current location",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_preferences",
    description: "Get work style, tools, and general preferences",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_favorite_books",
    description: "Get list of recommended books",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_favorite_movies",
    description: "Get list of recommended movies",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_favorite_podcasts",
    description: "Get list of recommended podcasts",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_daily_routine",
    description: "Get typical daily schedule and habits",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_predictions",
    description: "Get future predictions with confidence levels",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_projects",
    description: "Get list of active projects",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_all",
    description: "Get all daemon data in one call",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_section",
    description: "Get any section by name dynamically",
    inputSchema: {
      type: "object",
      properties: {
        section: {
          type: "string",
          description: "The section name to retrieve (e.g., 'ABOUT', 'MISSION', 'TELOS')",
        },
      },
      required: ["section"],
    },
  },
];

// Parse daemon.md into sections
function parseDaemonMd(content: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const lines = content.split('\n');
  let currentSection = '';
  let currentContent: string[] = [];

  for (const line of lines) {
    const sectionMatch = line.match(/^\[([A-Z_]+)\]$/);

    if (sectionMatch) {
      // Save previous section
      if (currentSection) {
        sections[currentSection] = currentContent.join('\n').trim();
      }
      // Start new section
      currentSection = sectionMatch[1];
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    }
  }

  // Save final section
  if (currentSection) {
    sections[currentSection] = currentContent.join('\n').trim();
  }

  return sections;
}

// Build MCP-compliant success response
function buildMcpResponse(text: string, id: number | string) {
  return {
    jsonrpc: "2.0",
    result: {
      content: [
        {
          type: "text",
          text: text,
        },
      ],
    },
    id,
  };
}

// Build MCP-compliant error response
function buildMcpError(
  code: number,
  message: string,
  id: number | string | null,
  data?: any
) {
  return {
    jsonrpc: "2.0",
    error: {
      code,
      message,
      ...(data && { data }),
    },
    id,
  };
}

// Add CORS headers to response
function addCorsHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  headers.set("Access-Control-Max-Age", "86400");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// Handle tools/list method
function handleToolsList(id: number | string) {
  return buildMcpResponse(
    JSON.stringify({
      tools: TOOLS,
    }),
    id
  );
}

// Handle tools/call method
async function handleToolsCall(
  toolName: string,
  args: any,
  daemonData: Record<string, string>,
  id: number | string
) {
  // Map tool names to sections
  const toolSectionMap: Record<string, string> = {
    get_about: "ABOUT",
    get_mission: "MISSION",
    get_telos: "TELOS",
    get_current_location: "CURRENT_LOCATION",
    get_preferences: "PREFERENCES",
    get_favorite_books: "FAVORITE_BOOKS",
    get_favorite_movies: "FAVORITE_MOVIES",
    get_favorite_podcasts: "FAVORITE_PODCASTS",
    get_daily_routine: "DAILY_ROUTINE",
    get_predictions: "PREDICTIONS",
    get_projects: "PROJECTS",
  };

  // Handle get_all - return all sections as JSON
  if (toolName === "get_all") {
    const allData = {
      about: daemonData.ABOUT || "",
      mission: daemonData.MISSION || "",
      telos: daemonData.TELOS || "",
      current_location: daemonData.CURRENT_LOCATION || "",
      preferences: daemonData.PREFERENCES || "",
      favorite_books: daemonData.FAVORITE_BOOKS || "",
      favorite_movies: daemonData.FAVORITE_MOVIES || "",
      favorite_podcasts: daemonData.FAVORITE_PODCASTS || "",
      daily_routine: daemonData.DAILY_ROUTINE || "",
      predictions: daemonData.PREDICTIONS || "",
      projects: daemonData.PROJECTS || "",
      last_updated: new Date().toISOString(),
    };
    return buildMcpResponse(JSON.stringify(allData), id);
  }

  // Handle get_section - dynamic section lookup
  if (toolName === "get_section") {
    if (!args || !args.section) {
      return buildMcpError(
        JSONRPC_ERRORS.INVALID_PARAMS,
        "Missing required parameter: section",
        id
      );
    }

    const sectionName = args.section.toUpperCase();
    if (!daemonData[sectionName]) {
      const availableSections = Object.keys(daemonData);
      return buildMcpError(
        JSONRPC_ERRORS.SECTION_NOT_FOUND,
        `Section not found: ${sectionName}`,
        id,
        { available_sections: availableSections }
      );
    }

    return buildMcpResponse(daemonData[sectionName], id);
  }

  // Handle standard section tools
  const section = toolSectionMap[toolName];
  if (!section) {
    return buildMcpError(
      JSONRPC_ERRORS.TOOL_NOT_FOUND,
      `Tool not found: ${toolName}`,
      id
    );
  }

  const content = daemonData[section];
  if (!content) {
    return buildMcpResponse(`${section} section not available`, id);
  }

  return buildMcpResponse(content, id);
}

// Main request handler
export default {
  async fetch(request: Request): Promise<Response> {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return addCorsHeaders(
        new Response(null, {
          status: 204,
        })
      );
    }

    // Only accept POST requests
    if (request.method !== "POST") {
      const response = new Response(
        JSON.stringify(
          buildMcpError(
            JSONRPC_ERRORS.INVALID_REQUEST,
            "Only POST requests are supported",
            null
          )
        ),
        {
          status: 405,
          headers: { "Content-Type": "application/json" },
        }
      );
      return addCorsHeaders(response);
    }

    try {
      // Parse request body
      let body: any;
      try {
        body = await request.json();
      } catch (e) {
        const response = new Response(
          JSON.stringify(
            buildMcpError(JSONRPC_ERRORS.PARSE_ERROR, "Invalid JSON", null)
          ),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
        return addCorsHeaders(response);
      }

      // Validate JSON-RPC request
      if (body.jsonrpc !== "2.0") {
        const response = new Response(
          JSON.stringify(
            buildMcpError(
              JSONRPC_ERRORS.INVALID_REQUEST,
              'Invalid Request: jsonrpc must be "2.0"',
              body.id || null
            )
          ),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
        return addCorsHeaders(response);
      }

      if (!body.method || typeof body.method !== "string") {
        const response = new Response(
          JSON.stringify(
            buildMcpError(
              JSONRPC_ERRORS.INVALID_REQUEST,
              "Invalid Request: method required",
              body.id || null
            )
          ),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
        return addCorsHeaders(response);
      }

      if (body.id === undefined) {
        const response = new Response(
          JSON.stringify(
            buildMcpError(
              JSONRPC_ERRORS.INVALID_REQUEST,
              "Invalid Request: id required",
              null
            )
          ),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
        return addCorsHeaders(response);
      }

      // Fetch daemon.md from the static site
      let daemonMdContent: string;
      try {
        const daemonMdUrl = "https://daemon.wallykroeker.com/daemon.md";
        const daemonResponse = await fetch(daemonMdUrl);
        if (!daemonResponse.ok) {
          throw new Error(`Failed to fetch daemon.md: ${daemonResponse.status}`);
        }
        daemonMdContent = await daemonResponse.text();
      } catch (e) {
        const response = new Response(
          JSON.stringify(
            buildMcpError(
              JSONRPC_ERRORS.INTERNAL_ERROR,
              `Failed to load daemon data: ${e instanceof Error ? e.message : 'Unknown error'}`,
              body.id
            )
          ),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
        return addCorsHeaders(response);
      }

      // Parse daemon.md
      let daemonData: Record<string, string>;
      try {
        daemonData = parseDaemonMd(daemonMdContent);
      } catch (e) {
        const response = new Response(
          JSON.stringify(
            buildMcpError(
              JSONRPC_ERRORS.PARSE_ERROR_DAEMON,
              `Failed to parse daemon.md: ${e instanceof Error ? e.message : 'Unknown error'}`,
              body.id
            )
          ),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
        return addCorsHeaders(response);
      }

      // Handle methods
      let result: any;

      if (body.method === "tools/list") {
        result = handleToolsList(body.id);
      } else if (body.method === "tools/call") {
        if (!body.params || !body.params.name) {
          const response = new Response(
            JSON.stringify(
              buildMcpError(
                JSONRPC_ERRORS.INVALID_PARAMS,
                "Invalid params: tool name required",
                body.id
              )
            ),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
          return addCorsHeaders(response);
        }

        result = await handleToolsCall(
          body.params.name,
          body.params.arguments || {},
          daemonData,
          body.id
        );
      } else {
        const response = new Response(
          JSON.stringify(
            buildMcpError(
              JSONRPC_ERRORS.METHOD_NOT_FOUND,
              `Method not found: ${body.method}`,
              body.id
            )
          ),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
        return addCorsHeaders(response);
      }

      const response = new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
      return addCorsHeaders(response);
    } catch (e) {
      const response = new Response(
        JSON.stringify(
          buildMcpError(
            JSONRPC_ERRORS.INTERNAL_ERROR,
            `Internal server error: ${e instanceof Error ? e.message : 'Unknown error'}`,
            null
          )
        ),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
      return addCorsHeaders(response);
    }
  },
};
