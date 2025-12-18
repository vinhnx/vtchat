<div align="center">

<h1>VT</h1>

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/vinhnx/vtchat)
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

**Featuring Nano Banana** - The Conversational image editor! Generate and iteratively edit images through natural conversation, exclusive to VT.

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

- **Nano Banana Conversational Image Editor (New to VT)**: Conversational image editor! Generate an image, then iteratively edit through natural conversation: "make the cat bigger", "change background to sunset", "add a party hat" - all while preserving edit history
- **Premium AI Models (Free with BYOK)**: Claude Sonnet 4.5, Claude 4 Sonnet/Opus, GPT-4.1, O3/O3 Mini/O4 Mini, O1 Mini/Preview, Gemini 3 Pro, DeepSeek R1, Grok 3 - all available to logged-in users with their own API keys
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

- **Docker & Docker Compose**: For the easiest setup
- **At least one AI API key**: OpenAI, Anthropic, or Google Gemini

### Quick Start (Docker - Recommended)

The easiest way to get VT running locally is with Docker Compose:

### 1. Clone & Setup

```bash
git clone https://github.com/vinhnx/vtchat.git
cd vtchat
cp apps/web/.env.example apps/web/.env.local
```

### 2. Configure Environment

Edit `apps/web/.env.local` and add:

- `BETTER_AUTH_SECRET` (generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- At least one AI API key (e.g., `OPENAI_API_KEY=sk-your-key-here`)

### 3. Run with Docker

```bash
# Validate setup (optional but recommended)
./validate-setup.sh

# Start the application
docker-compose up --build
```

### 4. Access VT

- **App**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health

**That's it!** VT will be running with PostgreSQL, all dependencies, and hot reload enabled.

---

## Manual Setup (Advanced)

If you prefer manual setup without Docker:

### Prerequisites

- **Bun** v1.1.19+ (JavaScript runtime & package manager)
- **PostgreSQL** (local or cloud)
- **Git**

### 1. Clone & Install

```bash
git clone https://github.com/vinhnx/vtchat.git
cd vtchat
bun install
```

### 2. Database Setup

**Option A: Local PostgreSQL**

```bash
# macOS with Homebrew
brew install postgresql@15
brew services start postgresql@15
createdb vtchat_dev
```

**Option B: Docker PostgreSQL**

```bash
docker run -d --name vtchat-postgres \
  -e POSTGRES_DB=vtchat_dev \
  -e POSTGRES_USER=vtchat \
  -e POSTGRES_PASSWORD=vtchat_password \
  -p 5432:5432 postgres:15-alpine
```

### 3. Environment Configuration

```bash
cp apps/web/.env.example apps/web/.env.local
```

Edit `apps/web/.env.local` with your values:

**Required:**

```bash
DATABASE_URL=postgresql://vtchat:vtchat_password@localhost:5432/vtchat_dev
BETTER_AUTH_SECRET=your-32-char-secret-here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
OPENAI_API_KEY=sk-your-openai-key-here
```

### 4. Database Migration

```bash
cd apps/web
bun run generate  # Generate database schema
```

### 5. Start Development Server

```bash
bun dev
```

---

## Environment Variables

### Required (Core Functionality)

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/vtchat_dev

# Authentication
BETTER_AUTH_SECRET=your-32-char-secret-key
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# AI Provider (choose at least one)
OPENAI_API_KEY=sk-your-key-here
# OR
ANTHROPIC_API_KEY=sk-ant-your-key-here
# OR
GEMINI_API_KEY=your-key-here
```

### Optional (Enhanced Features)

```bash
# Social Authentication
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Payment (Creem.io - skip if not needed)
CREEM_API_KEY=creem_test_your-key
CREEM_WEBHOOK_SECRET=your-webhook-secret
CREEM_PRODUCT_ID=your-product-id

# Additional AI Providers
FIREWORKS_API_KEY=fw-your-key-here
```

---

## Development Commands

```bash
# Development
bun dev                    # Start development server
bun dev --turbopack        # With Turbopack (faster)
bun build                  # Production build
bun start                  # Production server

# Database
cd apps/web
bun run generate          # Generate Drizzle schema

# Code Quality
bun run lint              # Lint with oxlint
bun run fmt               # Format with dprint
bun run fmt:check         # Check formatting

# Testing
bun test                  # Run tests
bun test:coverage         # Tests with coverage
```

---

## Troubleshooting

### Quick Fixes

**Setup validation**:

```bash
./validate-setup.sh
```

**Reset Docker environment**:

```bash
docker-compose down -v && docker-compose up --build
```

**Clear caches**:

```bash
rm -rf node_modules apps/web/node_modules apps/web/.next
bun install
```

### Common Issues

- **Port conflicts**: Change ports in `docker-compose.yml`
- **Database issues**: Check `docker-compose logs postgres`
- **Build failures**: Run `docker system prune -f` then rebuild
- **Auth problems**: Regenerate `BETTER_AUTH_SECRET`

**[Complete Troubleshooting Guide](docs/guides/troubleshooting.md)**

## Documentation

- **[Self-Hosting Guide](docs/guides/self-hosting-complete-guide.md)** - Complete setup for self-hosters
- **[Docker Setup Guide](DOCKER-README.md)** - Detailed Docker instructions
- **[Local Development](docs/local-development-setup.md)** - Advanced setup options
- **[Troubleshooting](docs/guides/troubleshooting.md)** - Common issues & solutions
- **[Features](docs/FEATURES.md)** - Complete feature documentation
- **[Architecture](docs/ARCHITECTURE.md)** - System design & tech stack
- **[Security](docs/SECURITY.md)** - Privacy & security implementation
