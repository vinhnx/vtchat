# AI Agents System

This document provides an overview of the AI Agent system implemented in the `packages/ai/` directory. The system is designed for building flexible and powerful AI agent workflows using a graph-based architecture.

## Core Concepts

- **Agentic Graph System**: The foundation of the AI capabilities, allowing for complex workflows to be defined and managed as a graph of interconnected nodes.
- **Workflow Management**:
  - Workflows are defined in `packages/ai/workflow/flow.ts`.
  - Execution of these workflows is handled by workers, as seen in `packages/ai/worker/worker.ts` and `packages/ai/worker/use-workflow-worker.ts`.
  - The system is event-driven, emitting events like `workflow.started`, `workflow.completed`, `node.processing`, etc.
- **Tool Integration**:
  - Agents framework ready for future tool integrations (MCP implementation temporarily removed for optimization).

## Key Components and Features

### 1. Graph-Based Architecture

- Workflows are constructed as a series of nodes, allowing for modular and scalable agent designs.

### 2. Specialized Node Types

   The system defines several types of nodes, each with a specific role in the workflow:
    -   **Executor Node**: Responsible for executing specific tasks or actions. It processes input and generates responses, and can be specialized for different roles within an agent.
    -   **Router Node**: Intelligently routes data or control flow to other appropriate nodes within the graph. It often uses confidence scoring or other logic to make routing decisions.
    -   **Memory Node**: Manages state and interaction history for an agent or workflow. This can include short-term context and long-term knowledge.
    -   **Observer Node**: Monitors the behavior of the workflow and its nodes. It can be used for logging, analysis, performance tracking, and generating insights.

### 3. Event-Driven System

- The architecture relies on an event system for communication between components and for tracking the state of workflows and nodes.
- Key events include:
  - `workflow.started`
  - `workflow.completed`
  - `workflow.error`
  - `node.processing`
  - `node.processed`
  - `node.error`

### 4. LLM Provider Support

- The system is designed to be flexible with Large Language Model (LLM) providers.
- Currently supports:
  - OpenAI
  - Anthropic
  - Together AI
- Configuration for these providers (API keys, model names) is managed through environment variables (see `packages/ai/.env.example`).

### 5. Workflow Execution

- Workflows are typically initiated and managed by a worker system (`packages/ai/worker/`).
- The `use-workflow-worker.ts` hook likely provides a way for the frontend or other parts of the application to interact with these AI workflows.

## Configuration

- API keys and model preferences are set in `.env.local` (copied from `packages/ai/.env.example`).
- Key environment variables include:
  - `OPENAI_API_KEY`
  - `OPENAI_MODEL`
  - `ANTHROPIC_API_KEY`
  - `ANTHROPIC_MODEL`
  - `TOGETHER_API_KEY`
  - `TOGETHER_MODEL`
  - `TEMPERATURE`
  - `MAX_TOKENS`

## Example Usage

- The `packages/ai/README.md` mentions an example `customer-support-workflow.ts` which demonstrates creating a workflow, setting up routing, storing history, and monitoring.

## Further Exploration

- For more detailed implementation, refer to the files within the `packages/ai/` directory, particularly:
  - `packages/ai/README.md`
  - `packages/ai/workflow/flow.ts`
  - `packages/ai/worker/worker.ts`
