---
type: 'agent_requested'
description: 'Example description'
---

# VT Chat AI Development Instructions

## Architecture Overview

VT Chat is a **privacy-first AI chat Turborepo monorepo** with sophisticated subscription tiers. Core structure:

- `apps/web/` - Next.js 14 App Router application (main entry point)
- `packages/ai/` - Agentic Graph System supporting 30+ models (OpenAI, Anthropic, Google, etc.)
- `packages/common/` - Shared React components, hooks, Zustand stores with IndexedDB persistence
- `packages/shared/` - Type-safe constants, utilities, types, Pino logger, Better-Auth integration
- `packages/ui/` - Shadcn/ui base components with minimal design principles
- `packages/actions/` - Server actions for feedback and form handling
- `packages/orchestrator/` - Task orchestration and workflow management

## Critical Development Patterns

### Constants & Configuration (NEVER Hardcode)

**All values must use centralized enums** from `packages/shared/constants/`:

```typescript
// ✅ Use typed constants
import { GEMINI_LIMITS } from '@repo/shared/constants/rate-limits';
import { STORAGE_KEYS } from '@repo/shared/constants/storage';
const limit = GEMINI_LIMITS.FLASH_LITE.FREE_DAY; // 20

// ❌ Never hardcode - will break build
const limit = 20; // Wrong! Use enum pattern
```

Key constants files: `rate-limits.ts`, `routes.ts`, `storage.ts`, `features.ts`, `pricing.ts`, `thinking-mode.ts`, `user-tiers.ts`, `creem.ts`

### Zustand State Management (Critical Pattern)

**Always use individual selectors** to prevent infinite re-renders (common source of bugs):

```typescript
// ✅ Correct - prevents infinite loops
const isThinking = useChatStore(state => state.isThinking);
const currentModel = useChatStore(state => state.currentModel);

// ❌ Wrong - causes infinite re-renders and crashes
const { isThinking, currentModel } = useChatStore(state => ({
    isThinking: state.isThinking,
    currentModel: state.currentModel,
}));
```

### Per-Account Data Isolation

**Privacy-first architecture** with user-specific IndexedDB databases:

```typescript
// Each user gets isolated storage: ThreadDatabase_${userId}
class ThreadDatabase extends Dexie {
    constructor(userId?: string) {
        const dbName = userId ? `ThreadDatabase_${userId}` : 'ThreadDatabase_anonymous';
        super(dbName);
    }
}
```

### Structured Logging (NEVER use console.\*)

**Always use Pino logger** with automatic PII redaction:

```typescript
// ✅ Use structured logger with PII protection
import { log } from '@repo/shared/logger';
log.info({ userId, action: 'chat_started' }, 'User started new chat');
log.error({ error: err.message }, 'Failed to process request');

// ❌ Never use console methods - security risk
console.log('User:', userId); // Exposes PII!
```

## Development Workflow

### Required Tools & Commands

- **Package Manager**: Use `bun` exclusively (not npm/yarn/pnpm)
- **Linting**: `bun run lint` (oxlint) - fast comprehensive checking
- **Format**: `bun run biome:format` - auto-fix formatting issues
- **Build**: `bun run build` - verify compilation across all packages
- **Test**: `bun test` (vitest) with jsdom environment for React components
- **Dev**: `bun dev` - development server with optional React Scan (`bun run dev:scan`)

### Change Planning Workflow

For significant changes, request maintainer feedback on the plan before implementation, then implement and document.

1. **ASK-ORACLE**: Provide problem statement + code context, request detailed implementation plan
2. **Implement**: Follow the agreed plan
3. **REVIEW-ORACLE**: Present diff/changes for approval before merge
4. **Document**: Record plan and decisions in `memory-bank/`

Exceptions: Sev-1 production fixes (implement first, seek retroactive approval within 24h)

### Pre-Implementation Checklist

1. **Always run `bun dev`** and check console for errors before starting new tasks
2. **Run `bun run biome:format`** to auto-fix formatting
3. **Request maintainer review** for complex features (see AGENTS.md)
4. **Never commit changes yourself** - DO NOT execute `git commit` or use commit tools

### Shadcn/ui Component Installation

```bash
# Navigate to packages/ui first, then use bunx
cd packages/ui
bunx shadcn@latest add label
```

## Code Style & Standards

### File Naming & Structure

- **PascalCase**: Components (`UserProfile.tsx`)
- **camelCase**: Hooks, utilities (`useAuth.ts`, `formatDate.ts`)
- **kebab-case**: Files, directories (`user-profile/`, `api-keys.ts`)
- **Named exports** preferred over default exports

### Type Safety

- **TypeScript required** for all new code
- Use centralized types from `@repo/shared/types/`
- Environment-specific types in `@repo/shared/types/environment.ts`

### UI/UX Principles

- **Minimal Design**: Follow shadcn/ui principles, avoid colors/gradients
- **No Hard Colors**: Use `text-muted-foreground`, `bg-muted`, standard shadcn palette
- **Essential Icons Only**: Use lucide-react sparingly
- **Clean Typography**: Rely on hierarchy over visual effects

## Testing Patterns

### Test Organization

- **Integration tests**: `apps/web/app/tests/` (main application testing)
- **Component tests**: `packages/*/components/__tests__/` (unit testing for components)
- **Setup files**: Multiple setup files loaded in sequence by vitest config

### Testing Environment

```typescript
// vitest with jsdom, React Testing Library
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Required for all component tests
expect.extend(matchers);
```

### Test Structure Requirements

- Use `@testing-library/react` for component rendering
- Use `@testing-library/user-event` for interactions
- Use `@testing-library/jest-dom/vitest` for custom matchers
- Cover critical paths and edge cases for all features
- Test timeout: 10 seconds (configured globally)

## Deployment & Production

### Deployment Commands

- **Production**: `./deploy-fly.sh` (interactive) or `./deploy-fly.sh --auto --version patch`
- **Verification**: `bun scripts/verify-production-config.js`

### Environment Configuration

Critical env vars managed through:

- `packages/shared/constants/creem.ts` - Payment config
- `apps/web/lib/config/react-scan.ts` - Development tools
- Multiple safety checks prevent accidental production activation of dev tools

## AI System Integration

### Model Configuration

- **Model definitions**: `packages/ai/models.ts` - Centralized enum with 30+ models
- **Provider setup**: `packages/ai/providers.ts` - OpenAI, Anthropic, Google, Groq, etc.
- **Rate limiting**: `packages/shared/constants/rate-limits.ts` - Per-model, per-tier limits
- **Chat modes**: `packages/shared/config/chat-mode.ts` - Thinking, standard, etc.

### Subscription Tiers & Access Control

- **Free Tier**: All premium models with BYOK + 9 server-funded models
- **VT+ Tier**: Exclusive access to PRO_SEARCH, DEEP_RESEARCH
- **Feature gates**: `packages/shared/constants/features.ts` - Centralized feature definitions
- **User tier checks**: `getGlobalSubscriptionStatus()` for runtime access control

### AI Workflow Architecture

```typescript
// Agentic Graph System in packages/ai/
// - workflow/ - Multi-step reasoning chains
// - tools/ - External tool integrations (MCP protocol)
// - prompts/ - System and user prompt templates
// - cache/ - Response caching for performance
```

## Key Integration Points

### Data Flow Architecture

1. **Chat Store** (`packages/common/store/chat.store.ts`) - Zustand with IndexedDB persistence via Dexie
2. **Per-User Isolation** - `ThreadDatabase_${userId}` ensures complete data separation
3. **Authentication** - Better Auth with subscription tier integration
4. **Payment System** - Creem.io webhooks with automatic tier upgrades

### Cross-Package Communication Patterns

```typescript
// Foundation layer - never imports from other @repo packages
'@repo/shared' - Constants, types, utilities, logger

// Consumer layer - imports from @repo/shared only
'@repo/common' - React components, hooks, Zustand stores

// Application layer - can import from any package
'apps/web' - Next.js app consuming all packages
'@repo/ai' - AI system with workflow engine

// UI layer - minimal dependencies
'@repo/ui' - Pure shadcn/ui components, no business logic
```

### Critical Service Boundaries

- **Client-side AI**: Models run in browser via Web Workers (`packages/ai/worker/`)
- **Server Actions**: Form handling and feedback in `packages/actions/`
- **Task Orchestration**: Background workflows in `packages/orchestrator/`
- **Database Layer**: All queries centralized in `packages/shared/lib/database-queries.ts`

## Memory Bank Documentation

After each session, update relevant files in `memory-bank/` directory following the pattern established in existing `.md` files. Document architectural changes, feature implementations, and critical decisions for future development context.
