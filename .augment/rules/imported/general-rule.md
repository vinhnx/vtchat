---
type: 'agent_requested'
description: 'Example description'
---

# Development Guidelines

## Tech Stack & Project Overview

- **Monorepo**: Turborepo-managed, with `apps/` (main: Next.js web app) and `packages/` (shared code: `common`, `shared`, `ai`, `ui`, etc.).
- **Core Technologies**: Next.js 15 (App Router), React 19.0.0, TypeScript, Tailwind CSS, shadcn/ui, Zustand, Drizzle ORM (Neon PostgreSQL), Better-Auth, Framer Motion, Lucide icons.
- **AI/Agents**: Agentic Graph System in `packages/ai/` (supports OpenAI, Anthropic, Google, Groq, etc.).
- **Best Practices**: Use environment variables, enums for string keys, named exports, shadcn/ui for UI, Bun for all scripts, and document changes in `memory-bank/`.

## Package Management

- Use `bun` instead of `npm` for all operations

## Code Style

- Make sure no string in #codebase, use enum pattern.
- Don't hard code values in the codebase.
- Use environment variables for configuration (e.g., API keys, product IDs, ADMIN_USER_IDS for Better-Auth admin access - supports comma-separated user IDs)
- Use centralize enum for custom reusable keys.
- 4-space indentation, single quotes, 100 char line length
- PascalCase components, camelCase hooks/utils, kebab-case files
- Named exports preferred over default exports
- Use oxlint for fast comprehensive linting (run `bun run lint`)
- Use Prettier for markdown files only (run `bun run format`)

## UI/UX Design Principles

- **Minimal Design**: Follow shadcn/ui principles with clean, minimal aesthetics
- **No Colors**: Use only black/white/muted colors (avoid gradients, bright colors)
- **Minimal Icons**: Reduce icon usage to essentials only
- **Clean Typography**: Rely on typography hierarchy over visual decorations
- **Neutral Palette**: Use `text-muted-foreground`, `bg-muted`, standard shadcn colors
- **Simple Interactions**: Avoid flashy animations or complex visual effects

## Development Workflow

- Make sure you DO NOT CREATE ANY debug and test FILES IN ./ ROOT DIRECTORY. Only use files in /temps or apps/web/app/tests/ or /scripts.
- Make sure you run `bun dev` and check the app console to see if there are any errors before starting to work on anothers task. fix it first.
- **REQUIRED**: Always consult Oracle before implementing any new task - ask for detailed plan first
- **REQUIRED**: Consult Oracle before implementing any task (see Oracle Consultation Workflow below)
- **REQUIRED**: Run `bun run biome:format` to auto-fix formatting issues
- **NEVER commit changes yourself** - DO NOT execute `git commit` unless you have my approval
- Run `bun run lint` (oxlint) for comprehensive error checking
- Run `bun run build` to verify compilation before major changes
- Test core functionality after significant changes

## Deployment

⚠️ **CRITICAL DEPLOYMENT POLICY** ⚠️
**DO NOT DEPLOY TO PRODUCTION FLY.IO WITHOUT EXPLICIT USER APPROVAL**

- NEVER run `./deploy-fly.sh` without user permission
- Always ask for approval before any production deployment
- This applies to ALL deployment commands and scripts

- **Production Deployment**: Use `./deploy-fly.sh` to deploy to Fly.io (ONLY WITH USER APPROVAL)
    - **Interactive**: `./deploy-fly.sh` (prompts for version bump type)
    - **Automated**: `./deploy-fly.sh --auto --version patch` (patch/minor/major)
    - **Features**: Auto-commit, semantic versioning, git tagging, Fly.io deployment
    - **App URL**: https://vtchat.io.vn (primary) / https://vtchat.fly.dev (backup)
    - Script handles: git status checks, version tagging, pushing to remote, Fly.io deployment

### Git Hooks

- **Manual fixes**: Run `bun run biome:format` and `bun run biome:check --unsafe` for comprehensive fixes
- **Philosophy**: Encourage good practices without blocking development flow

## Tech Stack

- Next.js 15 with App Router, React 19.0.0, TypeScript, Tailwind CSS
- Zustand for state, Drizzle ORM for DB, Better Auth for authentication
- Custom bot detection with Better-Auth plugin using isbot library
- Framer Motion for animations, Radix UI components
- Shadcn/ui for UI components, Lucide icons, clsx for classnames
- Payment integration with Creem.io

## Architecture

- Turborepo monorepo: `apps/` and `packages/`
- `@repo/common` - components/hooks, `@repo/shared` - types/utils
- Use `'use client'` for client components

## Domain Knowledge

- Chat application with AI models (OpenAI, Anthropic, etc.)
- Subscription tiers:VT offers free tier, and with VT+ focusing only on 3 exclusive research capabilities: Deep Research, Pro Search.
- MCP integration for external tools
- Use promptBoost tools to enhance prompt quality
- You can use playwright MCP tool to test web components integration

## Testing

- use ChatMode.ChatMode.GEMINI_2_5_FLASH_LITE to test instead GEMINI_2_5_PRO because cost.
- Test files should be in `apps/web/app/tests/`. Example: `./test-vt-plus-only.js` should be moved to `apps/web/app/tests/test-vt-plus-only.js`
- Every implemented feature should have a test case to maintain quality
- Every unit test should cover critical paths and edge cases
- Use `vitest` for testing, with `@testing-library/react` for React components.
- Run tests regularly to ensure code quality
- Use `@testing-library/jest-dom/vitest` for custom matchers
- Use `@testing-library/user-event` for simulating user interactions
- Use `@testing-library/react` for rendering components in tests
- Use `@testing-library/jest-dom` for custom matchers in tests
- Use `@testing-library/react-hooks` for testing custom hooks
- Use `@testing-library/dom` for DOM-related utilities in tests

## Bun

- Use `bun` instead of `npm` or `yarn`
- Use `bun` for all package management and script execution

## UI components

- when try to install components, navigatete to ~/Developer/learn-by-doing/vtchat/packages/ui first, then use bunx
- To install shadcn components, check example command: `npx shadcn@latest add label`
- Use shadcn/ui components for UI elements
- Use `@repo/ui` for shared UI components
- Use lucide icons from `lucide-react`
- Use Tailwind CSS for styling
- Use `clsx` for conditional class names
- Use `tailwind-merge` for merging Tailwind classes
- Use `framer-motion` for animations

## Error Handling

- Use `try/catch` for async operations
- Use Pino logger from `@repo/shared/logger` for structured logging with automatic PII redaction
- Use `toast` from `@repo/ui` for user notifications
- Use `ErrorBoundary` for catching errors in React components

## Logging

- DO NOT USE console.log/error/warn\*\* - Always use Pino logger log.info/error/debug/warn (`@repo/shared/lib/logger`)
- **Import**: `import { log } from '@repo/shared/lib/logger'` for basic logging (use `log` not `logger`)
- **Usage**: `log.info({ key: value }, 'message')`, `log.error({ error }, 'message')`
- **Automatic PII redaction** for sensitive fields (apiKey, token, password, email, etc.)
- **Structured logging** - Always pass metadata as first parameter, message as second
- **API key security** - API keys automatically redacted in logs (apiKey, api_key, Authorization headers)

- **PII masking** - All string fields automatically masked using `maskPII()` function
- **Environment-specific** configurations (development/production/test)
- **Log levels**: debug (dev only), info, warn, error, fatal

## Documentation

- Use Markdown files for documentation, those guides with Guides markdown files should be in `docs/guides/`
- You can search for documentation using `context7` MCP tool
- You can search the internet using MCP tool `tavily-search`
- Documentation should be in `docs/` directory
- **Help Center = FAQ**: When user mentions "help center", they mean the FAQ page for end users
- After every session, you should document what's been done and report status then update `memory-bank/*.md` md files in that directory.
- Periodically update `AGENT.md`, `AGENTS.md` and `CLAUDE.md` with latest changes from #codebase and #changes.

### Session Commands

**Continue Session**: 'continue_session [session_file' (alias continue)
continue')

- Resumes a previous Amp session with oracle-enhanced analysis
- If no file provided, lists 5 most recent sessions from ./local_ai_docs/sessions/\*
- Usage: Ask Amp to "run continue_session" or "use continue_session with [filename]"

**Save Session**: save_session [options] (alias save')

- Saves current session with comprehensive analysis
- Options:
- '--deepthink': Enhanced analysis using oracle tool for deeper insights
- '--fast': Quick save without oracle analysis for faster execution
- Creates files in •
  •/local_ai_docs/sessions/ with format: "[datel-[title]-amp.md"
- Usage: Ask Amp to "run save_session" or "save_session --deepthink"

**Plan Loop**: 'plan_loop [spec_file] [options]' (alias 'plan\*)

- Comprehensive feature planning with 7-step process
- Options:
- '--deepthink: Oracle-enhanced planning and peer review
- Creates detailed implementation specifications
- Usage: Ask Amp to "run plan_loop with spec.md --deepthink"

**Implementation Loop**: "implementation_loop [spec_file] [options] (alias "impl')

- Iterative implementation with testing and validation
- Options:
- '--deepthink': Oracle analysis for complex decisions
- '--fast': Skip oracle analysis for rapid cycles
- Includes quality gates and automatic testing
- Usage: Ask Amp to "run implementation_loop with spec.md --deepthink"

### Bun

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Testing

Use `bun test` to run tests.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## Frontend

Use HTML imports with `Bun.serve()`. Don't use `vite`. HTML imports fully support React, CSS, Tailwind.

Server:

```ts#index.ts
import index from "./index.html"

Bun.serve({
  routes: {
    "/": index,
    "/api/users/:id": {
      GET: (req) => {
        return new Response(JSON.stringify({ id: req.params.id }));
      },
    },
  },
  // optional websocket support
  websocket: {
    open: (ws) => {
      ws.send("Hello, world!");
    },
    message: (ws, message) => {
      ws.send(message);
    },
    close: (ws) => {
      // handle close
    }
  },
  development: {
    hmr: true,
    console: true,
  }
})
```

HTML files can import .tsx, .jsx or .js files directly and Bun's bundler will transpile & bundle automatically. `<link>` tags can point to stylesheets and Bun's CSS bundler will bundle.

```html#index.html
<html>
  <body>
    <h1>Hello, world!</h1>
    <script type="module" src="./frontend.tsx"></script>
  </body>
</html>
```

With the following `frontend.tsx`:

```tsx#frontend.tsx
import React from "react";

// import .css files directly and it works
import './index.css';

import { createRoot } from "react-dom/client";

const root = createRoot(document.body);

export default function Frontend() {
  return <h1>Hello, world!</h1>;
}

root.render(<Frontend />);
```

Then, run index.ts

```sh
bun --hot ./index.ts
```

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.md`.
