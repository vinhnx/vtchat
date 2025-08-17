# Error Handling in VT Chat

This guide explains how error handling is implemented in VT Chat, following best practices from the AI SDK and general error handling patterns.

## Regular Error Handling

Regular errors are handled using standard try/catch blocks:

```typescript
import { generateText } from 'ai';

try {
  const { text } = await generateText({
    model: 'openai/gpt-4.1',
    prompt: 'Write a vegetarian lasagna recipe for 4 people.',
  });
} catch (error) {
  // Handle error appropriately
  console.error('Error generating text:', error);
}
```

## Streaming Error Handling

### Simple Streams

For streams that don't support error chunks, errors are thrown as regular errors:

```typescript
import { streamText } from 'ai';

try {
  const { textStream } = streamText({
    model: 'openai/gpt-4.1',
    prompt: 'Write a vegetarian lasagna recipe for 4 people.',
  });

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
} catch (error) {
  // Handle streaming error
  console.error('Error in text stream:', error);
}
```

### Full Streams with Error Support

Full streams support error parts that can be handled along with other parts:

```typescript
import { streamText } from 'ai';

try {
  const { fullStream } = streamText({
    model: 'openai/gpt-4.1',
    prompt: 'Write a vegetarian lasagna recipe for 4 people.',
  });

  for await (const part of fullStream) {
    switch (part.type) {
      case 'text-delta': {
        process.stdout.write(part.textDelta);
        break;
      }

      case 'error': {
        const error = part.error;
        // Handle error specifically
        console.error('Stream error:', error);
        break;
      }

      case 'abort': {
        // Handle stream abort
        console.log('Stream was aborted');
        break;
      }

      case 'tool-error': {
        const error = part.error;
        // Handle tool error specifically
        console.error('Tool error:', error);
        break;
      }
    }
  }
} catch (error) {
  // Handle any errors that occur outside of streaming
  console.error('Error in full stream:', error);
}
```

## Stream Abort Handling

When streams are aborted (e.g., via chat stop button), use the `onAbort` callback to handle cleanup:

```typescript
import { streamText } from 'ai';

const { textStream } = streamText({
  model: 'openai/gpt-4.1',
  prompt: 'Write a vegetarian lasagna recipe for 4 people.',
  onAbort: ({ steps }) => {
    // Update stored messages or perform cleanup
    console.log('Stream aborted after', steps.length, 'steps');
  },
  onFinish: ({ steps, totalUsage }) => {
    // This is called on normal completion
    console.log('Stream completed normally');
  },
});

for await (const textPart of textStream) {
  process.stdout.write(textPart);
}
```

You can also handle abort events directly in the stream:

```typescript
import { streamText } from 'ai';

const { fullStream } = streamText({
  model: 'openai/gpt-4.1',
  prompt: 'Write a vegetarian lasagna recipe for 4 people.',
});

for await (const chunk of fullStream) {
  switch (chunk.type) {
    case 'abort': {
      // Handle abort directly in stream
      console.log('Stream was aborted');
      break;
    }
    // ... handle other part types
  }
}
```

## Error Handling in VT Chat

### Frontend (AgentProvider)

The AgentProvider in VT Chat handles streaming errors with comprehensive error handling:

1. Regular HTTP errors are caught and parsed
2. Streaming errors are handled with event-based error handling
3. Abort signals are properly handled with cleanup
4. Tool errors are specifically identified and handled

### Backend (API Routes)

The backend API routes handle errors through:

1. Stream error handlers that categorize errors
2. Proper error responses with user-friendly messages
3. Enhanced error events sent to the client
4. Graceful degradation when possible

### Workflow Tasks

Workflow tasks use the `handleError` utility to:

1. Log errors appropriately
2. Send error events to the client
3. Provide user-friendly error messages
4. Handle specific error types (PDF, API keys, etc.)

## Best Practices

1. Always use try/catch for regular operations
2. Handle streaming errors with appropriate event handling
3. Provide user-friendly error messages
4. Log detailed error information for debugging
5. Use specific error types when possible
6. Handle abort signals gracefully
7. Clean up resources when errors occur