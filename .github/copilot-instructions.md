# VT Chat AI Development Instructions

## Architecture Overview

VT Chat is a **Turborepo monorepo** with privacy-first AI chat capabilities. Key structure:
- `apps/web/` - Next.js 14 App Router application
- `packages/ai/` - Agentic Graph System with multi-provider support (OpenAI, Anthropic, Google, etc.)
- `packages/common/` - Shared React components, hooks, stores (Zustand)
- `packages/shared/` - Type-safe constants, utilities, types
- `packages/ui/` - Shadcn/ui base components

## Critical Development Patterns

### Constants & Configuration
**Never hardcode values** - use centralized enums in `packages/shared/constants/`:
```typescript
// ✅ Use constants
import { GEMINI_LIMITS } from '@repo/shared/constants/rate-limits';
const limit = GEMINI_LIMITS.FLASH_LITE.FREE_DAY;

// ❌ Never hardcode
const limit = 20; // Wrong!
```

Key constants: `rate-limits.ts`, `routes.ts`, `storage.ts`, `features.ts`, `pricing.ts`, `thinking-mode.ts`

### Zustand State Management
**Always use individual selectors** to prevent infinite re-renders:
```typescript
// ✅ Correct
const value1 = useStore(state => state.value1);
const value2 = useStore(state => state.value2);

// ❌ Wrong - causes infinite loops
const { value1, value2 } = useStore(state => ({ value1: state.value1, value2: state.value2 }));
```

### Environment Variables
Use typed environment utilities from `@repo/shared/utils/env`:
- `isProduction`, `isDevelopment` for environment checks
- `devLog`, `prodSafeLog` for safe logging
- Centralized config in `packages/shared/constants/creem.ts` for payment integration

## Development Workflow

### Required Tools & Commands
- **Package Manager**: Use `bun` for all operations (not npm/yarn)
- **Linting**: `bun run lint` (oxlint) - fast comprehensive checking
- **Format**: `bun run biome:format` - auto-fix formatting issues
- **Build**: `bun run build` - verify compilation
- **Test**: `bun test` or `vitest` for unit tests
- **Dev**: `bun dev` - development server with React Scan support

### Pre-Implementation Requirements
1. **Always run `bun dev`** and check console for errors before starting new tasks
2. **Consult Oracle workflow** for complex features (documented in `AGENT.md`)
3. **Never commit changes** - DO NOT use `git commit` or commit tools

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

Tests located in:
- `apps/web/app/tests/` - Integration tests
- `packages/*/components/__tests__/` - Component unit tests

Use vitest with jsdom environment. Example structure:
```typescript
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
```

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
- Models defined in `packages/ai/models.ts` and `packages/shared/config/chat-mode.ts`
- Rate limiting through `packages/shared/constants/rate-limits.ts`
- Provider configuration in `packages/ai/providers.ts`

### Subscription Tiers
- **Free**: All premium models with BYOK + 9 free models
- **VT+**: Additional research features (PRO_SEARCH, DEEP_RESEARCH, RAG)
- Configuration in `packages/shared/constants/features.ts`

## Key Integration Points

### Data Flow
1. **Chat Store** (`packages/common/store/`) - Zustand with persistence
2. **Local Storage** - IndexedDB via Dexie.js for privacy-first approach
3. **Authentication** - Better Auth with user tier management
4. **Payment** - Creem.io integration with webhook handling

### Cross-Package Communication
- `@repo/shared` - Constants, types, utilities (foundation layer)
- `@repo/common` - React components, hooks consuming shared layer
- `@repo/ai` - AI providers, models, workflow engine
- `apps/web` - Main application consuming all packages

## Memory Bank Documentation

After each session, update relevant files in `memory-bank/` directory following the pattern established in existing `.md` files. Document architectural changes, feature implementations, and critical decisions for future development context.
