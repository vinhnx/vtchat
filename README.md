<div align="center">

<h1>VT</h1>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Deployed on Fly.io](https://img.shields.io/badge/Deployed%20on-Fly.io-blueviolet)](https://fly.io)
[![CI](https://github.com/vinhnx/vtchat/actions/workflows/ci.yml/badge.svg)](https://github.com/vinhnx/vtchat/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/vinhnx/vtchat/branch/main/graph/badge.svg)](https://codecov.io/gh/vinhnx/vtchat)

**A modern, privacy-first AI chat application with security**

[Live App](https://vtchat.io.vn) | [Documentation](docs/) | [Repository Guidelines](AGENTS.md) | [Project Status](docs/PROJECT-STATUS.md) | [Features](docs/FEATURES.md) | [Architecture](docs/ARCHITECTURE.md) | [Security](docs/SECURITY.md)

</div>

---

## Overview

VT is a production-ready, privacy-focused AI chat application delivering cutting-edge AI capabilities through an extremely generous free tier and a focused premium subscription. Built with modern web technologies and a privacy-first architecture, VT offers advanced AI reasoning, document processing, web search integration, and comprehensive multi-AI provider support.

Live at [https://vtchat.io.vn](https://vtchat.io.vn)

## Screenshots

<div align="center">
<img src="apps/web/public/screenshots/screenshot2.png" alt="VT Advanced Features" width="800">

_Advanced AI capabilities including document processing, web search, and structured output_

</div>

## Current Project Status

### Production Achievements

- **Live Deployment**: Successfully running on Fly.io with 2-region setup
- **Zero TypeScript Errors**: Complete type safety across 50+ files
- **87% Performance Boost**: Compilation optimized from 24s to 3s
- **Comprehensive Feature Set**: All planned features implemented and tested
- **Security Hardened**: Bot detection, Better Auth, and privacy-first architecture
- **Modern Stack**: Next.js 15, React 19, TypeScript, Bun ecosystem

### Privacy & Security

- **Local-First Storage**: All conversations stored in browser IndexedDB
- **Zero Server Chat Storage**: Complete privacy with per-user data isolation
- **Better Auth Integration**: 87% performance improvement with secure sessions
- **Production Security**: Bot detection and comprehensive protection measures

## Key Features

### Advanced AI Capabilities

- **Premium AI Models (Free with BYOK)**: Claude 4 Sonnet/Opus, GPT-4.1, O3/O3 Mini/O4 Mini, O1 Mini/Preview, Gemini 2.5 Pro, DeepSeek R1, Grok 3 - all available to logged-in users with their own API keys
- **9 Free Server Models**: Gemini 2.0/2.5 Flash series + OpenRouter models (DeepSeek V3, Qwen3 14B) - no API keys required
- **Free Local AI**: Run AI models on your own computer with **Ollama** and **LM Studio** - completely free, private, and no API costs
- **Multi-AI Provider Support**: OpenAI, Anthropic, Google, Fireworks, Together AI, xAI, plus local providers (Ollama, LM Studio)
- **Intelligent Tool Router (Free)**: AI-powered semantic routing automatically activates the right tools based on your queries using OpenAI embeddings and pattern matching
- **Document Processing (Free)**: Upload and analyze PDF, DOC, DOCX, TXT, MD files (up to 10MB) - available to all logged-in users
- **Structured Output Extraction (Free)**: AI-powered JSON data extraction from documents - available to all logged-in users
- **Chart Visualization (Free)**: Create interactive bar charts, line graphs, pie charts, and scatter plots - always available and discoverable through smart UI
- **Thinking Mode (Free)**: Complete AI SDK reasoning tokens support with transparent thinking process - available to all logged-in users
- **Mathematical Calculator (Free)**: Advanced functions including trigonometry, logarithms, and arithmetic - always available and discoverable through smart UI
- **Web Search Integration (Free)**: Real-time web search capabilities for current information - always available and discoverable through smart UI

### Privacy-First Architecture

- **Local-First Storage**: All chat data stored in browser's IndexedDB via Dexie.js
- **Zero Server Storage**: Conversations never leave the user's device
- **Multi-User Isolation**: Complete data separation on shared devices
- **Security**: Secure authentication with Better Auth
- **Privacy-Focused Security**: Bot detection and secure authentication with Better Auth

### Subscription Tiers

- **Free tier (logged-in users)**: ALL premium AI models (Claude 4, GPT-4.1, O3 series, O1 series, Gemini 2.5 Pro, DeepSeek R1, Grok 3) + all advanced features including intelligent tool routing, chart visualization, dark mode, thinking mode, structured output, document parsing, reasoning chain, Gemini caching, web search, multi-modal chat, mathematical calculator, and unlimited BYOK usage
- **VT+ ($5.99/month)**: Everything free + professional features: PRO_SEARCH (Enhanced Web Search - 50/day), DEEP_RESEARCH (Deep Research capabilities - 25/day), advanced document processing (25MB files), priority AI access, custom workflows, premium exports, extended chat history, and priority support
- **Seamless Management**: Creem.io integration with customer portal and real-time subscription status

### Local AI Setup Guides

Run AI models on your computer for **free** with complete privacy:

- **[Complete Local AI Guide](docs/guides/local-ai-setup.md)** - Choose between Ollama and LM Studio
- **[Ollama Setup Guide](docs/guides/ollama-setup.md)** - Command-line local AI (5-minute setup)
- **[LM Studio Setup Guide](docs/guides/lm-studio-setup.md)** - GUI local AI (10-minute setup)

### Modern User Experience

- **Shadcn UI Design System**: Consistent, accessible interface with dark mode support
- **Smart Tool Discovery**: All tools always visible and clickable with intelligent gated access dialogs
- **Seamless Feature Access**: Tools remain enabled for discoverability while proper access controls show contextual dialogs
- **Responsive Design**: Optimized for desktop and mobile with modern Next.js 15 App Router
- **87% Performance Improvement**: Faster compilation (24s → 3s) and optimized load times
- **Production-Ready**: Deployed on Fly.io with 2-region setup and comprehensive monitoring

## Architecture

VT utilizes a Turborepo-managed monorepo structure:

```
vtchat/
├── apps/
│   └── web/              # Next.js 15 web application (App Router, React 19)
├── packages/
│   ├── actions/          # Server actions (e.g., feedback)
│   ├── ai/               # AI models, providers, tools, semantic router, workflow logic
│   ├── common/           # Shared React components, hooks, context, store
│   ├── orchestrator/     # Workflow engine and task management
│   ├── shared/           # Shared types, constants, configs, utils, logger
│   ├── tailwind-config/  # Shared Tailwind CSS configuration
│   ├── typescript-config/# Shared TypeScript configurations
│   └── ui/               # Base UI components (from Shadcn UI)
├── docs/                 # Documentation and guides
├── memory-bank/          # Project context and evolution tracking
└── scripts/              # Utility scripts (e.g., data sync)
```

## Tech Stack

### **Frontend & Core**

- **Framework**: Next.js 15 (App Router) with TypeScript
- **React**: React 19.0.0 (latest stable)
- **Styling**: Tailwind CSS + Shadcn UI design system
- **State Management**: Zustand + React Query
- **Animations**: Framer Motion
- **Icons**: Lucide React

### **Backend & Infrastructure**

- **Database**: Neon PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth (modern session management)
- **Application Security**: Bot detection for authentication and secure OAuth integration
- **Payment Processing**: Creem.io integration
- **Local Storage**: IndexedDB via Dexie.js
- **Deployment**: Fly.io (production-ready)

### **Development & Build**

- **Runtime**: Bun (package manager + JavaScript runtime)
- **Monorepo**: Turborepo with optimized caching
- **Testing**: Vitest with Testing Library
- **Code Quality**: dprint (formatting) + oxlint (comprehensive linting)
- **Type Checking**: TypeScript with strict configuration
- **Performance Monitoring**: React Scan for development performance optimization

### **AI & Integrations**

- **AI Providers**: OpenAI, Anthropic, Google, Fireworks, Together AI, xAI
- **AI SDK**: Vercel AI SDK with reasoning tokens support
- **Semantic Tool Router**: OpenAI embeddings + pattern matching for intelligent tool activation
- **Document Processing**: Multi-format file analysis
- **Chart Generation**: Bar charts, line graphs, pie charts, scatter plots
- **Web Search**: Real-time grounding capabilities

## Getting Started

### Prerequisites

- **Bun** (JavaScript runtime and package manager) - v1.1.19 or higher
- **Node.js** (for some Turborepo operations, though Bun is primary)
- **Git** for version control

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/vinhnx/vtchat.git
   cd vtchat
   ```

2. **Install dependencies**:

   ```bash
   bun install
   ```

3. **Set up environment variables**:

   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```

   Configure the following required variables in `apps/web/.env.local`:

   **Essential Services:**
   - `DATABASE_URL` - Neon PostgreSQL connection string
   - `BETTER_AUTH_SECRET` - Authentication secret key
   - `BETTER_AUTH_URL` - Authentication URL (process.env.NEXT_PUBLIC_BASE_URL for development)

   **AI Provider Keys (choose one or more):**
   - `OPENAI_API_KEY` - OpenAI API access
   - `ANTHROPIC_API_KEY` - Anthropic Claude API access
   - `GOOGLE_API_KEY` - Google Gemini API access

   **Payment & Subscription:**
   - `CREEM_WEBHOOK_SECRET` - Creem.io webhook validation
   - `CREEM_API_KEY` - Creem.io API access
   - `CREEM_PRODUCT_ID` - VT Plus subscription product ID

   **Security:**
   - `NEXT_PUBLIC_BASE_URL` - Application base URL

4. **Set up the database**:

   ```bash
   cd apps/web
   bun run generate  # Generate database schema
   ```

5. **Start the development server**:

   ```bash
   bun dev
   ```

6. **Open the application**:
   Navigate to `process.env.NEXT_PUBLIC_BASE_URL` in your browser.

### Development Commands

```bash
# Development
bun dev                 # Start development server with Turbopack
bun build              # Build for production
bun start              # Start production server
bun test               # Run tests
bun test:coverage      # Run tests with coverage

# Code Quality
bun lint               # Lint with oxlint
bun run fmt:check    # Check code formatting with dprint

# Database
cd apps/web
bun run generate       # Generate Drizzle schema
```

## Troubleshooting

### Common Development Issues

**Multiple Lockfiles Warning**

```
⚠ Warning: Found multiple lockfiles. Selecting package-lock.json.
   Consider removing the lockfiles at: * /path/to/bun.lock
```

This project uses **Bun as the primary package manager**. If you see this warning:

- Always use `bun install` instead of `npm install`
- The warning about `package-lock.json` in parent directories can be safely ignored
- Ensure you're using Bun commands: `bun dev`, `bun build`, `bun test`

**Package Installation Issues**

```bash
# Clear cache and reinstall
rm -rf node_modules
bun install

# Verify Bun version
bun --version  # Should be 1.1.19 or higher
```

**TypeScript Errors**

```bash
# Refresh type definitions
bun install
bunx tsc --noEmit  # Check for type errors
```

## Configuration

### Environment Setup

The application requires several environment variables for full functionality. Refer to `apps/web/.env.example` for the complete list. Key configurations include:

- **Database**: Neon PostgreSQL for user data and subscriptions
- **Authentication**: Better Auth for secure session management
- **AI Providers**: Support for multiple AI APIs
- **Payment**: Creem.io for subscription management
- **Security**: Bot detection and secure authentication
-

## Deployment

VT is production-ready and deployed on Fly.io:

### **Production Deployment**

- **Live Application**: [https://vtchat.io.vn](https://vtchat.io.vn)
- **Infrastructure**: Fly.io with 2-region setup (Singapore primary, Virginia secondary)
- **Performance**: 87% faster compilation (24s → 3s), optimized bundle size (456kB → 436kB)
- **Security**: Privacy-focused security with bot detection and secure authentication
- **Monitoring**: Comprehensive error tracking, performance monitoring, and health checks
- **Auto-scaling**: Suspend/resume based on traffic with intelligent resource management

### Deployment Configuration

- **Memory**: 1GB RAM per instance
- **CPU**: 1 shared CPU
- **Regions**: Asia-Pacific (primary), USA East (secondary)
- **Health Checks**: HTTP and TCP monitoring
- **Auto-scaling**: Suspend/resume based on traffic

### Changelog Generation

VT uses [changelogithub](https://github.com/antfu/changelogithub) to automatically generate changelogs for each release. When you deploy using the `deploy-fly.sh` script, it will:

1. Automatically generate a changelog based on conventional commits
2. Create a Git tag with the new version
3. Push the tag to GitHub

The GitHub Actions workflow in `.github/workflows/release.yml` will then automatically create a GitHub release with the generated changelog.

To enable full changelog generation with GitHub integration, set the `GITHUB_TOKEN` environment variable when running the deploy script:

```bash
GITHUB_TOKEN=your_token_here ./deploy-fly.sh
```

## Documentation

### **Core Documentation**

- **[Project Status](docs/PROJECT-STATUS.md)**: Complete production readiness overview with live metrics
- **[Features Guide](docs/FEATURES.md)**: Comprehensive feature documentation and capabilities
- **[Architecture Overview](docs/ARCHITECTURE.md)**: System design, tech stack, and component architecture
- **[Security Implementation](docs/SECURITY.md)**: Privacy-first architecture and security measures
- **[Final Project Report](docs/FINAL-PROJECT-REPORT.md)**: Comprehensive technical and business analysis
- **[Final Release Notes](docs/FINAL-RELEASE-NOTES.md)**: v1.0 production achievements and features

### **Setup & Deployment**

- **[Local Development Setup](docs/local-development-setup.md)**: Complete environment setup guide
- **[Database Setup](docs/DATABASE_SETUP.md)**: PostgreSQL configuration and schema setup
- **[OAuth Setup](docs/OAUTH_SETUP.md)**: Authentication provider configuration
- **[Deployment Guide](docs/DEPLOYMENT.md)**: Production deployment instructions
- **[Production Deployment Checklist](docs/production-deployment-checklist.md)**: Pre-deployment verification
- **[Fly.io Deployment Guide](docs/fly-deployment-guide.md)**: Specific Fly.io deployment instructions
- **[DNS Configuration Guide](docs/dns-configuration-guide.md)**: Domain setup and SSL configuration

### **Development & Integration**

- **[Development Guidelines](AGENT.md)**: Code standards, conventions, and best practices
- **[Subscription System](docs/subscription-system.md)**: Plan management and Creem.io integration
- **[Creem Webhook Setup](docs/CREEM_WEBHOOK_SETUP.md)**: Payment webhook configuration
- **[Account Linking](docs/ACCOUNT_LINKING.md)**: Multi-provider authentication setup
- **[Database Maintenance](docs/DATABASE_MAINTENANCE.md)**: Ongoing database management and cron jobs
- **[Admin System](docs/admin-system.md)**: Comprehensive admin panel documentation
- **[Unified Access Control](docs/unified-access-control-implementation.md)**: Feature gating and subscription management

### **Local AI & Advanced Features**

- **[Complete Local AI Guide](docs/guides/local-ai-setup.md)**: Choose between Ollama and LM Studio
- **[Ollama Setup Guide](docs/guides/ollama-setup.md)**: Command-line local AI (5-minute setup)
- **[LM Studio Setup Guide](docs/guides/lm-studio-setup.md)**: GUI local AI (10-minute setup)
- **[Premium Components Guide](docs/guides/premium-components.md)**: VT+ exclusive features
- **[Logging Best Practices](docs/guides/logging-best-practices.md)**: Structured logging implementation

### **Monitoring & Performance**

- **[Production Monitoring Setup](docs/production-monitoring-setup.md)**: Error tracking, performance monitoring, and alerting
- **[Production Readiness Report](docs/production-readiness-report.md)**: Comprehensive readiness assessment
- **[Production Verification Report](docs/production-verification-report.md)**: Live deployment validation
- **[Performance Optimizations](docs/auth-performance-optimizations.md)**: Authentication and runtime optimizations
- **[Caching Optimization Report](docs/caching-optimization-report.md)**: Performance improvements and metrics
- **[Fly Cost Optimization](docs/fly-cost-optimization.md)**: Infrastructure cost management

### **Feature Implementation**

- **[Thinking Mode Implementation](docs/reasoning-mode-implementation.md)**: AI reasoning capabilities
- **[Document Upload Feature](docs/document-upload-feature.md)**: File processing implementation
- **[Structured Output Implementation](docs/structured-output-implementation-summary.md)**: JSON extraction features
- **[Enhanced Tool System](docs/enhanced-tool-system-implementation.md)**: Advanced tool routing
- **[Rate Limiting Improvements](docs/rate-limiting-improvements.md)**: Usage control and limits
- **[Content Signals Implementation](docs/contentsignals-implementation.md)**: Advanced content analysis
- **[VT+ Reasoning Background](docs/vt-plus-reasoning-background-improvements.md)**: Premium tier enhancements

### **Security & Privacy**

- **[Arcjet Security Guide](docs/guides/arcjet-security.md)**: Comprehensive security implementation
- **[Privacy Monitoring](docs/privacy-monitoring.md)**: Privacy-safe analytics approach
- **[Customer Support Policy](docs/customer-support-policy.md)**: Support guidelines and data handling
- **[Enhanced Subscription Verification](docs/enhanced-subscription-verification.md)**: Secure tier validation
- **[Thread Isolation Implementation](docs/thread-isolation-implementation.md)**: Per-user data separation

### **Testing & Quality**

- **[Vitest Testing Setup](docs/vitest-testing-setup.md)**: Testing framework configuration
- **[Structured Output Testing](docs/structured-output-testing.md)**: Feature-specific test suites
- **[Error Diagnostic Examples](docs/error-diagnostic-examples.md)**: Debugging and troubleshooting
- **[React Scan Usage](docs/react-scan-usage.md)**: Performance monitoring tools

### **Project Management**

- **[UI Audit Report](docs/ui-audit-report.md)**: User interface assessment and improvements
- **[Chat UI Improvements Status](docs/chat-ui-improvements-status.md)**: Interface enhancement tracking
- **[Tooling Setup](docs/tooling-setup.md)**: Development environment configuration
- **[Shadcn UI Migration Completion](docs/shadcn-ui-migration-completion.md)**: UI library migration status
- **[UI Audit Report](docs/ui-audit-report.md)**: Interface quality assessment

### **Release & Project Management**

- **[Final Release Notes](docs/FINAL-RELEASE-NOTES.md)**: Complete feature summary and achievements
- **[Customer Support Policy](docs/customer-support-policy.md)**: Support procedures and guidelines

### **User Support & Help**

- **[Help Center](docs/help-center/README.md)**: Complete user guides, FAQ, and troubleshooting
- **[Usage Settings Implementation](docs/USAGE_SETTINGS_IMPLEMENTATION.md)**: User configuration and preferences

### **Project Context & Evolution**

The **[memory-bank/](memory-bank/)** directory contains contextual documents tracking project evolution, feature implementations, and development insights. These documents provide historical context and decision rationale for continuous improvement.

Key memory bank documents:

- Development session logs and feature implementation notes
- Architectural decisions and evolution notes
- Performance optimization discoveries and lessons learned
- User feedback integration and feature prioritization insights

---

> **Navigation Tip**: Start with [Project Status](docs/PROJECT-STATUS.md) for a complete overview, then explore specific areas using the categorized documentation links above.

## Security

VT implements comprehensive security measures:

- **Privacy-First**: All conversations stored locally in IndexedDB
- **Authentication**: Better Auth with secure session management
- **Application Security**: Bot detection and secure authentication
- **Rate Limiting**: Prevents abuse with intelligent rate limiting
- **Data Protection**: No server-side storage of sensitive chat data
- **Secure Communication**: HTTPS enforced, secure headers implemented

## React Best Practices

- For comprehensive `useEffect` best practices, examples, and anti-patterns, see [docs/react-effect.md](./docs/react-effect.md).

## Testing

VT includes comprehensive testing:

```bash
# Run all tests
bun test

# Run tests with UI
bun test:ui

# Run tests with coverage
bun test:coverage

# Run specific test suites
bun test app/tests/rate-limit-simple.test.ts
```

Testing framework: Vitest with Testing Library for React components.

## Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository** and create a feature branch
2. **Follow the coding standards** defined in [AGENTS.md](AGENTS.md)
3. **Write tests** for new features
4. **Update documentation** as needed
5. **Submit a pull request** with a clear description

### Development Standards

- Use TypeScript with strict configuration
- Follow the existing code style and patterns
- Ensure all tests pass before submitting
- Update AGENTS.md with any significant changes

## Acknowledgements

This project is based on [llmchat](https://github.com/trendy-design/llmchat). We acknowledge and appreciate the excellent work of the Trendy Design team. Our main contributions focus on privacy-first architecture, advanced AI capabilities, and comprehensive multi-AI provider support.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

**[Visit VT](https://vtchat.io.vn)** | **[View Documentation](docs/)** | **[Report Issues](https://github.com/vinhnx/vtchat/issues)**

---

I'm @vinhnx.

</div>
