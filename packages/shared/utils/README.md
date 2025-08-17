# Prompt Engineering Utilities

This directory contains utilities and examples for implementing prompt engineering best practices in the VT Chat application.

## Contents

### 1. Date Handling Utilities (`zod-date-utils.ts`)

Utilities for properly handling dates in Zod schemas:

- `dateStringToDate`: Transforms date strings to JavaScript Date objects
- `datetimeStringToDate`: Transforms datetime strings to JavaScript Date objects
- Helper functions for creating schemas that properly handle date transformations

### 2. Date Handling Examples (`zod-date-examples.ts`)

Examples demonstrating best practices for date handling with Zod:

- Basic date schema example
- Schema with date ranges
- API response schema with date fields
- Usage examples for date transformation

### 3. Debug Utilities (`debug-utils.ts`)

Utilities for debugging AI SDK operations:

- `inspectWarnings`: Inspects warnings from AI SDK responses
- `inspectRequestBody`: Inspects raw HTTP request bodies
- `debugAIResponse`: Combined utility for comprehensive debugging

## Usage

### Date Handling

```typescript
import { dateStringToDate } from '@repo/shared/utils/zod-date-utils';

// Create a schema with proper date handling
const userSchema = z.object({
  name: z.string(),
  birthDate: dateStringToDate.describe('User\'s date of birth'),
  createdAt: datetimeStringToDate.describe('When the user was created'),
});

// Parse data - dates will be JavaScript Date objects
const userData = {
  name: "John Doe",
  birthDate: "1990-01-01",
  createdAt: "2023-01-01T10:00:00Z"
};

const parsedUser = userSchema.parse(userData);
console.log(parsedUser.birthDate instanceof Date); // true
```

### Debug Utilities

```typescript
import { debugAIResponse } from '@repo/ai/utils/debug-utils';

// Use in development to debug AI SDK operations
if (process.env.NODE_ENV === 'development') {
  debugAIResponse(result, 'User profile extraction');
}
```

## Best Practices Implemented

1. **Temperature Settings**: All AI calls use `temperature: 0` for deterministic results
2. **Parameter Schema**: Using `.nullable()` instead of `.optional()` for better compatibility
3. **Semantic Naming**: All parameters use descriptive names with `.describe()` annotations
4. **Date Handling**: Proper transformation between string dates and JavaScript Date objects
5. **Debugging**: Utilities for inspecting warnings and request bodies

## Related Documentation

See `docs/prompt-engineering-improvements.md` for detailed explanations of all improvements and best practices.