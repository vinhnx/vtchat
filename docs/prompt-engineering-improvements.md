# Prompt Engineering Best Practices Implementation

This document explains how we've implemented the prompt engineering best practices in our AI-powered application.

## Tool Calling Improvements

### 1. Temperature Settings for Deterministic Results

We've updated all our AI calls to use `temperature: 0` for deterministic and consistent results:

- **generateText** calls in `packages/ai/workflow/utils.ts`
- **generateObject** calls in `packages/ai/workflow/utils.ts` and `packages/ai/workflow/tasks/structured-extraction.ts`
- **Web search tools** in `packages/ai/tools/openai-web-search.ts`

This ensures that our tools produce consistent outputs when given the same inputs, which is especially important for:
- Mathematical calculations
- Structured data extraction
- Chart generation
- Web search operations

### 2. Parameter Schema Improvements

We've updated our Zod schemas to use `.nullable()` instead of `.optional()` for better compatibility with strict schema validation:

#### Math Tools (`apps/web/lib/tools/math.ts`)
- Updated `decimals` parameter in the `round` tool to use `.nullable()`

#### Chart Tools (`apps/web/lib/tools/charts.ts`)
- Updated optional parameters in all chart tools to use `.nullable()`:
  - `xAxisLabel`, `yAxisLabel`, `color` in `barChart`
  - `xAxisLabel`, `yAxisLabel`, `series1Name`, `series2Name`, `series3Name` in `lineChart`
  - `xAxisLabel`, `yAxisLabel`, `series1Name`, `series2Name`, `stacked` in `areaChart`
  - `showLabels`, `showLegend` in `pieChart`
  - `fullMark` and `maxValue` in `radarChart`

#### Web Search Tools (`packages/ai/tools/openai-web-search.ts`)
- Updated `maxResults` parameter to use `.nullable()`

### 3. Semantic Parameter Naming

We've ensured all tool parameters use semantically meaningful names with descriptive comments:
- All parameters have `.describe()` annotations explaining their purpose
- Names clearly indicate their function (e.g., `series1Name` instead of just `name`)

## Structured Data Schema Improvements

### 1. Date Handling Utilities

We've created utilities for proper date handling in Zod schemas:

#### `packages/shared/utils/zod-date-utils.ts`
- `dateStringToDate`: Transforms date strings to JavaScript Date objects
- `datetimeStringToDate`: Transforms datetime strings to JavaScript Date objects
- Helper functions for date range schemas
- Formatting utilities for API responses

#### `packages/shared/utils/zod-date-examples.ts`
- Example schemas demonstrating best practices
- Usage examples for date transformation
- API response schema examples

### 2. Schema Design Patterns

Our schemas follow these patterns:
- All fields have descriptive names
- All fields include `.describe()` annotations
- Optional fields use `.nullable()` for better compatibility
- Complex nested objects are broken down into logical components

## Debugging and Monitoring

### 1. Warning Inspection

We've created utilities to inspect AI SDK warnings:

#### `packages/ai/utils/debug-utils.ts`
- `inspectWarnings()`: Logs any warnings from AI SDK responses
- `inspectRequestBody()`: Inspects raw HTTP request bodies
- `debugAIResponse()`: Combined utility for comprehensive debugging

These utilities help identify:
- Unsupported features
- Provider-specific limitations
- Request formatting issues

### 2. Development-Only Debugging

Debug utilities are only active in development mode to avoid performance impacts in production:

```typescript
if (process.env.NODE_ENV === 'development') {
    const { debugAIResponse } = await import('../../utils/debug-utils');
    debugAIResponse(result, 'Operation context');
}
```

## Best Practices Summary

### For Tool Development
1. Use `temperature: 0` for deterministic results
2. Use `.nullable()` instead of `.optional()` for better compatibility
3. Provide descriptive parameter names and documentation
4. Include example input/outputs in comments
5. Implement proper error handling

### For Schema Design
1. Use semantic naming for all fields
2. Add `.describe()` annotations to all schema fields
3. Handle date transformations properly with Zod transformers
4. Use nullable fields for better strict schema validation compatibility

### For Debugging
1. Inspect warnings to identify unsupported features
2. Check request bodies to verify payload formatting
3. Use development-only debugging to avoid performance impacts
4. Log structured data for easier analysis

These improvements help ensure our AI tools are reliable, predictable, and easier to debug when issues arise.