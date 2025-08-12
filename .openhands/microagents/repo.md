# VT (VTChat) Repository Overview

## Project Description

VT is a production-ready, privacy-focused AI chat application that delivers cutting-edge AI capabilities through an extremely generous free tier and focused premium subscription. Built with modern web technologies, it offers advanced AI reasoning, document processing, web search integration, and comprehensive multi-AI provider support. The application is live at [vtchat.io.vn](https://vtchat.io.vn) and emphasizes privacy-first architecture with local-first storage.

## File Structure

This is a Turborepo-managed monorepo with the following structure:

```
vtchat/
├── apps/
│   └── web/              # Next.js 15 web application (main app)
├── packages/
│   ├── actions/          # Server actions (e.g., feedback)
│   ├── ai/               # AI models, providers, tools, semantic router
│   ├── common/           # Shared React components, hooks, context, store
│   ├── orchestrator/     # Workflow engine and task management
│   ├── shared/           # Shared types, constants, configs, utils, logger
│   ├── tailwind-config/  # Shared Tailwind CSS configuration
│   ├── typescript-config/# Shared TypeScript configurations
│   └── ui/               # Base UI components (Shadcn UI)
├── docs/                 # Extensive documentation and guides
├── memory-bank/          # Project context and evolution tracking
└── scripts/              # Utility scripts
```

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Neon PostgreSQL, Better Auth, Drizzle ORM, IndexedDB (Dexie.js)
- **Build Tools**: Bun (runtime/package manager), Turborepo, Vitest, Biome
- **AI Integration**: Vercel AI SDK with multiple providers (OpenAI, Anthropic, Google, etc.)
- **Deployment**: Fly.io with 2-region setup

## Development Commands

**Prerequisites**: Bun v1.1.19+ and Node.js 20+

```bash
# Setup
bun install                    # Install dependencies
cp apps/web/.env.example apps/web/.env.local  # Configure environment
cd apps/web && bun run generate  # Setup database

# Development
bun dev                       # Start development server with Turbopack
bun build                     # Build for production
bun start                     # Start production server
bun test                      # Run tests with Vitest
bun test:coverage            # Run tests with coverage

# Code Quality
bun lint                     # Lint with oxlint
bun run biome:check         # Check/fix formatting with Biome
```

## Key Features for New Developers

- **Privacy-First**: All chat data stored locally in browser IndexedDB, never on servers
- **Multi-AI Support**: 9+ free AI models plus premium models with BYOK (Bring Your Own Key)
- **Advanced Tools**: Document processing, web search, structured output extraction, mathematical calculator
- **Subscription System**: Integrated with Creem.io for payment processing
- **Modern Stack**: Latest Next.js 15, React 19, with comprehensive TypeScript coverage
- **Extensive Documentation**: Check `/docs/` for detailed guides on setup, deployment, and features

## Getting Started

1. Clone the repo and run `bun install`
2. Copy `.env.example` to `.env.local` and configure required variables (DATABASE_URL, BETTER_AUTH_SECRET, AI provider keys)
3. Run `cd apps/web && bun run generate` to setup the database
4. Start development with `bun dev`
5. Visit the app at your configured `NEXT_PUBLIC_BASE_URL`

The project has comprehensive documentation in the `/docs/` folder covering everything from local development to production deployment.
