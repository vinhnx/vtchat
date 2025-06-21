# AGENT.md - Development Guidelines

## Tech Stack & Project Overview

- **Monorepo**: Managed with Turborepo, using `apps/` for applications (mainly Next.js web app in `apps/web`) and `packages/` for shared libraries (`common`, `shared`, `ai`, `ui`, etc.).
- **Frontend/Backend**: Next.js (App Router, v14+), React, TypeScript.
- **Styling/UI**: Tailwind CSS, shadcn/ui, Radix UI, Lucide icons, Framer Motion for animation.
- **State Management**: Zustand.
- **Database/ORM**: Drizzle ORM with Neon PostgreSQL.
- **Authentication**: Better-Auth (migration from NextAuth.js in progress).
- **AI/Agents**: Agentic Graph System in `packages/ai/` (supports OpenAI, Anthropic, Google, Groq, etc.).
- **Testing**: Vitest, @testing-library/react, tests in `apps/web/app/tests/`.
- **Package Manager**: Bun (use `bun` and `bunx` for all scripts and installs).

## Key Guidelines

- Use environment variables for all configuration (no hardcoded values).
- Use enums for string constants and keys.
- Prefer named exports, PascalCase for components, camelCase for hooks/utils, kebab-case for files.
- Use shadcn/ui and @repo/ui for UI components, Tailwind for styling.
- Document changes in `memory-bank/` and keep this file up to date.

## Build/Test/Lint Commands

- **Dev**: `bun dev` (starts turbo dev)
- **Build**: `bun run build` (turbo build)
- **Lint**: `bun run lint` (turbo lint)
- **Format**: `bun run format` (prettier write)
- **Format Check**: `bun run format:check`
- **Database**: `cd apps/web && bun run generate` (drizzle-kit)

## Code Style Guidelines

- **Package Manager**: Bun (v1.1.19)
- **Monorepo**: Turbo with apps/_ and packages/_ structure
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

## AI Agent System Overview

The project includes an "Agentic Graph System" located in `packages/ai/` for building AI agent workflows. Key features and concepts include:

- **Graph-Based Workflow Management**: Workflows are structured as graphs of interconnected nodes.
- **Specialized Node Types**:
    - **Executor Node**: Handles specific task execution.
    - **Router Node**: Provides intelligent routing between nodes.
    - **Memory Node**: Manages state and interaction history.
    - **Observer Node**: Monitors system behavior and analyzes patterns.
- **Event-Driven Architecture**: The system uses events for communication and state changes (e.g., `workflow.started`, `node.processing`).
- **Multiple LLM Provider Support**: Integrates with OpenAI, Anthropic, and Together AI.
- **Configuration**: Managed via environment variables (see `packages/ai/.env.example`).
- **Core Components**:
    - `packages/ai/workflow/flow.ts`: Defines workflow logic.
    - `packages/ai/worker/worker.ts`: Manages workflow execution.
    - `packages/ai/tools/mcp.ts`: Handles MCP tool integration.
