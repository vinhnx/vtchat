# AGENT.md - Development Guidelines

## Tech Stack & Project Overview

- **Monorepo**: Turborepo-managed, with `apps/` (main: Next.js web app) and `packages/` (shared code: `common`, `shared`, `ai`, `ui`, etc.).
- **Core Technologies**: Next.js (App Router, v14+), React, TypeScript, Tailwind CSS, shadcn/ui, Zustand, Drizzle ORM (Neon PostgreSQL), Better-Auth, Framer Motion, Lucide icons.
- **AI/Agents**: Agentic Graph System in `packages/ai/` (supports OpenAI, Anthropic, Google, Groq, etc.).
- **Best Practices**: Use environment variables, enums for string keys, named exports, shadcn/ui for UI, Bun for all scripts, and document changes in `memory-bank/`.

## Package Management

- Use `bun` instead of `npm` for all operations

## Code Style

- Make sure no string in #codebase, use enum pattern.
- Don't hard code values in the codebase.
- Use environment variables for configuration (e.g., API keys, product IDs, Arcjet keys)
- Use centralize enum for custom reusable keys.
- 4-space indentation, single quotes, 100 char line length
- PascalCase components, camelCase hooks/utils, kebab-case files
- Named exports preferred over default exports

## Tech Stack

- Next.js 14 with App Router, TypeScript, Tailwind CSS
- Zustand for state, Drizzle ORM for DB, Better Auth for authentication
- Arcjet for application security (rate limiting, bot protection, email validation, WAF)
- Framer Motion for animations, Radix UI components
- Shadcn/ui for UI components, Lucide icons, clsx for classnames
- Payment integration with Creem.io

## Architecture

- Turborepo monorepo: `apps/` and `packages/`
- `@repo/common` - components/hooks, `@repo/shared` - types/utils
- Use `'use client'` for client components

## Domain Knowledge

- Chat application with AI models (OpenAI, Anthropic, etc.)
- Subscription tiers: VT_BASE (default) and VT_PLUS
- MCP integration for external tools
- Use promptBoost tools to enhance prompt quality
- You can use playwright MCP tool to test web components integration

## Testing

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

- **NEVER use console.log/error/warn** - Always use Pino logger (`@repo/shared/logger`)
- **Import**: `import { log } from '@repo/shared/logger'` for basic logging
- **Usage**: `log.info({ key: value }, 'message')`, `log.error({ error }, 'message')`
- **Automatic PII redaction** for sensitive fields (apiKey, token, password, email, etc.)
- **Structured logging** - Always pass metadata as first parameter, message as second
- **API key security** - API keys automatically redacted in logs (apiKey, api_key, Authorization headers)
- **Next.js compatible** configuration that avoids worker thread bundling issues
- **Request tracing** with `withRequestId()` and `withLogging()` middleware
- **Performance timing** with `createTimer()` for monitoring operations
- **Child loggers** with `createChildLogger()` for scoped context
- **Environment-specific** configurations (development/production/test)
- **Log levels**: debug (dev only), info, warn, error, fatal

## Documentation

- Use Markdown files for documentation, those guides with Guides markdown files should be in `docs/guides/`
- You can search for documentation using `context7` MCP tool
- You can search the internet using MCP tool `tavily-search`
- Documentation should be in `docs/` directory
- **Security Documentation**: Comprehensive Arcjet security implementation documented in `docs/SECURITY.md` and `docs/guides/arcjet-security.md`
- **Help Center = FAQ**: When user mentions "help center", they mean the FAQ page for end users
- After every session, you should document what's been done and report status then update `memory-bank/*.md` md files in that directory.
- Periodically update `AGENT.md`, `AGENTS.md` and `CLAUDE.md` with latest changes from #codebase and #changes.
