# Language Model Middleware in VT Chat

VT Chat implements a flexible middleware system for language models using the AI SDK's middleware capabilities. This allows us to enhance language model behavior with features like logging, caching, and content filtering in a provider-agnostic way.

## Available Middlewares

### 1. Logging Middleware
Logs parameters and generated text of language model calls for debugging and monitoring.

### 2. Caching Middleware
Caches generated text based on parameters to reduce API costs and improve response times.

### 3. Guardrails Middleware
Filters sensitive content from generated text to ensure safe and appropriate responses.

## Usage

### Basic Usage
To use middleware, you can pass it when getting a language model:

```typescript
import { getLanguageModel } from '@repo/ai/providers';
import { loggingMiddleware } from '@repo/ai/middleware';

const model = getLanguageModel(
  modelEnum,
  loggingMiddleware, // Single middleware
  byokKeys,
  useSearchGrounding,
  cachedContent,
  claude4InterleavedThinking,
  isVtPlus
);
```

### Multiple Middlewares
You can also pass an array of middlewares:

```typescript
import { getLanguageModel } from '@repo/ai/providers';
import { loggingMiddleware, cachingMiddleware } from '@repo/ai/middleware';

const model = getLanguageModel(
  modelEnum,
  [loggingMiddleware, cachingMiddleware], // Multiple middlewares
  byokKeys,
  useSearchGrounding,
  cachedContent,
  claude4InterleavedThinking,
  isVtPlus
);
```

### Using Middleware Configuration
For more flexible configuration, you can use the middleware configuration system:

```typescript
import { getLanguageModel } from '@repo/ai/providers';
import { MiddlewarePresets } from '@repo/ai/middleware/config';

const model = getLanguageModel(
  modelEnum,
  undefined, // No direct middleware
  byokKeys,
  useSearchGrounding,
  cachedContent,
  claude4InterleavedThinking,
  isVtPlus,
  MiddlewarePresets.DEVELOPMENT // Use a preset
);
```

### Custom Configuration
You can also create custom middleware configurations:

```typescript
import { getLanguageModel } from '@repo/ai/providers';

const model = getLanguageModel(
  modelEnum,
  undefined,
  byokKeys,
  useSearchGrounding,
  cachedContent,
  claude4InterleavedThinking,
  isVtPlus,
  {
    enableLogging: true,
    enableCaching: true,
    enableGuardrails: false,
  }
);
```

## Creating Custom Middleware

You can create your own middleware by implementing the `LanguageModelV2Middleware` interface:

```typescript
import type { LanguageModelV2Middleware } from '@ai-sdk/provider';

export const yourCustomMiddleware: LanguageModelV2Middleware = {
  wrapGenerate: async ({ doGenerate, params }) => {
    // Modify parameters before calling the model
    const modifiedParams = {
      ...params,
      // Add your modifications here
    };

    // Call the model
    const result = await doGenerate(modifiedParams);

    // Modify the result before returning
    return {
      ...result,
      // Add your modifications here
    };
  },

  wrapStream: async ({ doStream, params }) => {
    // Similar pattern for streaming
    return doStream(params);
  },
};
```

## Middleware Presets

The system provides several presets for common use cases:

- `DEVELOPMENT`: Enables logging and guardrails
- `PRODUCTION`: Enables caching and guardrails
- `PERFORMANCE`: Enables caching only
- `PRIVACY`: Enables guardrails only (no caching to avoid storing sensitive data)

## Best Practices

1. **Order Matters**: Middlewares are applied in the order they are provided. Place middlewares that modify parameters first and those that modify results last.

2. **Performance**: Be mindful of the performance impact of middlewares, especially for streaming responses.

3. **Error Handling**: Ensure your middlewares properly handle errors and don't break the middleware chain.

4. **Testing**: Test your middlewares thoroughly, especially when combining multiple middlewares.