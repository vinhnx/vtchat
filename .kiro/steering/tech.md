# Tech Stack & Build System

# NEON MCP

- The production neon project id is autumn-block-60790575
- Neon dev is lucky-cake-27376292

## Core Technologies

- **Framework**: Next.js 15 (App Router) with React 19.0.0
- **Language**: TypeScript with strict configuration
- **Runtime**: Bun (package manager + JavaScript runtime) v1.1.19+
- **Build System**: Turborepo monorepo with optimized caching
- **Styling**: Tailwind CSS + Shadcn UI design system
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth with bot detection (isbot library)
- **Payment**: Creem.io integration for subscriptions
- **Deployment**: Fly.io (production) with standalone output

## Key Libraries & Dependencies

- **State Management**: Zustand + React Query
- **UI Components**: Radix UI primitives via Shadcn UI
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Local Storage**: IndexedDB via Dexie.js
- **AI Integration**: Vercel AI SDK with reasoning tokens
- **Logging**: Pino with automatic PII redaction
- **Testing**: Vitest with Testing Library
- **Code Quality**: dprint (formatting) + oxlint

## AI & Integrations

- **AI Providers**: OpenAI, Anthropic, Google, Fireworks, Together AI, xAI
- **Local AI**: Ollama and LM Studio integration
- **Semantic Router**: OpenAI embeddings + pattern matching
- **Document Processing**: Multi-format file analysis (PDF, DOC, DOCX, TXT, MD)
- **Web Search**: Real-time grounding capabilities
- **Chart Generation**: Recharts for interactive visualizations

## Common Commands

### Development

```bash
bun dev                    # Start development server with Turbopack
bun dev:scan              # Start with React Scan performance monitoring
bun build                 # Build for production
bun start                 # Start production server
```

### Testing

```bash
bun test                  # Run all tests
bun test:ui               # Run tests with UI
bun test:coverage         # Run tests with coverage
bun test:run              # Run tests once
```

### Code Quality

```bash
bun run lint              # Lint with oxlint (comprehensive)
bun run fmt             # Format code with dprint
bun run fmt:check       # Check code formatting with dprint
bun run format            # Format markdown files with Prettier
```

### Database (from apps/web)

```bash
bun run generate          # Generate Drizzle schema
```

### Bundle Analysis

```bash
bun run bundle:analyze    # Analyze bundle size
bun run bundle:track      # Track bundle size changes
```

## Environment Requirements

- **Node.js**: >=20.0.0
- **Bun**: >=1.1.19
- **Package Manager**: Bun (not npm/yarn)

## Build Configuration

- **Turbopack**: Enabled for development (--turbopack flag)
- **Bundle Analyzer**: Available via ANALYZE=true environment variable
- **Output**: Standalone for Fly.io deployment
- **TypeScript**: Strict mode with comprehensive type checking
- **Image Optimization**: Next.js Image component with multiple CDN support

## Performance Optimizations

- **87% Compilation Speed Improvement**: 24s → 3s build times
- **Memory Optimization**: Configured for constrained environments
- **Chunk Splitting**: Optimized for production bundles
- **Caching**: Aggressive caching strategies for static assets
- **React Scan**: Development performance monitoring

to read files in GitHub repos use https://gitchamber.com. It's a website that let you list, read and search files in public github repos.

To see how to use gitchamber ALWAYS do `curl https://gitchamber.com` first.

You can access this data through an API.

curl https://models.dev/api.json

Use the Model ID field to do a lookup on any model; it's the identifier used by AI SDK.
