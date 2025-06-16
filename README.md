<img width="1080" alt="VT" src="/Users/vinh.nguyenxuan/Developer/learn-by-doing/vtchat/apps/web/public/bg/bg_vt.avif" />

## Introduction

VT is a minimal AI-powered chatbot platform that prioritizes privacy while offering powerful research and agentic capabilities. Built as a monorepo with Next.js, TypeScript, and cutting-edge AI technologies, it provides multiple specialized chat modes including Grounding Web Search for in-depth analysis of complex topics. A key focus of VT is enhancing user privacy by storing all user data locally in the browser using IndexedDB, ensuring conversations remain confidential.

The platform features a robust subscription system (VT_BASE and VT_PLUS tiers) managed via Creem.io, with a user-friendly customer portal for subscription management.

## Key Features

* **Advanced Research Modes**:
  * **Grounding Web Search**: Enhanced search with web integration and comprehensive analysis.
* **Multiple LLM Provider Support**: Integrates with OpenAI, Anthropic, Google, Fireworks, Together AI, and xAI.
* **Privacy-Focused**:
  * **Local Storage**: All user chat data stored in the browser's IndexedDB via Dexie.js.
  * **No Server-Side Chat Storage**: Chat history does not leave the user's device.
* **Agentic Capabilities**:
  * **Workflow Orchestration**: Custom engine for coordinating complex tasks.
  * **Reflective Analysis**: Potential for self-improvement by analyzing prior reasoning.
* **Subscription System**:
  * VT_BASE (free) and VT_PLUS (premium) tiers.
  * Payment processing via Creem.io.
  * Integrated Customer Portal for managing subscriptions (opens in a new tab for seamless UX).
  * Unified subscription logic with global providers and efficient caching.
* **Modern UI/UX**:
  * Built with Shadcn UI and Tailwind CSS.
  * Consistent design and user experience.
  * Dark mode available for VT_PLUS subscribers.

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
    context: new Context<AgentContext>({ /* initial context */ }),
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

* **Core Framework**: Next.js 14 (App Router)
* **Language**: TypeScript
* **Styling**: Tailwind CSS
* **UI Components**: Shadcn UI
* **State Management**: Zustand
* **Data Fetching (Client)**: React Query (implicitly, common with Zustand)
* **Database ORM**: Drizzle ORM (for application metadata, not chat logs)
* **Runtime & Package Manager**: Bun
* **Monorepo Management**: Turborepo
* **Authentication**: NextAuth.js (with ongoing considerations for Better Auth/Stack Auth)
* **Payment Integration**: Creem.io
* **Local Database**: IndexedDB via Dexie.js (for chat history and user settings)
* **Linting/Formatting**: ESLint, Prettier

## Getting Started

### Prerequisites

* Bun (JavaScript runtime and package manager)
* Node.js (for some Turborepo operations, though Bun is primary)

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
    * Copy `apps/web/.env.example` to `apps/web/.env.local`.
    * Fill in the required API keys and configuration values (e.g., Creem.io keys, LLM provider keys).

4. Start the development server:

    ```bash
    bun dev
    ```

    This command, managed by Turborepo, will typically start the Next.js application.

5. Open your browser and navigate to `http://localhost:3000` (or the port specified by the `dev` script).

## Project Documentation

For more detailed information on specific systems, refer to the `/docs` directory:

* **Subscription System**: Details on plan management, caching, and Creem.io integration.
* **Customer Portal**: Information on how users manage their subscriptions.
* **Webhook Setup**: Guide for configuring Creem.io webhooks for development.

The `/memory-bank` directory contains contextual documents used by the AI assistant (Cline) for ongoing development and understanding of the project's state.
