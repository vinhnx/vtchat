

<div align="center">

<h1>VT</h1>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Deployed on Fly.io](https://img.shields.io/badge/Deployed%20on-Fly.io-blueviolet)](https://fly.io)

**A modern, privacy-first AI chat application with enterprise-grade security**

[Live](https://vtchat.io.vn) | [Documentation](docs/) | [Security Guide](docs/SECURITY.md)

</div>

---

## Overview

VT is a production-ready, privacy-focused AI chat application delivering cutting-edge AI capabilities through a sophisticated dual-tier subscription system. Built with modern web technologies and a privacy-first architecture, VT offers advanced AI reasoning, document processing, web search integration, and comprehensive multi-AI provider support.

## Key Features

### Advanced AI Capabilities

- **Premium AI Models (Free with BYOK)**: Claude 4 Sonnet/Opus, GPT-4.1, O3/O3 Mini/O4 Mini, O1 Mini/Preview, Gemini 2.5 Pro, DeepSeek R1, Grok 3 - all available to logged-in users with their own API keys
- **9 Free AI Models**: Gemini 2.0/2.5 Flash series + OpenRouter models (DeepSeek V3, Qwen3 14B)
- **Multi-AI Provider Support**: OpenAI, Anthropic, Google, Fireworks, Together AI, and xAI integration
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
- **Enterprise-Grade Security**: Secure authentication with Better Auth
- **Privacy-Focused Security**: Bot detection and secure authentication with Better Auth

### Subscription Tiers

- **Free tier (logged-in users)**: ALL premium AI models (Claude 4, GPT-4.1, O3, etc.) + all advanced features - intelligent tool routing, chart visualization, dark mode, thinking mode, structured output, document parsing, reasoning chain, Gemini caching, web search, multi-modal chat, and unlimited BYOK usage
- **VT+ ($5.99/month)**: Everything free + 3 exclusive research features: PRO_SEARCH (Enhanced Web Search), DEEP_RESEARCH (Deep Research capabilities), and RAG (Personal AI Assistant with Memory)
- **Seamless Management**: Creem.io integration with customer portal

### Modern User Experience

- **Shadcn UI Design System**: Consistent, accessible interface
- **Smart Tool Discovery**: All tools always visible and clickable with intelligent gated access dialogs
- **Seamless Feature Access**: Tools remain enabled for discoverability while proper access controls show contextual dialogs
- **Dark Mode**: Premium theming experience for all logged-in users
- **Responsive Design**: Optimized for desktop and mobile
- **87% Performance Improvement**: Faster compilation and load times

## Architecture

VT utilizes a Turborepo-managed monorepo structure:

```
vtchat/
├── apps/
│   └── web/              # Next.js 14 web application (App Router)
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

- **Framework**: Next.js 14 (App Router) with TypeScript
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
- **Code Quality**: Biome (formatting & linting) + oxlint (comprehensive linting)
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
bun run biome:format   # Format code with Biome
bun run biome:check    # Check code formatting with Biome

# Database
cd apps/web
bun run generate       # Generate Drizzle schema
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

### Production Deployment

- **URL**: [https://vtchat.io.vn](https://vtchat.io.vn)
- **Infrastructure**: Fly.io with 2-region setup (Singapore primary, Virginia secondary)
- **Performance**: 87% faster compilation, optimized bundle size
- **Security**: Privacy-focused security with bot detection
- **Monitoring**: Comprehensive error tracking and performance monitoring

### Deployment Configuration

- **Memory**: 1GB RAM per instance
- **CPU**: 1 shared CPU
- **Regions**: Asia-Pacific (primary), USA East (secondary)
- **Health Checks**: HTTP and TCP monitoring
- **Auto-scaling**: Suspend/resume based on traffic

## Documentation

### **Production Readiness**

- **[Production Deployment Checklist](docs/production-deployment-checklist.md)**: Comprehensive pre-deployment verification
- **[Production Monitoring Setup](docs/production-monitoring-setup.md)**: Error tracking, performance monitoring, and alerting
- **[Final Release Notes](docs/FINAL-RELEASE-NOTES.md)**: Complete feature summary and achievements
- **[Final Project Report](docs/FINAL-PROJECT-REPORT.md)**: Comprehensive technical and business analysis

### **Development & Integration**

- **[AGENT.md](AGENT.md)**: Development guidelines and conventions
- **[Security Guide](docs/SECURITY.md)**: Security implementation and privacy features
- **Subscription System**: Plan management, caching, and Creem.io integration
- **Customer Portal**: User subscription management interface

### **Project Context**

The `/memory-bank` directory contains contextual documents tracking project evolution, feature implementations, and development insights for continuous improvement.

## Security

VT implements comprehensive security measures:

- **Privacy-First**: All conversations stored locally in IndexedDB
- **Authentication**: Better Auth with secure session management
- **Application Security**: Bot detection and secure authentication
- **Rate Limiting**: Prevents abuse with intelligent rate limiting
- **Data Protection**: No server-side storage of sensitive chat data
- **Secure Communication**: HTTPS enforced, secure headers implemented

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
2. **Follow the coding standards** defined in [AGENT.md](AGENT.md)
3. **Write tests** for new features
4. **Update documentation** as needed
5. **Submit a pull request** with a clear description

### Development Standards

- Use TypeScript with strict configuration
- Follow the existing code style and patterns
- Ensure all tests pass before submitting
- Update AGENT.md with any significant changes

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Achievements

- **Zero TypeScript Errors**: Complete type safety across the codebase
- **87% Performance Improvement**: Optimized compilation and runtime
- **Smart UX Design**: All tools discoverable through always-enabled buttons with intelligent gated dialogs
- **Production-Ready**: Deployed and running in production environment
- **Security Hardened**: Comprehensive protection against common threats
- **Privacy-First**: Commited to user data protection
- 
---

<div align="center">

**[Visit VT](https://vtchat.io.vn)** | **[View Documentation](docs/)** | **[Report Issues](https://github.com/vinhnx/vtchat/issues)**

I'm @vinhnx.

</div>
