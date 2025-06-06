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
- Zustand for state, Drizzle ORM for DB, Better Auth for authentication
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

## Bun

- Use `bun` instead of `npm` or `yarn`
- Use `bun` for all package management and script execution

## UI components

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
- Use `console.error` for logging errors
- Use `toast` from `@repo/ui` for user notifications
- Use `ErrorBoundary` for catching errors in React components

## Documentation

- Use Markdown files for documentation
- You can search for documentation using `context7` MCP tool
- You can search the internet using MCP tool `tavily-search`
- Documentation should be in `docs/` directory
