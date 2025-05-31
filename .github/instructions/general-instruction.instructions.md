---
applyTo: '**'
---

# VTChat AI Assistant Guidelines

## Package Management

- Use `bun` instead of `npm` for all operations

## Code Style

- 4-space indentation, single quotes, 100 char line length
- PascalCase components, camelCase hooks/utils, kebab-case files
- Named exports preferred over default exports

## Tech Stack

- Next.js 14 with App Router, TypeScript, Tailwind CSS
- Zustand for state, Prisma for DB, Clerk for auth
- Framer Motion for animations, Radix UI components

## Architecture

- Turborepo monorepo: `apps/` and `packages/`
- `@repo/common` - components/hooks, `@repo/shared` - types/utils
- Use `'use client'` for client components

## Domain Knowledge

- Chat application with AI models (OpenAI, Anthropic, etc.)
- Subscription tiers: VT_BASE (default) and VT_PLUS
- MCP integration for external tools
- Use promptBoost tools to enhance prompt quality
