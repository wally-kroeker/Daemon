---
project: daemon
last_updated: 2026-01-27
---

# Daemon Project Tasks

## In Progress

_No tasks currently in progress_

## Pending

### Dynamic Daemon Updates via Bob
- **status**: pending
- **activeForm**: Creating natural language daemon update mechanism
- **priority**: medium
- **assignee**: Bob
- **notes**: Enable "Bob, add this project to my daemon" commands. Full architecture review completed 2026-02-09.
- **dependencies**: None
- **home**: BobPack (`bob-daemon-skill`) in Bob2.0 repo — NOT in daemon repo (public)
- **implementation-plan**:
  - **Phase 1 — Foundation (~1 hr):** Create bob-daemon-skill BobPack + DaemonParser.ts (read/write daemon.md sections). Acceptance: round-trip parse without corruption.
  - **Phase 2 — Read/Update (~30 min):** UpdateSection.md and ReadDaemon.md workflows + security review integration. Acceptance: "Bob, add book to daemon" works end-to-end.
  - **Phase 3 — New Sections (~30 min):** CURRENTLY_READING, RECENT_IDEAS, WORKING_ON section templates + AddSection.md workflow. Acceptance: all three section types creatable via natural language.
  - **Phase 4 — Security Fixes (~20 min):** Fix TELOS paths (lowercase→CORE/USER/TELOS/), fix stale home dir references in pre-commit hook, add .githooks/sensitive-patterns.local (gitignored) for name checking.
  - **Phase 5 — Publish Workflow (~20 min):** PublishDaemon.md workflow (commit+push automation from any directory). Acceptance: one command → live on daemon.wallykroeker.com.
- **design-principles**: One command, zero follow-up. ADHD-optimized. Fail loudly, recover gracefully.
- **security-gaps-found**:
  - TELOS paths in security docs reference old lowercase paths
  - Home dir references in pre-commit hook and docs are stale (wrong username)
  - Pre-commit hook needs gitignored local patterns file for name checking

### Frontend Hierarchy Redesign
- **status**: pending
- **activeForm**: Redesigning dashboard with tiered visual hierarchy
- **priority**: low
- **assignee**: Howard
- **notes**: Implement PLAN.md vision - Location full width, Core Purpose 2-col, Live Updates 3-col, etc. Makes daemon feel more "live" and personal.
- **dependencies**: None

### Add CURRENTLY_READING Section
- **status**: pending
- **activeForm**: Adding currently reading section to daemon.md
- **priority**: low
- **assignee**: Howard
- **notes**: Part of "live daemon" vision. Shows current book being read with start date. Updates via natural language.
- **dependencies**: Dynamic Daemon Updates via Bob

### Add RECENT_IDEAS Section
- **status**: pending
- **activeForm**: Adding recent ideas section to daemon.md
- **priority**: low
- **assignee**: Howard
- **notes**: Keep last 5 ideas, auto-rotate. Updates via "New idea: ..." pattern.
- **dependencies**: Dynamic Daemon Updates via Bob

### Add WORKING_ON Section
- **status**: pending
- **activeForm**: Adding working on section to daemon.md
- **priority**: low
- **assignee**: Howard
- **notes**: Primary/secondary/exploring focus areas. Shows current work context.
- **dependencies**: Dynamic Daemon Updates via Bob

### Sync with wallykroeker.com Projects
- **status**: pending
- **activeForm**: Creating shared projects data source across sites
- **priority**: low
- **assignee**: Bill
- **notes**: Single source of truth for projects. Consider GitHub JSON file or API endpoint.
- **dependencies**: Dynamic Daemon Updates via Bob

### Real-Time Activity Broadcasting
- **status**: deferred
- **activeForm**: Implementing real-time daemon status broadcasting
- **priority**: low
- **assignee**: Bill
- **notes**: Pie-in-the-sky vision. WebSocket/SSE for live updates, Cloudflare Durable Objects, webhook integrations. Requires privacy controls.
- **dependencies**: Dynamic Daemon Updates via Bob, Add WORKING_ON Section

### Upstream Contribution
- **status**: pending
- **activeForm**: Contributing improvements to danielmiessler/Daemon upstream
- **priority**: low
- **assignee**: Wally
- **notes**: Share dynamic update mechanism, real-time activity tools, docs improvements if generally useful.
- **dependencies**: Dynamic Daemon Updates via Bob

## Completed

### Phase 1: Research & Specification
- **status**: completed
- **activeForm**: Completed MCP protocol research and specification
- **priority**: high
- **assignee**: Riker, Bill, Wally
- **notes**: MCP protocol research, worker spec, Cloudflare infrastructure setup all complete. Completed 2026-01-11.
- **dependencies**: None

### Phase 2: Implementation
- **status**: completed
- **activeForm**: Completed MCP worker and dashboard implementation
- **priority**: high
- **assignee**: Mario, Howard
- **notes**: MCP Worker implemented with 19 passing tests, dashboard updated for Wally's data, daemon.md personalized. Completed 2026-01-11.
- **dependencies**: Phase 1: Research & Specification

### Phase 3: Deployment & Testing
- **status**: completed
- **activeForm**: Completed deployment and end-to-end testing
- **priority**: high
- **assignee**: Wally, Riker
- **notes**: Deployed to daemon.wallykroeker.com + mcp.daemon.wallykroeker.com, all tests passing. Completed 2026-01-11.
- **dependencies**: Phase 2: Implementation

### Phase 4: Registry & Cleanup
- **status**: completed
- **activeForm**: Completed registry registration and cleanup
- **priority**: medium
- **assignee**: Wally, Howard
- **notes**: Registry status updated, infrastructure cleaned, docs updated. Project complete. Completed 2026-01-11.
- **dependencies**: Phase 3: Deployment & Testing

## Deferred

_No deferred tasks_
