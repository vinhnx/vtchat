## Introduction

VT (VTChat) is a production-ready, privacy-focused AI chat application that delivers cutting-edge AI capabilities through a sophisticated dual-tier subscription system. Built with modern web technologies and a privacy-first architecture, VT offers advanced AI reasoning, document processing, web search integration, and comprehensive multi-AI provider support.

--

VT combines enterprise-grade security with user-friendly design, featuring local-first data storage, advanced AI reasoning modes, and seamless subscription management. The application has been optimized for performance with 87% faster compilation times and comprehensive testing coverage.

## Key Features

### Advanced AI Capabilities
- **Reasoning Mode (VT+ exclusive)**: Complete AI SDK reasoning tokens support with transparent thinking process
- **9 Free AI Models**: Gemini 2.0/2.5 Flash series + OpenRouter models (DeepSeek V3, DeepSeek R1, Qwen3 14B)
- **Multi-AI Provider Support**: OpenAI, Anthropic, Google, Fireworks, Together AI, and xAI integration
- **Document Processing (VT+ exclusive)**: Upload and analyze PDF, DOC, DOCX, TXT, MD files (up to 10MB)
- **Structured Output Extraction (VT+ exclusive)**: AI-powered JSON data extraction from documents
- **Web Search Integration (VT+ exclusive)**: Grounding capabilities with real-time information
- **Mathematical Calculator**: Advanced functions including trigonometry, logarithms, and arithmetic

### Privacy-First Architecture
- **Local-First Storage**: All chat data stored in browser's IndexedDB via Dexie.js
- **Zero Server Storage**: Conversations never leave the user's device
- **Multi-User Isolation**: Complete data separation on shared devices
- **Enterprise-Grade Security**: Secure authentication with Better Auth

### Subscription Tiers
- **VT_BASE (Free)**: 9 AI models, calculator, basic chat, local privacy
- **VT_PLUS ($10/month)**: All free features + reasoning mode, dark theme, web search, document upload, structured extraction
- **Seamless Management**: Creem.io integration with customer portal

### Modern User Experience
- **Shadcn UI Design System**: Consistent, accessible interface
- **Dark Mode (VT+ exclusive)**: Premium theming experience
- **Responsive Design**: Optimized for desktop and mobile
- **87% Performance Improvement**: Faster compilation and load times

## Architecture

VT utilizes a Turborepo-managed monorepo structure:

```
.
├── apps/
│   └── web/              # Next.js 14 web application (App Router)
├── packages/
│   ├── actions/          # Server actions (e.g., feedback)
│   ├── ai/               # AI models, providers, tools, workflow logic
│   ├── common/           # Shared React components, hooks, context, store
│   ├── orchestrator/     # Workflow engine and task management
│   ├── shared/           # Shared types, constants, configs, utils, logger
│   ├── tailwind-config/  # Shared Tailwind CSS configuration
│   ├── typescript-config/# Shared TypeScript configurations
│   └── ui/               # Base UI components (from Shadcn UI)
└── scripts/              # Utility scripts (e.g., data sync)
```

## Workflow Orchestration Example

VT's workflow orchestration enables powerful agentic capabilities. Here's an example of creating a research agent:

### 1. Define Event and Context Types

```typescript
// packages/ai/workflow/types.ts (Illustrative)
type AgentEvents = {
    taskPlanner: { tasks: string[]; query: string };
    informationGatherer: { searchResults: string[] };
    informationAnalyzer: { analysis: string; insights: string[] };
    reportGenerator: { report: string };
};

type AgentContext = {
    query: string;
    tasks: string[];
    searchResults: string[];
    analysis: string;
    insights: string[];
    report: string;
};
```

### 2. Initialize Core Components

```typescript
// packages/ai/workflow/example.ts (Illustrative)
import { OpenAI } from 'openai';
import { createTask } from '@repo/orchestrator'; // Assuming orchestrator path
import { WorkflowBuilder } from '@repo/orchestrator';
import { Context } from '@repo/orchestrator';
import { TypedEventEmitter } from '@repo/orchestrator';

const events = new TypedEventEmitter<AgentEvents>();
const builder = new WorkflowBuilder<AgentEvents, AgentContext>('research-agent', {
    events,
    context: new Context<AgentContext>({
        /* initial context */
    }),
});
const llm = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
```

### 3. Define Research Tasks (Planning, Gathering, Analysis, Reporting)

(Task definitions for `taskPlanner`, `informationGatherer`, `informationAnalyzer`, `reportGenerator` would follow, similar to the original README example, utilizing the `createTask` utility and interacting with the LLM and context.)

### 4. Build and Execute the Workflow

```typescript
// packages/ai/workflow/example.ts (Illustrative)
builder.addTask(taskPlanner);
builder.addTask(informationGatherer);
builder.addTask(informationAnalyzer);
builder.addTask(reportGenerator);

const workflow = builder.build();
// workflow.start('taskPlanner', { query: 'Research AI impact' });
export const researchAgent = workflow;
```

This workflow processes research queries through planning, information gathering, analysis, and report generation, with events updating the UI in real-time.

## Local Storage for Privacy

VT stores all chat history and user-specific data (like API keys if "Bring Your Own Key" is used) in the browser's IndexedDB. This ensures that sensitive conversation data remains on the user's device, enhancing privacy.

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
- **Payment Processing**: Creem.io integration
- **Local Storage**: IndexedDB via Dexie.js
- **Deployment**: Railway (production-ready)

### **Development & Build**
- **Runtime**: Bun (package manager + JavaScript runtime)
- **Monorepo**: Turborepo with optimized caching
- **Testing**: Vitest with Testing Library
- **Linting**: oxlint (faster than ESLint)
- **Type Checking**: TypeScript with strict configuration

### **AI & Integrations**
- **AI Providers**: OpenAI, Anthropic, Google, Fireworks, Together AI, xAI
- **AI SDK**: Vercel AI SDK with reasoning tokens support
- **Document Processing**: Multi-format file analysis
- **Web Search**: Real-time grounding capabilities

## Getting Started

### Prerequisites

- Bun (JavaScript runtime and package manager)
- Node.js (for some Turborepo operations, though Bun is primary)

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/your-repo/vtchat.git # Replace with actual repo URL
    cd vtchat
    ```

2. Install dependencies:

    ```bash
    bun install
    ```

3. Set up environment variables:

    - Copy `apps/web/.env.example` to `apps/web/.env.local`.
    - Fill in the required API keys and configuration values (e.g., Creem.io keys, LLM provider keys).

4. Start the development server:

    ```bash
    bun dev
    ```

    This command, managed by Turborepo, will typically start the Next.js application.

5. Open your browser and navigate to `http://localhost:3000` (or the port specified by the `dev` script).

## Documentation

### **Production Readiness**
- **[Production Deployment Checklist](docs/production-deployment-checklist.md)**: Comprehensive pre-deployment verification
- **[Production Monitoring Setup](docs/production-monitoring-setup.md)**: Error tracking, performance monitoring, and alerting
- **[Final Release Notes](docs/FINAL-RELEASE-NOTES.md)**: Complete feature summary and achievements
- **[Final Project Report](docs/FINAL-PROJECT-REPORT.md)**: Comprehensive technical and business analysis

### **Development & Integration**
- **[AGENT.md](AGENT.md)**: Development guidelines and conventions
- **Subscription System**: Plan management, caching, and Creem.io integration
- **Customer Portal**: User subscription management interface
- **Webhook Setup**: Creem.io webhook configuration for development

### **Project Context**
The `/memory-bank` directory contains contextual documents tracking project evolution, feature implementations, and development insights for continuous improvement.

## Production Deployment

VT is fully prepared for production deployment with:

- **Zero TypeScript Errors**: Complete type safety
- **Performance Optimized**: 87% faster compilation, optimized bundle size
- **Security Hardened**: Privacy-first architecture with secure authentication
- **Monitoring Ready**: Error tracking and performance monitoring setup
- **Documentation Complete**: Comprehensive guides and troubleshooting
- **Testing Coverage**: Vitest framework with comprehensive test coverage
