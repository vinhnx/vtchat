# AGENT.md - Development Guidelines

## Build/Test/Lint Commands
- **Dev**: `bun dev` (starts turbo dev)
- **Build**: `bun run build` (turbo build)
- **Lint**: `bun run lint` (turbo lint)
- **Format**: `bun run format` (prettier write)
- **Format Check**: `bun run format:check`
- **Database**: `cd apps/web && bun run generate` (drizzle-kit)

## Code Style Guidelines
- **Package Manager**: Bun (v1.1.19)
- **Monorepo**: Turbo with apps/* and packages/* structure
- **Formatting**: Prettier with single quotes, 4-space tabs, 100 char width, semicolons, trailing commas
- **TypeScript**: Strict mode enabled, ESM interop, force consistent casing
- **Imports**: Use workspace packages via `@repo/*` or `@vtchat/*`
- **Components**: Radix UI + shadcn/ui patterns, Tailwind for styling

## Project Structure
- **Main App**: `apps/web/` (Next.js 15)
- **Shared Code**: `packages/` (ui, common, ai, shared, typescript-config, tailwind-config)
- **Database**: Drizzle ORM + Neon PostgreSQL
- **Auth**: Better-Auth integration
- **AI**: Multiple providers (OpenAI, Anthropic, Google, Groq)

## Memory Bank System
- Follow Cline's memory bank patterns in `.clinerules`
- Read all memory bank files at start of tasks
- Update `memory-bank/` files when making significant changes
