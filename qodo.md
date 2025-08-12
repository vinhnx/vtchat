# Repository Tour

## 🎯 What This Repository Does

VTChat is a production-ready, privacy-focused AI chat application that delivers cutting-edge AI capabilities through an extremely generous free tier and focused premium subscription. Built with modern web technologies and a privacy-first architecture, it offers advanced AI reasoning, document processing, web search integration, and comprehensive multi-AI provider support.

**Key responsibilities:**
- Provide secure, privacy-first AI chat interface with local data storage
- Support multiple AI providers (OpenAI, Anthropic, Google, xAI, local models)
- Enable advanced features like document processing, web search, and structured output
- Manage user subscriptions and feature access control
- Deliver real-time AI responses with streaming capabilities

---

## 🏗️ Architecture Overview

### System Context
```
[User Browser] → [Next.js 15 App] → [AI Workflow System] → [Multiple AI Providers]
                        ↓                    ↓
                [IndexedDB Storage]    [Neon PostgreSQL]
                        ↓                    ↓
                [Local Privacy]      [User/Subscription Data]
```

### Key Components
- **Frontend Application** - Next.js 15 with React 19, providing the chat interface and user experience
- **AI Workflow System** - Intelligent routing and orchestration of AI requests across multiple providers
- **Privacy-First Storage** - Local IndexedDB storage for all chat data, ensuring zero server-side chat storage
- **Authentication System** - Better Auth integration with OAuth providers and session management
- **Subscription Management** - Creem.io integration for VT+ premium features and billing
- **Multi-Provider AI** - Seamless integration with OpenAI, Anthropic, Google, xAI, and local AI models

### Data Flow
1. User initiates chat session through Next.js frontend interface
2. AI workflow system routes requests to appropriate providers based on model selection
3. Chat data is stored locally in browser IndexedDB for complete privacy
4. User authentication and subscription data managed via Neon PostgreSQL
5. Real-time streaming responses delivered back to the user interface

---

## 📁 Project Structure [Partial Directory Tree]

```
vtchat/
├── apps/
│   └── web/                    # Next.js 15 web application (main frontend)
│       ├── app/                # Next.js App Router pages and API routes
│       │   ├── api/            # Backend API endpoints
│       │   ├── chat/           # Chat interface pages
│       │   └── layout.tsx      # Root layout with providers
│       ├── components/         # React components specific to web app
│       ├── lib/                # Web app utilities and configurations
│       │   ├── auth-server.ts  # Better Auth server configuration
│       │   └── database/       # Database schema and connections
│       └── middleware.ts       # Next.js middleware for auth/routing
├── packages/
│   ├── actions/                # Server actions for form handling
│   ├── ai/                     # AI models, providers, and workflow logic
│   │   ├── models.ts           # AI model definitions and configurations
│   │   ├── providers.ts        # AI provider integrations
│   │   ├── tools/              # AI tools (web search, document processing)
│   │   └── workflow/           # AI workflow orchestration system
│   ├── common/                 # Shared React components, hooks, and stores
│   │   ├── components/         # Reusable UI components
│   │   ├── hooks/              # Custom React hooks
│   │   └── store/              # Zustand state management
│   ├── orchestrator/           # Workflow engine and task management
│   ├── shared/                 # Shared types, constants, and utilities
│   │   ├── types/              # TypeScript type definitions
│   │   ├── utils/              # Utility functions
│   │   └── config/             # Configuration files
│   ├── tailwind-config/        # Shared Tailwind CSS configuration
│   ├── typescript-config/      # Shared TypeScript configurations
│   └── ui/                     # Base UI components (Shadcn UI)
├── docs/                       # Comprehensive documentation
├── scripts/                    # Utility and deployment scripts
└── drizzle/                    # Database migrations and schema
```

### Key Files to Know

| File | Purpose | When You'd Touch It |
|------|---------|---------------------|
| `apps/web/app/layout.tsx` | Root layout with all providers | Adding global providers or metadata |
| `apps/web/middleware.ts` | Authentication and routing middleware | Modifying auth flow or protected routes |
| `apps/web/lib/auth-server.ts` | Better Auth configuration | Changing authentication settings |
| `packages/ai/workflow/flow.ts` | AI workflow orchestration | Adding new AI capabilities or routing |
| `packages/ai/models.ts` | AI model definitions | Adding new AI models or providers |
| `packages/common/store/chat.store.ts` | Chat state management | Modifying chat functionality |
| `packages/shared/types/subscription.ts` | Subscription and feature types | Adding new subscription features |
| `turbo.json` | Monorepo build configuration | Modifying build pipeline |
| `apps/web/next.config.mjs` | Next.js configuration | Changing build or deployment settings |

---

## 🔧 Technology Stack

### Core Technologies
- **Language:** TypeScript (5.x) - Strict type safety across entire codebase
- **Framework:** Next.js 15 with App Router - Modern React framework with server components
- **Frontend:** React 19.0.0 - Latest React with concurrent features
- **Runtime:** Bun (1.1.19+) - Fast JavaScript runtime and package manager
- **Database:** Neon PostgreSQL with Drizzle ORM - Serverless PostgreSQL with type-safe ORM

### Key Libraries
- **AI SDK:** Vercel AI SDK v5 - Multi-provider AI integration with streaming support
- **Authentication:** Better Auth - Modern authentication with OAuth providers
- **State Management:** Zustand - Lightweight state management for React
- **UI Components:** Shadcn UI with Radix UI - Accessible component library
- **Styling:** Tailwind CSS v4 - Utility-first CSS framework
- **Local Storage:** Dexie.js - IndexedDB wrapper for client-side data storage

### Development Tools
- **Monorepo:** Turborepo - High-performance build system for monorepos
- **Testing:** Vitest with Testing Library - Fast unit testing framework
- **Linting:** Biome + oxlint - Fast code formatting and comprehensive linting
- **Type Checking:** TypeScript with strict configuration
- **Performance:** React Scan - Development performance monitoring

### AI & Integrations
- **AI Providers:** OpenAI, Anthropic, Google, xAI, Fireworks, Together AI
- **Local AI:** Ollama and LM Studio support for privacy-focused local models
- **Payment:** Creem.io - Subscription management and billing
- **Deployment:** Fly.io - Production deployment with global edge locations

---

## 🌐 External Dependencies

### Required Services
- **Neon PostgreSQL** - Primary database for user accounts, subscriptions, and metadata
- **Better Auth** - Authentication service with OAuth provider integration
- **AI Providers** - At least one AI API key (OpenAI, Anthropic, Google, etc.) for server-funded models

### Optional Integrations
- **Creem.io** - Payment processing and subscription management for VT+ features
- **Local AI Models** - Ollama or LM Studio for completely private, offline AI capabilities
- **Web Search APIs** - Enhanced search capabilities for research features

### Environment Variables

```bash
# Required
DATABASE_URL=                  # Neon PostgreSQL connection string
BETTER_AUTH_SECRET=           # Authentication secret key
BETTER_AUTH_URL=              # Authentication URL (base URL for development)

# AI Provider Keys (at least one required)
OPENAI_API_KEY=               # OpenAI API access
ANTHROPIC_API_KEY=            # Anthropic Claude API access
GOOGLE_API_KEY=               # Google Gemini API access
XAI_API_KEY=                  # xAI Grok API access

# Payment & Subscription (optional)
CREEM_WEBHOOK_SECRET=         # Creem.io webhook validation
CREEM_API_KEY=                # Creem.io API access
CREEM_PRODUCT_ID=             # VT Plus subscription product ID

# Application
NEXT_PUBLIC_BASE_URL=         # Application base URL
```

---

## 🔄 Common Workflows

### User Chat Session
1. User authenticates via Better Auth (Google, GitHub, or other OAuth providers)
2. Chat interface loads with user-specific IndexedDB database for privacy
3. User selects AI model and enters message
4. AI workflow system routes request to appropriate provider
5. Streaming response delivered in real-time to chat interface
6. All chat data stored locally in browser, never on server

**Code path:** `app/chat/[threadId]` → `packages/ai/workflow/flow.ts` → `AI Provider APIs` → `IndexedDB`

### Document Processing
1. User uploads document (PDF, DOC, TXT, MD) via drag-and-drop interface
2. Document processed and analyzed using Gemini models
3. Structured data extracted and presented to user
4. Document content available for follow-up questions in chat

**Code path:** `packages/common/hooks/use-document-attachment.ts` → `packages/ai/workflow/tasks/structured-extraction.ts` → `Gemini API`

### Subscription Management
1. User accesses VT+ features requiring premium subscription
2. Subscription status checked via Creem.io integration
3. If needed, user redirected to payment flow
4. Webhook updates subscription status in database
5. Premium features unlocked in real-time

**Code path:** `packages/shared/utils/subscription.ts` → `Creem.io API` → `Database Updates`

---

## 📈 Performance & Scale

### Performance Considerations
- **Local Storage:** All chat data stored in IndexedDB for instant access and privacy
- **Streaming:** Real-time AI responses with progressive loading
- **Caching:** Intelligent caching of AI responses and user preferences
- **Bundle Optimization:** Code splitting and lazy loading for faster initial loads

### Monitoring
- **React Scan:** Development performance monitoring for component optimization
- **Better Auth:** Session management with automatic cleanup
- **Error Boundaries:** Comprehensive error handling and recovery

---

## 🚨 Things to Be Careful About

### 🔒 Security Considerations
- **API Keys:** Never expose AI provider API keys in client-side code
- **Authentication:** Better Auth handles secure session management and OAuth flows
- **Privacy:** Chat data never leaves the user's browser - stored only in IndexedDB
- **Rate Limiting:** Built-in protection against API abuse and quota management

### 🏗️ Architecture Notes
- **Monorepo Structure:** Changes in shared packages affect multiple apps - test thoroughly
- **AI Provider Limits:** Different providers have varying rate limits and capabilities
- **Local Storage:** IndexedDB has browser storage limits - implement cleanup strategies
- **Subscription Sync:** Webhook delays may cause temporary feature access issues

### 🔧 Development Guidelines
- **TypeScript Strict Mode:** All code must pass strict type checking
- **Component Isolation:** UI components should be reusable across packages
- **Error Handling:** Implement comprehensive error boundaries and fallbacks
- **Testing:** Write tests for critical AI workflow and authentication flows

---

*Updated at: 2025-01-28 19:33:55 UTC*
*Last commit: eae24fa - Fix deploy*