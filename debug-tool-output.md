# Tool Call Debugging Summary

## Issue

Calculator tool calls execute successfully but results don't stream/display in chat UI.

## Evidence from logs:

```
🔧 Tool call { toolName: 'add', args: { a: 1, b: 1 } }
🔧 Tool result for { toolName: 'add', result: { result: 2 } }
🏁 Workflow ended after task "completion".
```

## AI SDK v5 Changes Applied

1. ✅ Fixed completion.ts to use `toolResult.output` instead of `toolResult.result`
2. ✅ Fixed utils.ts to handle AI SDK v5 chunk types
3. ✅ Updated streaming to handle `text-delta` with proper property names

## Next Steps

Need to check if math calculator results should be:

1. Displayed inline in markdown content (like the response)
2. Displayed as separate ToolInvocationStep components (like charts)

Based on code review, math tools might need explicit rendering in ThreadItem like charts do.
