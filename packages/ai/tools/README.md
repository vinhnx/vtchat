# AI Tools

This package contains various tools that can be used with AI models to extend their capabilities.

## OpenAI Web Search Tool

The OpenAI Web Search tool provides web search capabilities using OpenAI's built-in `web_search_preview` tool available through the Responses API.

### Features

- **Built-in web search**: Uses OpenAI's native web search capabilities
- **Source citations**: Returns search results with sources
- **Error handling**: Graceful error handling with detailed error messages
- **Model validation**: Automatically checks if a model supports the Responses API

### Supported Models

Currently supports:
- `gpt-4o-mini`
- `gpt-4o`

### Usage

#### Basic Usage

```typescript
import { openaiWebSearchTool } from '@repo/ai/tools';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = await generateText({
  model: openai('gpt-4o-mini'),
  prompt: 'What are the latest developments in AI?',
  tools: {
    web_search: openaiWebSearchTool(),
  },
});
```

#### With Custom Model

```typescript
import { openaiWebSearchWithModel } from '@repo/ai/tools';

const tools = {
  web_search: openaiWebSearchWithModel('gpt-4o'),
};
```

#### Auto-detect Tool Based on Model

```typescript
import { getWebSearchTool } from '@repo/ai/tools';
import { ModelEnum } from '@repo/ai/models';

const model = ModelEnum.GPT_4o_Mini;
const webSearchTools = getWebSearchTool(model);

if (webSearchTools) {
  // Model supports web search
  const result = await generateText({
    model: openai(model),
    prompt: 'Search for recent news',
    tools: webSearchTools,
  });
}
```

### API Reference

#### `openaiWebSearchTool()`

Creates a basic web search tool using `gpt-4o-mini`.

**Returns**: `Tool` - A web search tool that can be used with `generateText`

#### `openaiWebSearchWithModel(modelId: string)`

Creates a web search tool with a specific OpenAI model.

**Parameters**:
- `modelId`: The OpenAI model ID (must support Responses API)

**Returns**: `Tool` - A web search tool configured for the specified model

#### `supportsOpenAIWebSearch(modelId: string)`

Checks if a model supports OpenAI's Responses API web search.

**Parameters**:
- `modelId`: The model ID to check

**Returns**: `boolean` - Whether the model supports web search

#### `getWebSearchTool(model: ModelEnum)`

Returns the appropriate web search tool for a given model, or null if not supported.

**Parameters**:
- `model`: The model enum value

**Returns**: `{ web_search: Tool } | null` - Web search tools object or null

### Error Handling

The tools include comprehensive error handling:

```typescript
const result = await openaiWebSearchTool().execute({ query: 'test search' });

if (!result.success) {
  console.error('Search failed:', result.error);
} else {
  console.log('Search results:', result.text);
  console.log('Sources:', result.sources);
}
```

### Integration with Existing Code

The web search tools can be integrated with existing workflow patterns:

```typescript
import { getWebSearchTool } from '@repo/ai/tools';
import { getModelFromChatMode, ModelEnum } from '@repo/ai/models';
import { ChatMode } from '@repo/shared/config';

// Get model based on chat mode
const model = getModelFromChatMode(ChatMode.GPT_4o_Mini);

// Get appropriate web search tool
const webSearchTools = getWebSearchTool(model);

// Use in generateText
const config = {
  model: getLanguageModel(model),
  prompt: userQuery,
  ...(webSearchTools && { tools: webSearchTools }),
};
```
