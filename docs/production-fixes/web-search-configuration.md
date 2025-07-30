# Web Search Production Configuration Fix

## Issue Description

Web search functionality is failing on production (vtchat.io.vn) due to missing `GEMINI_API_KEY` environment variable.

## Root Cause

The web search system requires a server-side Gemini API key for production environments. This is different from user BYOK (Bring Your Own Key) functionality.

## Solution

### 1. Set GEMINI_API_KEY on Fly.io

```bash
# Set the Gemini API key as a secret in Fly.io
fly secrets set GEMINI_API_KEY="your_gemini_api_key_here" --app vtchat

# Verify the secret was set
fly secrets list --app vtchat
```

### 2. Verify Configuration

After setting the secret, you can verify the configuration using the debug endpoint:

```bash
# Check web search configuration
curl https://vtchat.io.vn/api/debug/web-search
```

### 3. Expected Response

A properly configured system should return:

```json
{
  "status": "ok",
  "webSearchConfig": {
    "hasGeminiApiKey": true,
    "environment": "production",
    "isProduction": true,
    "isFlyApp": true
  },
  "recommendations": []
}
```

## How Web Search Works

### Production Environment
- **Requires**: System `GEMINI_API_KEY` environment variable
- **Fallback**: None - web search will fail without system key
- **User Experience**: VT+ users get server-funded web search

### Development Environment  
- **Requires**: User BYOK keys OR system `GEMINI_API_KEY`
- **Fallback**: User can provide their own Gemini API key
- **User Experience**: Flexible - works with user keys or system key

## Validation Logic

The system validates web search availability using this logic:

```typescript
// In production, require system API key
if (isProduction) {
    return hasGeminiKey; // Must have GEMINI_API_KEY
}

// In development, web search can work with user API keys
return true;
```

## Troubleshooting

### Check Current Status

```bash
# Debug web search configuration
curl https://vtchat.io.vn/api/debug/web-search | jq

# Check if GEMINI_API_KEY is set (will show length, not actual key)
fly ssh console --app vtchat -C "echo \$GEMINI_API_KEY | wc -c"
```

### Common Issues

1. **Missing API Key**: `GEMINI_API_KEY` not set in Fly.io secrets
2. **Invalid API Key**: Key format incorrect (should be 39 characters starting with 'AIza')
3. **Budget Limits**: Gemini API budget exceeded

### Fix Commands

```bash
# Set the API key
fly secrets set GEMINI_API_KEY="AIza..." --app vtchat

# Restart the app to pick up new secrets
fly apps restart vtchat

# Monitor logs for initialization
fly logs --app vtchat
```

## Security Notes

- Never commit API keys to version control
- Use Fly.io secrets for production environment variables
- API keys are automatically redacted in application logs
- The debug endpoint only shows key length/prefix, never the full key

## Related Files

- `packages/ai/services/web-search-validator.ts` - Validation logic
- `apps/web/app/api/debug/web-search/route.ts` - Debug endpoint
- `packages/ai/workflow/tasks/gemini-web-search.ts` - Web search implementation
