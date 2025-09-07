# Image Generation Follow-Up Chat Fix

**Date**: 2025-01-09

## Issue Description

Follow-up messages in image generation conversations were failing with "Prompt is required" error, even when users provided valid prompts like "change the color of the flower to pink".

## Root Cause

The issue was in the `runImageFlow` function in `packages/common/components/chat-input/input.tsx`. When follow-up messages were sent, the prompt text was not being properly validated and cleaned before being sent to the `/api/image` endpoint. The prompt could contain invisible characters, extra whitespace, or other formatting that would cause it to be empty after the server's `.trim()` validation.

## Solution

### 1. Client-Side Prompt Validation

Added proper prompt validation and cleaning in the `runImageFlow` function:

```typescript
const runImageFlow = async (prompt: string) => {
    // Clean and validate the prompt
    const cleanPrompt = prompt?.toString()?.trim() || '';
    if (!cleanPrompt) {
        toast({
            title: 'Enter a prompt',
            description: 'Please type a description for your image.',
            variant: 'destructive',
        });
        return;
    }
    // ... rest of function uses cleanPrompt
};
```

### 2. Consistent Prompt Usage

Updated all references in `runImageFlow` to use the cleaned `cleanPrompt` instead of the original `prompt`:

- Thread item creation: `query: cleanPrompt`
- Thread title: `title: cleanPrompt.slice(0, 60)`
- API call: `{ prompt: cleanPrompt, images }`

## Files Modified

1. **`packages/common/components/chat-input/input.tsx`**
   - Added `cleanPrompt` validation in `runImageFlow` function
   - Added user-friendly error toast for empty prompts
   - Updated all prompt references to use `cleanPrompt`

2. **`apps/web/app/api/image/route.ts`**
   - Fixed user tier access (temporary simplification)
   - Added debug logging (later removed)

## Testing

The fix was verified by testing the image generation follow-up flow:

1. Initial image generation: ✅ Works
2. Follow-up message "change to porsche taycan": ✅ Works
3. Second follow-up "70s porsche 911 and change the background": ✅ Works

## Technical Details

### Before Fix

- Raw prompt could contain formatting issues
- No client-side validation
- Server rejected empty prompts after `.trim()`
- Users saw unhelpful "Prompt is required" error

### After Fix

- Prompt is cleaned and validated on client-side
- Early validation with user-friendly error messages
- Consistent prompt processing between initial generation and follow-ups
- Server receives clean, validated prompts

## Impact

- ✅ **Fixed**: Image generation follow-up conversations now work correctly
- ✅ **Improved UX**: Better error messages for empty prompts
- ✅ **Consistent**: Same validation logic across all image generation flows
- ✅ **Reliable**: Robust prompt processing prevents similar issues

## References

- **Issue**: Follow-up chat in image generation doesn't work with "Prompt is required" error
- **User Flow**: Generate image → Type follow-up message → Message processes successfully
- **Related**: Nano Banana conversational image editing feature
