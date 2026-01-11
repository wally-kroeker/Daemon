# Daemon Migration Project Plan

**Project:** Migrate Daemon to Cloudflare Pages + MCP Worker
**Status:** Planning
**Created:** 2026-01-11
**Project Manager:** Bob Prime

---

## Executive Summary

Migrate the daemon from "Web only" to full MCP compatibility by:
1. Deploying static site to Cloudflare Pages
2. Building and deploying MCP Worker
3. Registering with UL Daemon Registry
4. Cleaning up redundant infrastructure

**End State:** `daemon.wallykroeker.com` (static) + `mcp.daemon.wallykroeker.com` (API)

---

## Team Assignments

| Role | Assignee | Responsibilities |
|------|----------|------------------|
| **Project Manager** | Bob Prime | Coordination, task assignment, review |
| **Infrastructure** | Wally | Cloudflare setup, DNS, deployments |
| **Architect** | Bill (Agent 4) | MCP spec, schema design, API contract |
| **Engineer** | Mario (Agent 5) | MCP Worker implementation, testing |
| **Researcher** | Riker (Agent 6) | Community standards, registry requirements |
| **Designer** | Howard (Agent 7) | Dashboard updates, daemon.md content |

---

## Phase 1: Research & Specification

**Goal:** Establish requirements and technical specifications before building.

### Task 1.1: MCP Protocol Research
**Assignee:** Riker (Agent 6)
**Dependencies:** None
**Deliverable:** Research document covering:
- [ ] MCP protocol specification (version 2024-11-05)
- [ ] JSON-RPC 2.0 requirements
- [ ] Community daemon tool standards (what tools are expected)
- [ ] Swift's registry API requirements (daemon_registry_announce)
- [ ] Health check requirements for registry compatibility

**Acceptance Criteria:**
- Document lists all required MCP methods
- Document lists all standard daemon tools with exact names/schemas
- Document includes registry announcement requirements

---

### Task 1.2: MCP Worker Specification
**Assignee:** Bill (Agent 4)
**Dependencies:** Task 1.1 (needs protocol research)
**Deliverable:** Technical specification including:
- [ ] API contract (all endpoints, request/response schemas)
- [ ] Tool definitions with inputSchema for each
- [ ] Error handling specification (JSON-RPC error codes)
- [ ] CORS and security requirements
- [ ] Data flow diagram (daemon.md → parsing → response)

**Acceptance Criteria:**
- Spec is detailed enough for Mario to implement without questions
- All 13+ standard daemon tools defined
- Response format matches Daniel's MCP server exactly

---

### Task 1.3: Cloudflare Infrastructure Setup
**Assignee:** Wally
**Dependencies:** None (can run parallel with 1.1, 1.2)
**Deliverable:** Cloudflare resources created:
- [ ] Create Cloudflare Pages project for daemon static site
- [ ] Create Cloudflare Worker for MCP server
- [ ] Configure DNS: `daemon.wallykroeker.com` → Pages
- [ ] Configure DNS: `mcp.daemon.wallykroeker.com` → Worker
- [ ] Create KV namespace for daemon data caching (optional)

**Acceptance Criteria:**
- Pages project exists and is connected to GitHub repo
- Worker exists (can be empty placeholder)
- DNS records configured (may take time to propagate)
- Report back with project names and URLs

**Notes for Wally:**
```bash
# Pages setup
# 1. Go to Cloudflare Dashboard → Pages → Create project
# 2. Connect to GitHub: wally-kroeker/Daemon
# 3. Build settings:
#    - Framework preset: Astro
#    - Build command: bun run build
#    - Build output directory: dist

# Worker setup
# 1. Go to Workers & Pages → Create → Worker
# 2. Name: daemon-mcp
# 3. We'll deploy code later via wrangler

# DNS setup (in wallykroeker.com DNS settings)
# daemon.wallykroeker.com → CNAME to Pages URL
# mcp.daemon.wallykroeker.com → CNAME to Worker URL
```

---

## Phase 2: Implementation

**Goal:** Build and deploy all components.

### Task 2.1: MCP Worker Implementation
**Assignee:** Mario (Agent 5)
**Dependencies:** Task 1.2 (needs spec from Bill)
**Deliverable:** Complete MCP Worker code:
- [ ] Create `/mcp-worker/` directory structure
- [ ] Implement JSON-RPC 2.0 handler
- [ ] Implement `tools/list` method
- [ ] Implement `tools/call` method with all standard tools:
  - `get_about`
  - `get_mission`
  - `get_telos`
  - `get_projects`
  - `get_preferences`
  - `get_predictions`
  - `get_favorite_books`
  - `get_favorite_movies`
  - `get_current_location`
  - `get_daily_routine`
  - `get_all`
  - `get_section` (dynamic)
- [ ] Implement daemon.md parser
- [ ] Implement CORS headers
- [ ] Implement GET / metadata endpoint
- [ ] Create wrangler.toml for Worker
- [ ] Write unit tests

**Acceptance Criteria:**
- All tools return correct data format
- Matches Daniel's MCP response structure exactly
- Passes local testing with curl
- Worker deploys without errors

---

### Task 2.2: Dashboard URL Update
**Assignee:** Howard (Agent 7)
**Dependencies:** Task 1.3 (needs to know final MCP URL)
**Deliverable:** Updated dashboard component:
- [ ] Update `src/components/DaemonDashboard.tsx`
- [ ] Change hardcoded URL from `mcp.daemon.danielmiessler.com` to configurable
- [ ] Add environment variable support for MCP URL
- [ ] Update status bar to show "DAEMON://KROEKER" instead of "MIESSLER"
- [ ] Test dashboard renders correctly with new endpoint

**Acceptance Criteria:**
- Dashboard fetches from `mcp.daemon.wallykroeker.com`
- No references to danielmiessler.com remain
- Dashboard displays Wally's data correctly

---

### Task 2.3: Daemon.md Content Review
**Assignee:** Howard (Agent 7)
**Dependencies:** None (can run parallel)
**Deliverable:** Updated daemon.md:
- [ ] Review current `public/daemon.md` for Wally's accuracy
- [ ] Ensure all standard sections exist:
  - [ABOUT]
  - [MISSION]
  - [TELOS]
  - [CURRENT_LOCATION]
  - [FAVORITE_BOOKS]
  - [FAVORITE_MOVIES]
  - [DAILY_ROUTINE]
  - [PREFERENCES]
  - [PREDICTIONS]
  - [PROJECTS] (if desired)
- [ ] Flag any sections that need Wally's input
- [ ] Ensure format matches expected parsing pattern

**Acceptance Criteria:**
- All standard sections present
- Content is personalized for Wally (not Daniel's content)
- Format is parseable by MCP Worker

---

## Phase 3: Deployment & Testing

**Goal:** Deploy everything and verify it works end-to-end.

### Task 3.1: Deploy MCP Worker
**Assignee:** Wally (with Mario support)
**Dependencies:** Task 2.1 (Worker code complete)
**Deliverable:** Live MCP Worker:
- [ ] Deploy Worker via `wrangler deploy`
- [ ] Verify DNS is resolving
- [ ] Test `tools/list` endpoint
- [ ] Test `tools/call` with each tool
- [ ] Verify CORS works from browser

**Acceptance Criteria:**
```bash
# This should return tool list
curl -X POST https://mcp.daemon.wallykroeker.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'

# This should return Wally's mission
curl -X POST https://mcp.daemon.wallykroeker.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"get_mission","arguments":{}},"id":2}'
```

---

### Task 3.2: Deploy Static Site
**Assignee:** Wally
**Dependencies:** Task 2.2, Task 2.3 (dashboard + content ready)
**Deliverable:** Live static site:
- [ ] Push updated code to GitHub
- [ ] Verify Cloudflare Pages builds successfully
- [ ] Verify site is accessible at `daemon.wallykroeker.com`
- [ ] Verify dashboard loads and displays data from MCP

**Acceptance Criteria:**
- Site loads without errors
- Dashboard shows "CONNECTED" status
- All data sections populate correctly

---

### Task 3.3: End-to-End Testing
**Assignee:** Riker (Agent 6)
**Dependencies:** Task 3.1, Task 3.2 (both deployed)
**Deliverable:** Test report:
- [ ] Test MCP server from Claude Code (add to MCP config)
- [ ] Test all 13 tools via curl
- [ ] Test dashboard fetch cycle
- [ ] Test registry health check compatibility
- [ ] Document any issues found

**Acceptance Criteria:**
- All tools return expected data
- No CORS errors in browser console
- Claude Code can query the daemon successfully

---

## Phase 4: Registry & Cleanup

**Goal:** Register with community and clean up old infrastructure.

### Task 4.1: Register with UL Daemon Registry
**Assignee:** Wally
**Dependencies:** Task 3.3 (testing complete)
**Deliverable:** Registry entry:
- [ ] Contact Swift (registry owner) OR
- [ ] Use `daemon_registry_announce` tool if available
- [ ] Verify entry shows "✅ MCP" status instead of "🌐 Web only"

**Acceptance Criteria:**
- Wally Kroeker entry in registry shows MCP status
- Other community members can query the daemon

---

### Task 4.2: Cleanup wallykroeker.com
**Assignee:** Wally
**Dependencies:** Task 4.1 (registry confirmed working)
**Deliverable:** Cleaned infrastructure:
- [ ] Remove any daemon-related routes from wallykroeker.com (if any)
- [ ] Update any links pointing to old daemon location
- [ ] Document final architecture

**Acceptance Criteria:**
- No duplicate daemon hosting
- All links point to new location
- Clean separation between main site and daemon

---

### Task 4.3: Documentation Update
**Assignee:** Howard (Agent 7)
**Dependencies:** Task 4.2 (cleanup complete)
**Deliverable:** Updated docs:
- [ ] Update README.md with Wally's fork specifics
- [ ] Document MCP server location
- [ ] Add setup instructions for others who want to fork

**Acceptance Criteria:**
- README reflects actual architecture
- Instructions are accurate and tested

---

## Dependency Graph

```
Phase 1 (Parallel Start)
├── 1.1 MCP Protocol Research (Riker) ──┐
├── 1.2 MCP Worker Spec (Bill) ─────────┼── depends on 1.1
└── 1.3 Cloudflare Setup (Wally) ───────┘   (parallel with 1.3)

Phase 2 (After Phase 1)
├── 2.1 MCP Worker Code (Mario) ────────── depends on 1.2
├── 2.2 Dashboard Update (Howard) ──────── depends on 1.3
└── 2.3 Daemon.md Review (Howard) ──────── parallel

Phase 3 (After Phase 2)
├── 3.1 Deploy Worker (Wally) ──────────── depends on 2.1
├── 3.2 Deploy Site (Wally) ────────────── depends on 2.2, 2.3
└── 3.3 E2E Testing (Riker) ────────────── depends on 3.1, 3.2

Phase 4 (After Phase 3)
├── 4.1 Registry (Wally) ───────────────── depends on 3.3
├── 4.2 Cleanup (Wally) ────────────────── depends on 4.1
└── 4.3 Docs (Howard) ──────────────────── depends on 4.2
```

---

## Execution Order (Optimized for Parallelism)

**Wave 1 (Now):**
- Wally: Task 1.3 (Cloudflare setup)
- Riker: Task 1.1 (Protocol research)

**Wave 2 (After 1.1 completes):**
- Bill: Task 1.2 (Worker spec)
- Howard: Task 2.3 (Daemon.md review) - can start early

**Wave 3 (After 1.2 and 1.3 complete):**
- Mario: Task 2.1 (Worker implementation)
- Howard: Task 2.2 (Dashboard update)

**Wave 4 (After Wave 3):**
- Wally: Task 3.1 (Deploy Worker)
- Wally: Task 3.2 (Deploy Site)

**Wave 5 (After Wave 4):**
- Riker: Task 3.3 (E2E Testing)

**Wave 6 (After Wave 5):**
- Wally: Task 4.1 (Registry)
- Wally: Task 4.2 (Cleanup)
- Howard: Task 4.3 (Docs)

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| DNS propagation delay | Medium | Start DNS setup first, allow 24h |
| MCP spec changes | Low | Pin to version 2024-11-05 |
| Registry unavailable | Low | Can operate without registry |
| daemon.md parsing edge cases | Medium | Test with Daniel's format first |

---

## Success Metrics

- [ ] MCP server responds to `tools/list` with 13+ tools
- [ ] Dashboard shows "CONNECTED" with real data
- [ ] Registry shows "✅ MCP" status for Wally Kroeker
- [ ] Claude Code can query daemon via MCP config
- [ ] Zero references to danielmiessler.com in codebase

---

## Notes

**For Agents:**
When reporting task completion, include:
1. What was done
2. Files created/modified
3. Any blockers or questions for next task
4. Test results (if applicable)

**For Wally:**
Cloudflare tasks require dashboard access. Report back with:
- Pages project URL
- Worker URL
- DNS record status

---

*Plan created by Bob Prime | Ready for review*
