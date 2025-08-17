# VT Chat Language Model Middleware Implementation

## Overview
This implementation adds a flexible middleware system to VT Chat's language model infrastructure, allowing for enhanced behavior through intercepting and modifying calls to language models.

## Files Created

### Middleware Implementations
1. `packages/ai/middleware/logging-middleware.ts` - Logs parameters and generated text for debugging
2. `packages/ai/middleware/caching-middleware.ts` - Caches generated text to reduce API costs
3. `packages/ai/middleware/guardrails-middleware.ts` - Filters sensitive content for safety

### Configuration
4. `packages/ai/middleware/config.ts` - Middleware configuration system with presets
5. `packages/ai/middleware/index.ts` - Export all middleware components

### Documentation and Examples
6. `packages/ai/middleware/README.md` - Documentation on how to use the middleware system
7. `packages/ai/middleware/example.ts` - Example usage of the middleware system

### Tests
8. `packages/ai/__tests__/middleware.test.ts` - Tests for the middleware system

## Key Features

### 1. Flexible Middleware Application
- Support for single or multiple middleware
- Configuration-based middleware selection
- Presets for common use cases (DEVELOPMENT, PRODUCTION, PERFORMANCE, PRIVACY)

### 2. Built-in Middleware
- **Logging**: Comprehensive logging of model calls and responses
- **Caching**: In-memory caching to reduce API costs
- **Guardrails**: Content filtering for sensitive information

### 3. Easy Integration
- Seamless integration with existing `getLanguageModel` function
- Backward compatibility with existing middleware parameters
- Automatic combination of provided and configured middleware

### 4. Presets for Common Use Cases
- **DEVELOPMENT**: Enable logging and guardrails for debugging
- **PRODUCTION**: Enable caching and guardrails for performance and safety
- **PERFORMANCE**: Enable caching only for maximum performance
- **PRIVACY**: Enable guardrails only (no caching to avoid storing sensitive data)

## Usage Examples

### Basic Usage
```typescript
import { getLanguageModel } from '@repo/ai/providers';
import { loggingMiddleware } from '@repo/ai/middleware';

const model = getLanguageModel(modelEnum, loggingMiddleware);
```

### Using Configuration
```typescript
import { getLanguageModel } from '@repo/ai/providers';
import { MiddlewarePresets } from '@repo/ai/middleware/config';

const model = getLanguageModel(
  modelEnum,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  isVtPlus,
  MiddlewarePresets.DEVELOPMENT
);
```

### Custom Configuration
```typescript
import { getLanguageModel } from '@repo/ai/providers';

const model = getLanguageModel(
  modelEnum,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  isVtPlus,
  {
    enableLogging: true,
    enableCaching: true,
    enableGuardrails: false,
  }
);
```

## Implementation Details

### Integration with Existing Code
The middleware system was integrated with the existing `getLanguageModel` function by:
1. Adding a new `middlewareConfig` parameter
2. Updating the function to combine provided middleware with configured middleware
3. Maintaining backward compatibility with existing middleware parameters

### Extensibility
The system is designed to be easily extensible:
1. New middleware can be created by implementing the `LanguageModelV2Middleware` interface
2. New presets can be added to the `MiddlewarePresets` object
3. Custom middleware configurations can be passed directly

## Testing
The implementation includes comprehensive tests that verify:
1. All middleware components are properly defined
2. Middleware presets are correctly configured
3. Content filtering functionality works as expected