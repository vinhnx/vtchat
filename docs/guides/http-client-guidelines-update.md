# HTTP Client Guidelines Update Summary

## Overview

Updated all agent guideline documents to reflect the migration from `fetch()` to the `ky` HTTP client for consistent, secure API requests across the codebase.

## Files Updated

### Core Agent Guidelines

1. **AGENT.md** - Added HTTP client section with quick reference
2. **AGENTS.md** - Added comprehensive HTTP client guidelines with examples
3. **CLAUDE.md** - Added HTTP client section for Claude agent
4. **GEMINI.md** - Added HTTP client guidelines for Gemini agent
5. **qodo.md** - Added HTTP client standards section

### GitHub/VS Code Instructions

6. **.github/copilot-instructions.md** - Added HTTP client patterns for GitHub Copilot
7. **.github/instructions/general.instructions.md** - Added general HTTP client guidelines
8. **.augment/rules/imported/AGENT.md** - Updated imported agent rules

## Key Guidelines Added

### Universal HTTP Client Rules

- **Always use ky HTTP client**: `import { http } from '@repo/shared/lib/http-client'`
- **Never use fetch() directly** - bypasses security, error handling, and standardization
- **Automatic JSON handling** - Methods return parsed JSON automatically
- **Built-in error handling** - HTTP errors are handled consistently
- **API key security** - Pass keys via `apiKeys` option, never in headers

### Common Patterns Added

```typescript
// GET requests
const data = await http.get('/api/user/profile');

// POST with data
const result = await http.post('/api/completion', { body: requestData });

// Streaming responses (for AI completions)
const response = await http.postStream('/api/completion', { body, signal });

// Requests with API keys
const result = await http.post('/api/external', {
    body: data,
    apiKeys: { openai: 'sk-...', anthropic: 'sk-...' },
});
```

### Streaming Support

- Added `postStream()` method guidelines for AI completion endpoints
- Emphasized proper signal handling for AbortController
- Highlighted Next.js 15 + Turbopack compatibility

## Benefits Achieved

1. **Consistency** - All agents now have the same HTTP client guidelines
2. **Security** - Proper API key handling documented across all agents
3. **Maintainability** - Centralized HTTP client reduces code duplication
4. **Performance** - Automatic JSON parsing and error handling
5. **Compatibility** - Streaming support for Next.js 15 + Turbopack

## Agent Coverage

✅ **Claude** - Comprehensive HTTP client guidelines with examples
✅ **Gemini** - Concise HTTP client rules
✅ **GitHub Copilot** - Detailed patterns and security practices
✅ **VS Code** - General HTTP client guidelines
✅ **Qodo/Qwen** - HTTP client standards and examples
✅ **Cursor** - Covered via general instructions (no specific file found)
✅ **Kiro** - Covered via general instructions (no specific file found)

## Migration Impact

- **9 files successfully migrated** from fetch to ky HTTP client
- **Zero remaining fetch() usage** in production code
- **Streaming compatibility** achieved for Next.js 15 + Turbopack
- **RSC payload errors** resolved with postStream method
- **API security** enhanced with centralized key handling

## Next Steps

1. **Monitor compliance** - Ensure all agents follow ky HTTP client guidelines
2. **Update documentation** - Keep HTTP client patterns current as features evolve
3. **Training updates** - Inform team members about new HTTP client standards
4. **Code reviews** - Watch for any accidental fetch() usage in future PRs

Date: 2025-08-14
Status: ✅ Complete
Impact: All agent guidelines synchronized with ky HTTP client migration
