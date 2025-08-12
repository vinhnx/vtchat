# Enhanced Tool System Implementation Guide

## Overview

This document outlines the implementation of an enhanced tool system for VT Chat that integrates AI SDK's streaming tool patterns with the existing VT Chat infrastructure.

## Key Features Implemented

### 1. **Enhanced Tool Call States**

The tool system now supports the full range of AI SDK tool call states:

- `partial-call` - Tool call being streamed (for OpenAI streaming)
- `call` - Complete tool call ready for execution
- `executing` - Tool currently being executed
- `result` - Tool execution completed successfully
- `error` - Tool execution failed

### 2. **Streaming Tool Utilities**

New utilities in `packages/ai/tools/streaming-utils.ts`:

```typescript
import { createPartialToolCall, createToolResult, StreamingToolExecutor } from '@repo/ai/tools';

// Create streaming executor
const executor = new StreamingToolExecutor({
    onToolCallUpdate: toolCall => console.log('Tool call update:', toolCall),
    onToolResult: result => console.log('Tool result:', result),
});

// Handle streaming tool execution
await executor.executeToolWithStreaming(toolCall, async args => {
    // Your tool implementation
    return await myTool(args);
});
```

### 3. **Enhanced Tool Registry**

Centralized tool management in `packages/ai/tools/registry.ts`:

```typescript
import { getToolsForModel, toolRegistry } from '@repo/ai/tools';

// Get tools for a specific model and context
const tools = getToolsForModel('gpt-4o-mini', {
    enableWebSearch: true,
    enableMath: true,
    onToolCallUpdate: handleToolCallUpdate,
    onToolResult: handleToolResult,
});
```

### 4. **Enhanced UI Components**

#### ToolInvocationStep Component

New component that handles all tool states in one unified interface:

```tsx
import { ToolInvocationStep } from '@repo/common/components';

<ToolInvocationStep
    toolCall={toolCall} // Optional: current tool call
    toolResult={toolResult} // Optional: tool result
/>;
```

Features:

- **State-aware rendering** - Shows different UI based on tool state
- **Execution timing** - Displays execution time for completed tools
- **Error handling** - Special styling for failed tools
- **Streaming indicators** - Loading animations for active tools
- **Expandable details** - Collapsible view of tool arguments and results

## Integration with Existing System

### Workflow Integration

The enhanced tools integrate seamlessly with the existing workflow system:

```typescript
// In your workflow tasks
import { toolRegistry } from '@repo/ai/tools';

// Set up streaming callbacks
toolRegistry.setupStreaming({
    model: currentModel,
    onToolCallUpdate: toolCall => {
        // Update UI with streaming tool call
        updateThreadItem({ toolCalls: { [toolCall.toolCallId]: toolCall } });
    },
    onToolResult: result => {
        // Update UI with tool result
        updateThreadItem({ toolResults: { [result.toolCallId]: result } });
    },
});
```

### Type System Updates

Enhanced types in `packages/shared/types.ts`:

```typescript
export type ToolCall = {
    type: 'tool-call';
    toolCallId: string;
    toolName: string;
    args: any;
    state?: 'partial-call' | 'call' | 'executing'; // New streaming states
    timestamp?: number;
};

export type ToolResult = {
    type: 'tool-result';
    toolCallId: string;
    toolName: string;
    args: any;
    result: any;
    state?: 'result' | 'error'; // New result states
    executionTime?: number;
    timestamp?: number;
};
```

## Usage Examples

### 1. **OpenAI Web Search with Streaming**

```typescript
import { openai } from '@ai-sdk/openai';
import { getToolsForModel } from '@repo/ai/tools';
import { generateText } from 'ai';

const tools = getToolsForModel('gpt-4o-mini', {
    enableWebSearch: true,
    onToolCallUpdate: toolCall => {
        // Handle streaming tool call updates
        if (toolCall.state === 'partial-call') {
            showStreamingIndicator(toolCall);
        } else if (toolCall.state === 'executing') {
            showExecutingIndicator(toolCall);
        }
    },
    onToolResult: result => {
        // Handle tool completion
        if (result.state === 'result') {
            displayToolResult(result);
        } else if (result.state === 'error') {
            showToolError(result);
        }
    },
});

const result = await generateText({
    model: openai('gpt-4o-mini'),
    prompt: 'Search for the latest AI news',
    tools,
    toolCallStreaming: true, // Enable streaming
    maxSteps: 5,
});
```

### 2. **Custom Tool with Execution Tracking**

```typescript
import { StreamingToolExecutor } from '@repo/ai/tools';

const executor = new StreamingToolExecutor({
    onToolCallUpdate: updateUI,
    onToolResult: displayResult,
});

// Custom tool execution
await executor.executeToolWithStreaming(toolCall, async args => {
    // Simulate a long-running operation
    await delay(2000);
    return { data: 'Custom tool result' };
});
```

## Benefits

### For Developers

1. **Unified Tool Interface** - Single component handles all tool states
2. **Streaming Support** - Real-time updates during tool execution
3. **Error Handling** - Built-in error states and UI
4. **Type Safety** - Enhanced TypeScript support
5. **Extensibility** - Easy to add new tools

### For Users

1. **Real-time Feedback** - See tools executing in real-time
2. **Better Error Messages** - Clear indication when tools fail
3. **Execution Timing** - See how long tools take to run
4. **Progressive Disclosure** - Expandable tool details

## Future Enhancements

### 1. **User Interaction Tools**

Tools that require user confirmation (like in AI SDK docs):

```typescript
// Future: User confirmation tool
const confirmationTool = {
    name: 'askForConfirmation',
    description: 'Ask user for confirmation',
    autoExecute: false, // Requires user interaction
    // Implementation...
};
```

### 2. **Multi-step Tool Chains**

Enhanced support for complex tool workflows:

```typescript
// Future: Multi-step tool execution
const toolChain = [
    { tool: 'webSearch', args: { query: 'AI news' } },
    { tool: 'summarize', args: { content: '{{webSearch.result}}' } },
    { tool: 'generateChart', args: { data: '{{summarize.result}}' } },
];
```

### 3. **Tool Analytics**

Track tool usage and performance:

```typescript
// Future: Tool analytics
const analytics = {
    executionTime: 1250,
    successRate: 0.95,
    mostUsedTool: 'webSearch',
    // More metrics...
};
```

## Migration Guide

### For Existing Components

1. **Replace ToolResultStep with ToolInvocationStep** where possible
2. **Update tool state handling** to use new state types
3. **Add streaming callbacks** to workflow tasks

### Backward Compatibility

- All existing tool components continue to work
- ToolResultStep is now a wrapper around ToolInvocationStep
- No breaking changes to existing APIs

## Testing

New test utilities for tool streaming:

```typescript
import { createPartialToolCall, createToolResult } from '@repo/ai/tools';

// Test streaming behavior
const partialCall = createPartialToolCall('test-id', 'webSearch', { q: 'test' });
const result = createToolResult(partialCall, { data: 'test result' }, 500);
```

## Performance Considerations

1. **Streaming Updates** - Debounced UI updates for rapid tool calls
2. **State Management** - Efficient state updates using Zustand selectors
3. **Memory Management** - Cleanup of completed tool executions
4. **Error Boundaries** - Isolate tool execution errors

## Security Considerations

1. **Input Validation** - All tool arguments are validated
2. **Error Sanitization** - Error messages are sanitized before display
3. **Rate Limiting** - Tool execution respects rate limits
4. **Permission Checks** - Tools check user tier permissions

This enhanced tool system provides a robust foundation for current and future tool integrations while maintaining compatibility with existing implementations.
