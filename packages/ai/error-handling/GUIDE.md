# Error Handling Guide (AI SDK v4)

## Handling regular errors

Regular errors are thrown and can be handled using the `try/catch` block.

```ts highlight="3,8-10"
import { generateText } from 'ai';

try {
    const { text } = await generateText({
        model: yourModel,
        prompt: 'Write a vegetarian lasagna recipe for 4 people.',
    });
} catch (error) {
    // handle error
    console.error('Error generating text:', error);
}
```

See [Error Types](/docs/reference/ai-sdk-errors) for more information on the different types of errors that may be thrown.

## Handling streaming errors (simple streams)

When errors occur during streams that do not support error chunks,
the error is thrown as a regular error.
You can handle these errors using the `try/catch` block.

```ts highlight="3,12-14"
import { streamText } from 'ai';

try {
    const { textStream } = streamText({
        model: yourModel,
        prompt: 'Write a vegetarian lasagna recipe for 4 people.',
    });

    for await (const textPart of textStream) {
        process.stdout.write(textPart);
    }
} catch (error) {
    // handle streaming error
    console.error('Error in text stream:', error);
}
```

## Handling streaming errors (streaming with `error` support)

Full streams support error parts.
You can handle those parts similar to other parts.
It is recommended to also add a try-catch block for errors that
happen outside of the streaming.

```ts highlight="13-17"
import { streamText } from 'ai';

try {
    const { fullStream } = streamText({
        model: yourModel,
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
                // handle error specifically
                console.error('Stream error:', error);
                break;
            }

            case 'abort': {
                // handle stream abort
                console.log('Stream was aborted');
                break;
            }
        }
    }
} catch (error) {
    // handle error
    console.error('Error in full stream:', error);
}
```

## Handling Stream Abort Events

When streams are aborted (e.g., via a stop button), you can handle this with the `onAbort` callback:

```ts
import { streamText } from 'ai';

const { textStream } = streamText({
    model: yourModel,
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

```ts
import { streamText } from 'ai';

const { fullStream } = streamText({
    model: yourModel,
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

VT Chat implements comprehensive error handling for both regular operations and streaming scenarios.

### Frontend Error Handling (AgentProvider)

The AgentProvider in VT Chat handles streaming errors with:

1. Regular HTTP errors are caught and parsed
2. Streaming errors are handled with event-based error handling
3. Abort signals are properly handled with cleanup
4. Tool errors are specifically identified and handled

```typescript
try {
    // Streaming implementation
    const response = await fetch('/api/completion', {
        method: 'POST',
        // ... other options
    });

    const reader = response.body?.getReader();
    // ... streaming logic
} catch (streamError: any) {
    // Handle abort errors specifically
    if (streamError.name === 'AbortError' || abortController.signal.aborted) {
        log.info('Stream was aborted by user');
        // Update UI state
        return;
    }

    // Extract meaningful error message
    const errorResult = ProviderErrorExtractor.extractError(streamError);

    if (errorResult.success && errorResult.error) {
        // Show user-friendly error message
        toast({
            title: `${errorResult.error.provider} Error`,
            description: errorResult.error.userMessage,
            variant: 'destructive',
        });
    }
}
```

### Backend Error Handling (API Routes)

Backend API routes handle errors through:

1. Stream error handlers that categorize errors
2. Proper error responses with user-friendly messages
3. Enhanced error events sent to the client
4. Graceful degradation when possible

```typescript
try {
    // AI model processing
    const result = await streamText({
        model: selectedModel,
        // ... other options
    });

    // Send stream response
    return new Response(stream, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
        },
    });
} catch (error) {
    // Log detailed error information
    log.error({ error }, 'AI processing error');

    // Return user-friendly error response
    return new Response(
        JSON.stringify({
            error: 'Something went wrong',
            message: 'Please try again later',
        }),
        {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        },
    );
}
```

### Workflow Task Error Handling

Workflow tasks use error handling utilities to:

1. Log errors appropriately
2. Send error events to the client
3. Provide user-friendly error messages
4. Handle specific error types (PDF, API keys, etc.)

```typescript
try {
    // Workflow task execution
    const result = await executeTask(taskData);

    // Send success event
    sendEvent({ type: 'success', data: result });
} catch (error) {
    // Handle specific error types
    if (error instanceof QuotaExceededError) {
        sendEvent({
            type: 'error',
            status: 'quota_exceeded',
            message: 'VT+ quota exceeded',
        });
    } else {
        // Handle general errors
        sendEvent({
            type: 'error',
            status: 'error',
            message: 'Something went wrong',
        });
    }

    // Log for debugging
    log.error({ error }, 'Workflow task error');
}
```

## Best Practices for Error Handling

1. **Always use try/catch** for regular operations
2. **Handle streaming errors** with appropriate event handling
3. **Provide user-friendly error messages** rather than technical details
4. **Log detailed error information** for debugging purposes
5. **Use specific error types** when possible for better error categorization
6. **Handle abort signals gracefully** with proper cleanup
7. **Clean up resources** when errors occur to prevent memory leaks
8. **Implement retry mechanisms** for transient errors with exponential backoff
9. **Categorize errors** to provide appropriate user guidance
10. **Test error scenarios** to ensure proper handling

## Error Categorization in VT Chat

VT Chat categorizes errors into several types:

1. **Quota Exceeded Errors** - When VT+ usage limits are reached
2. **Rate Limit Errors** - When API rate limits are exceeded
3. **Authentication Errors** - Invalid or missing API keys
4. **Network Errors** - Connection issues or timeouts
5. **Service Errors** - Provider-specific service errors
6. **Validation Errors** - Invalid input or configuration
7. **Abort Errors** - User-initiated stream cancellation

Each error type is handled with appropriate user messaging and logging.
