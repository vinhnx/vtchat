# AI SDK v4 to v5 Migration Design

## Overview

This design document outlines the comprehensive migration strategy for VTChat from AI SDK v4 patterns to full AI SDK v5 compliance. While the project is already using AI SDK v5.0.11, extensive v4 patterns remain throughout the codebase that need systematic updating to leverage v5's enhanced capabilities and ensure future compatibility.

The migration will be executed in phases to minimize disruption while ensuring all AI functionality continues to work correctly throughout the process.

## Architecture

### Current State Analysis

Based on the codebase analysis, the following v4 patterns are currently in use:

1. **Workflow System**: Uses v4 streaming patterns in `packages/ai/workflow/utils.ts`
2. **Message Handling**: Mixed usage of v4 and v5 message structures
3. **Tool Definitions**: Some tools still use `parameters` instead of `inputSchema`
4. **Streaming Architecture**: Uses v4 single-chunk patterns instead of v5 start/delta/end
5. **Provider Configuration**: Mixed v4/v5 provider option patterns
6. **Error Handling**: Uses v4 error handling patterns

### Target Architecture

The target architecture will fully embrace AI SDK v5 patterns:

1. **Unified Streaming**: All streaming will use v5's start/delta/end patterns with unique IDs
2. **Modern Message System**: Complete migration to `UIMessage` with parts arrays
3. **Enhanced Tool System**: All tools will use `inputSchema` and proper type narrowing
4. **Provider Optimization**: All providers will use v5 configurations and features
5. **Improved Error Handling**: Centralized error handling with v5 patterns

## Components and Interfaces

### 1. Core AI Utilities Migration

**Location**: `packages/ai/workflow/utils.ts`

**Current Issues**:

- Uses v4 streaming patterns (`textDelta` instead of `text-delta`)
- Mixed usage of `CoreMessage` and `ModelMessage`
- Uses deprecated `providerMetadata` instead of `providerOptions`
- Uses v4 tool property names (`args/result` instead of `input/output`)

**Design Changes**:

```typescript
// Before (v4 pattern)
for await (const chunk of fullStream) {
    if (chunk.type === 'text') {
        fullText += chunk.textDelta;
        onChunk?.(chunk.textDelta, fullText);
    }
}

// After (v5 pattern)
for await (const chunk of fullStream) {
    switch (chunk.type) {
        case 'text-start':
            // Initialize text block
            break;
        case 'text-delta':
            fullText += chunk.delta;
            onChunk?.(chunk.delta, fullText);
            break;
        case 'text-end':
            // Finalize text block
            break;
    }
}
```

### 2. Provider Configuration Updates

**Location**: `packages/ai/providers.ts`

**Design Changes**:

- Update all provider configurations to use v5 patterns
- Remove deprecated options like `compatibility` for OpenAI
- Update Google provider to use provider-defined tools instead of `useSearchGrounding`
- Ensure all provider options use camelCase instead of snake_case

```typescript
// Before (v4 pattern)
const providerOptions = {
    google: {
        use_search_grounding: true,
    },
};

// After (v5 pattern)
const providerOptions = {
    google: {
        thinkingConfig: {
            includeThoughts: true,
            maxOutputTokens: budget,
        },
    },
};
```

### 3. Tool System Modernization

**Location**: `packages/ai/tools/`

**Design Changes**:

- Update all tool definitions to use `inputSchema` instead of `parameters`
- Update tool result handling to use `toModelOutput` instead of `experimental_toToolResultContent`
- Implement proper dynamic tool handling with type narrowing
- Update tool streaming to handle granular states

```typescript
// Before (v4 pattern)
const tool = {
    description: 'Weather tool',
    parameters: z.object({
        city: z.string(),
    }),
    execute: async ({ city }) => result,
};

// After (v5 pattern)
const tool = {
    description: 'Weather tool',
    inputSchema: z.object({
        city: z.string(),
    }),
    execute: async ({ city }) => result,
    toModelOutput: (result) => ({
        type: 'content',
        value: [{ type: 'text', text: result }],
    }),
};
```

### 4. Message System Overhaul

**Location**: Throughout the application

**Design Changes**:

- Migrate all `Message` types to `UIMessage`
- Update message content from string to parts array
- Update file handling to use `.url` and `.mediaType` instead of `.data` and `.mimeType`
- Update reasoning handling to use parts with `text` property

```typescript
// Before (v4 pattern)
interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    reasoning?: string;
}

// After (v5 pattern)
interface UIMessage {
    id: string;
    role: 'user' | 'assistant';
    parts: Array<{
        type: 'text' | 'file' | 'reasoning';
        text?: string;
        url?: string;
        mediaType?: string;
    }>;
}
```

### 5. Streaming Response Updates

**Location**: API routes and streaming handlers

**Design Changes**:

- Update all streaming responses to use `toUIMessageStreamResponse` instead of `toDataStreamResponse`
- Update error handling to use `onError` instead of `getErrorMessage`
- Implement proper message persistence with v5 patterns

```typescript
// Before (v4 pattern)
return result.toDataStreamResponse({
    getErrorMessage: (error) => ({
        message: 'Error occurred',
    }),
});

// After (v5 pattern)
return result.toUIMessageStreamResponse({
    originalMessages: messages,
    generateMessageId: () => generateId(),
    onError: (error) => ({
        message: 'Error occurred',
    }),
    onFinish: ({ messages, responseMessage }) => {
        saveChat({ chatId, messages });
    },
});
```

## Data Models

### 1. Message Data Model

```typescript
// V5 UIMessage structure
interface UIMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    parts: UIMessagePart[];
    createdAt?: Date;
}

interface UIMessagePart {
    type: 'text' | 'file' | 'reasoning' | 'tool-call' | 'tool-result';
    text?: string;
    url?: string;
    mediaType?: string;
    toolName?: string;
    input?: unknown;
    output?: unknown;
}
```

### 2. Tool Definition Model

```typescript
// V5 Tool structure
interface ToolDefinition {
    description: string;
    inputSchema: ZodSchema;
    execute: (input: unknown) => Promise<unknown>;
    toModelOutput?: (result: unknown) => ModelOutput;
}
```

### 3. Stream Chunk Model

```typescript
// V5 Stream chunk structure
interface StreamChunk {
    type:
        | 'text-start'
        | 'text-delta'
        | 'text-end'
        | 'reasoning-start'
        | 'reasoning-delta'
        | 'reasoning-end'
        | 'tool-input-start'
        | 'tool-input-delta'
        | 'tool-input-end'
        | 'tool-call'
        | 'tool-result'
        | 'finish-step'
        | 'finish';
    id?: string;
    delta?: string;
    text?: string;
    toolName?: string;
    input?: unknown;
    output?: unknown;
}
```

## Error Handling

### 1. Centralized Error Processing

**Design**: Create a centralized error handling system that uses v5 patterns:

```typescript
interface ErrorHandler {
    handleStreamError(error: Error, context: ErrorContext): ErrorResponse;
    handleToolError(error: Error, toolName: string): ToolErrorResponse;
    handleProviderError(error: Error, provider: string): ProviderErrorResponse;
}

// V5 error handling pattern
const handleError = (error: Error) => ({
    onError: (error) => ({
        errorCode: 'STREAM_ERROR',
        message: sanitizeErrorMessage(error),
        isRetryable: isRetryableError(error),
    }),
});
```

### 2. Provider-Specific Error Handling

**Design**: Update provider error extraction to use v5 patterns:

```typescript
class ProviderErrorExtractor {
    static extractError(error: Error, provider: string): {
        success: boolean;
        error?: {
            provider: string;
            errorCode: string;
            userMessage: string;
            isRetryable: boolean;
            suggestedAction?: string;
        };
    };
}
```

## Testing Strategy

### 1. Migration Testing Phases

**Phase 1: Core Utilities**

- Test `generateText` and `streamText` with v5 patterns
- Verify tool definitions work with `inputSchema`
- Test streaming with start/delta/end patterns

**Phase 2: Provider Integration**

- Test all providers with v5 configurations
- Verify reasoning capabilities work correctly
- Test error handling with new patterns

**Phase 3: Workflow Integration**

- Test complete workflow with v5 patterns
- Verify message persistence works correctly
- Test UI components with new message structure

**Phase 4: End-to-End Testing**

- Test complete user flows
- Verify performance is maintained or improved
- Test error scenarios and recovery

### 2. Test Coverage Requirements

- **Unit Tests**: 90% coverage for all migrated utilities
- **Integration Tests**: All AI provider integrations
- **E2E Tests**: Complete user workflows
- **Performance Tests**: Streaming performance benchmarks

### 3. Rollback Strategy

**Design**: Implement feature flags to allow gradual rollout:

```typescript
interface MigrationFlags {
    useV5Streaming: boolean;
    useV5MessageFormat: boolean;
    useV5ToolDefinitions: boolean;
    useV5ErrorHandling: boolean;
}
```

## Implementation Phases

### Phase 1: Foundation (Core API Migration)

1. Update core AI utilities in `packages/ai/workflow/utils.ts`
2. Migrate tool definitions to use `inputSchema`
3. Update provider configurations
4. Apply relevant codemods

### Phase 2: Streaming Architecture

1. Update streaming patterns to use start/delta/end
2. Migrate response handlers to `toUIMessageStreamResponse`
3. Update error handling patterns
4. Test streaming functionality

### Phase 3: Message System

1. Migrate message types to `UIMessage`
2. Update message content to use parts arrays
3. Update file handling patterns
4. Update reasoning handling

### Phase 4: Integration and Testing

1. Update workflow system integration
2. Test all AI features end-to-end
3. Performance testing and optimization
4. Documentation updates

### Phase 5: Cleanup and Optimization

1. Remove all v4 patterns and deprecated code
2. Optimize performance with v5 features
3. Update documentation and examples
4. Final testing and validation

## Performance Considerations

### 1. Streaming Optimization

**V5 Benefits**:

- Concurrent streaming of multiple content types
- Better real-time UX with granular updates
- Improved error handling during streams

**Implementation**:

- Use unique IDs for tracking stream chunks
- Implement proper buffering for optimal UX
- Handle stream interruption and resumption

### 2. Memory Management

**Design Considerations**:

- Efficient handling of large message histories
- Proper cleanup of stream resources
- Optimized tool result caching

### 3. Network Optimization

**V5 Features**:

- Better compression with Server-Sent Events
- Reduced payload sizes with structured streaming
- Improved error recovery mechanisms

## Security Considerations

### 1. Error Message Sanitization

**Design**: Ensure error messages don't leak sensitive information:

```typescript
const sanitizeErrorMessage = (error: Error): string => {
    // Remove API keys, internal paths, and sensitive data
    return error.message
        .replace(/sk-[a-zA-Z0-9]+/g, '[API_KEY]')
        .replace(/\/[a-zA-Z0-9\/]+/g, '[PATH]');
};
```

### 2. Input Validation

**Design**: Use v5's enhanced input validation:

```typescript
const validateToolInput = (input: unknown, schema: ZodSchema) => {
    const result = schema.safeParse(input);
    if (!result.success) {
        throw new ToolValidationError(result.error);
    }
    return result.data;
};
```

## Monitoring and Observability

### 1. Migration Metrics

**Track**:

- Migration completion percentage
- Performance impact measurements
- Error rates before/after migration
- User experience metrics

### 2. Logging Strategy

**Design**: Enhanced logging with v5 patterns:

```typescript
interface MigrationLogger {
    logStreamingPerformance(metrics: StreamingMetrics): void;
    logToolExecution(toolName: string, duration: number): void;
    logProviderUsage(provider: string, tokens: number): void;
    logMigrationProgress(phase: string, completion: number): void;
}
```

## Rollout Strategy

### 1. Gradual Migration

**Approach**:

- Feature flags for each migration phase
- A/B testing for critical paths
- Gradual user rollout (10% → 50% → 100%)
- Monitoring at each stage

### 2. Rollback Plan

**Triggers**:

- Error rate increase > 5%
- Performance degradation > 10%
- User complaints > threshold
- Critical functionality broken

**Process**:

- Immediate feature flag disable
- Rollback to previous version
- Root cause analysis
- Fix and re-deploy

This design ensures a systematic, safe, and comprehensive migration to AI SDK v5 while maintaining system stability and user experience throughout the process.
