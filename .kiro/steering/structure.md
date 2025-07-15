# Project Structure & Organization

## Monorepo Architecture

VT uses a Turborepo-managed monorepo with clear separation between applications and shared packages.

```
vtchat/
├── apps/                     # Applications
│   └── web/                  # Main Next.js 15 web application
├── packages/                 # Shared packages
│   ├── actions/              # Server actions (feedback, etc.)
│   ├── ai/                   # AI models, providers, tools, workflow logic
│   ├── common/               # Shared React components, hooks, context, store
│   ├── orchestrator/         # Workflow engine and task management
│   ├── shared/               # Types, constants, configs, utils, logger
│   ├── tailwind-config/      # Shared Tailwind CSS configuration
│   ├── typescript-config/    # Shared TypeScript configurations
│   └── ui/                   # Base UI components (Shadcn UI)
├── docs/                     # Documentation and guides
├── memory-bank/              # Project context and evolution tracking
└── scripts/                  # Utility scripts (data sync, maintenance)
```

## Main Application Structure (apps/web)

```
apps/web/
├── app/                      # Next.js 15 App Router
│   ├── (dashboard)/          # Dashboard routes (grouped)
│   ├── api/                  # API routes
│   ├── auth/                 # Authentication pages
│   ├── chat/                 # Chat interface and threads
│   ├── components/           # Page-specific components
│   ├── settings/             # User settings pages
│   └── globals.css           # Global styles
├── components/               # Shared UI components
│   ├── ui/                   # Shadcn UI components
│   ├── admin/                # Admin-specific components
│   └── charts/               # Chart visualization components
├── lib/                      # Utility libraries
│   ├── actions/              # Server actions
│   ├── ai/                   # AI integration logic
│   ├── auth/                 # Authentication configuration
│   ├── database/             # Database schemas and queries
│   ├── services/             # External service integrations
│   └── utils/                # Utility functions
├── hooks/                    # Custom React hooks
├── e2e/                      # End-to-end tests (Playwright)
└── tests/                    # Unit tests (Vitest)
```

## Package Organization

### @repo/ai

- AI models and provider configurations
- Semantic tool router with OpenAI embeddings
- Workflow orchestration and task management
- Tool definitions and implementations

### @repo/common

- Shared React components and hooks
- Context providers and state management
- Common UI patterns and layouts
- Shared TypeScript types

### @repo/shared

- Core utilities and helper functions
- Configuration management
- Logging infrastructure (Pino with PII redaction)
- Constants and enums

### @repo/ui

- Base Shadcn UI components
- Design system primitives
- Tailwind CSS configurations
- Reusable UI patterns

## File Naming Conventions

- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Files**: kebab-case (e.g., `user-profile.tsx`)
- **Hooks**: camelCase starting with 'use' (e.g., `useUserData.ts`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)

## Import/Export Patterns

- **Preferred**: Named exports over default exports
- **Package Imports**: Use workspace aliases (`@repo/shared`, `@repo/ui`)
- **Relative Imports**: For same-package files
- **Barrel Exports**: Use index.ts files for clean package interfaces

## Configuration Files

- **Environment**: `.env.local` for development, `.env.example` for templates
- **TypeScript**: Shared configs in `packages/typescript-config/`
- **Tailwind**: Shared config in `packages/tailwind-config/`
- **Build**: `turbo.json` for monorepo task orchestration
- **Code Quality**: `biome.json` for formatting/linting rules

## Documentation Structure

- **Core Docs**: `docs/` directory with categorized guides
- **API Docs**: Inline JSDoc comments for functions and components
- **Setup Guides**: `docs/guides/` for feature-specific documentation
- **Memory Bank**: `memory-bank/` for project evolution tracking
- **Help Center**: `docs/help-center/` for end-user documentation

## Testing Organization

- **Unit Tests**: `apps/web/tests/` using Vitest
- **E2E Tests**: `apps/web/e2e/` using Playwright
- **Component Tests**: Co-located with components when appropriate
- **Integration Tests**: `apps/web/tests/` for API and service testing

## Asset Management

- **Static Assets**: `apps/web/public/` for images, icons, manifests
- **Fonts**: Loaded via Next.js font optimization
- **Icons**: Lucide React for consistent iconography
- **Images**: Next.js Image component with CDN optimization
