# Intelligent Tool Router

The intelligent tool router is VTChat's AI-powered feature that automatically activates the right tools based on user queries, providing a seamless and intelligent chat experience.

## Overview

The semantic tool router uses a combination of fast pattern matching and AI-powered semantic analysis to determine which tools should be activated based on user intent. This eliminates the need for manual tool toggling and provides a more intuitive user experience.

## Architecture

### Core Components

1. **Tool Registry** (`packages/ai/workflow/tool-registry.ts`)
   - Centralizes metadata for all available tools
   - Defines tool tiers (FREE/PLUS) and access control
   - Contains keywords, examples, and activation functions

2. **Semantic Router Task** (`packages/ai/workflow/tasks/semantic-tool-router.ts`)
   - Main routing logic with two-stage approach
   - Quick pattern matching for performance
   - AI embeddings for complex queries

3. **Embeddings Utility** (`packages/ai/workflow/utils/embeddings.ts`)
   - OpenAI text-embedding-3-small integration
   - Cosine similarity calculations
   - Performance-optimized caching

4. **Frontend Integration** (`packages/common/hooks/agent-provider.tsx`)
   - UI state synchronization
   - Real-time tool toggle updates
   - User tier validation

## Available Tools

### Free Tools (All Users)
- **Web Search**: Real-time web search for current information
- **Calculator**: Advanced mathematical calculations and functions
- **Chart Visualization**: Create interactive charts and graphs
- **Document Processing**: Analyze PDFs, DOCs, and other documents
- **Structured Output**: Extract structured data from documents
- **Vision Analysis**: Analyze images and visual content

### VT+ Exclusive Tools
- **Pro Search**: Fast grounding web search with AI
- **Deep Research**: Comprehensive multi-step analysis
- **AI Memory**: Personal knowledge base with RAG

## How It Works

### 1. Quick Pattern Matching
For common queries, regex patterns provide instant tool activation:

```typescript
const QUICK_PATTERNS = {
    calculator: /\d+[\s]*[+\-*/÷×%^]\s*\d+|calculate|solve|equation/i,
    webSearch: /search|find|look up|latest|current|news/i,
    charts: /chart|graph|visualize|plot|diagram/i,
    // ... more patterns
}
```

### 2. Semantic Analysis
For complex queries, OpenAI embeddings determine tool relevance:

1. Generate query embedding using OpenAI text-embedding-3-small
2. Calculate cosine similarity with pre-computed tool embeddings
3. Activate tools above similarity threshold (0.38)
4. Respect user tier restrictions

### 3. Context Awareness
- Avoids duplicate activations of already-enabled tools
- Respects manual user preferences
- Provides reasoning for tool selection

## Examples

### Automatic Activation Examples

| Query | Activated Tools | Reasoning |
|-------|----------------|-----------|
| "Calculate 15% of 1000" | Calculator | Math pattern detected |
| "Create a bar chart of sales data" | Charts | Visualization pattern |
| "Search for latest AI news" | Web Search | Search pattern |
| "Analyze this PDF document" | Document Processing | Document pattern |

### Multi-Tool Activation
Some queries may activate multiple tools:

| Query | Activated Tools | Reasoning |
|-------|----------------|-----------|
| "Search for data and create a chart" | Web Search + Charts | Multiple patterns matched |

## Performance Optimization

### Caching Strategy
- **Tool embeddings**: Pre-computed at startup
- **Query embeddings**: In-memory cache for repeated queries
- **Quick patterns**: Instant regex matching for common cases

### Fallback Behavior
- Pattern matching fails → Semantic analysis
- Semantic analysis fails → Graceful degradation
- API errors → Continue without routing

## User Experience

### Seamless Integration
- No manual tool toggling required
- Natural language queries work automatically
- UI toggles sync with router decisions
- Clear reasoning provided for transparency

### Privacy & Security
- Tool routing respects user subscription tier
- Chart tools available to all users (previously VT+ exclusive)
- No query content stored during routing process
- Anonymous usage analytics for optimization

## Configuration

### Similarity Threshold
Currently set to 0.38 for optimal balance between precision and recall.

### Pattern Updates
Regex patterns are continuously refined based on user query analysis.

### Tool Registry
New tools can be easily added to the registry with proper metadata.

## Testing

Comprehensive test suite covers:
- Tool registry functionality
- Embedding calculations
- Semantic routing accuracy
- Integration with workflow system
- User tier validation

Run tests with:
```bash
bun test packages/ai/workflow
```

## Future Enhancements

1. **Adaptive Threshold**: Dynamic similarity threshold based on query complexity
2. **User Learning**: Personalized routing based on user preferences
3. **Multi-Language Support**: Extend routing to non-English queries
4. **Advanced Analytics**: Detailed routing performance metrics
5. **Tool Suggestions**: Proactive tool recommendations

## Troubleshooting

### Common Issues

1. **Tools not activating**: Check user tier and tool availability
2. **Slow routing**: Verify OpenAI API key and embedding cache
3. **Incorrect routing**: Review patterns and similarity thresholds

### Debug Mode
Enable verbose logging for routing decisions:
```typescript
log.info({ selectedTools, reasoning, scores }, 'Router decision')
```

### Performance Monitoring
Track routing latency and accuracy through built-in analytics.
