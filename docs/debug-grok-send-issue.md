# Debug Guide: Grok Models "Tap Send Does Nothing"

## Issue Description
User reports that when using Grok models (Grok 3, Grok 3 Mini, Grok 4), clicking the send button does nothing - no message is sent and no BYOK dialog appears.

## Debugging Steps

### 1. Check Browser Console
1. Open Browser Developer Tools (F12)
2. Go to Console tab
3. Try to reproduce the issue
4. Look for these debug messages:

```
🐛 Send button clicked { hasTextInput: true/false, disabled: true/false }
🚀 sendMessage called for Grok debug { chatMode: "grok-4", isSignedIn: true, ... }
Send blocked: no message text
Send blocked: missing API key, showing BYOK dialog
```

### 2. Common Causes & Solutions

#### Cause 1: Empty Text Input
**Symptoms**: Send button appears disabled/grayed out
**Debug**: Check if `hasTextInput: false` in console
**Solution**: Type some text in the chat input before clicking send

#### Cause 2: Editor State Issues  
**Symptoms**: You typed text but `hasTextInput: false`
**Debug**: Check if `editorText: "..."` shows your text in console
**Solutions**: 
- Refresh the page and try again
- Clear browser cache and cookies
- Try a different browser

#### Cause 3: Missing XAI API Key
**Symptoms**: Send button works but nothing happens, no BYOK dialog
**Debug**: Check if you see "Send blocked: missing API key" message
**Solution**: The BYOK dialog should appear automatically. If not:
1. Go to Settings → API Keys
2. Add your XAI API key manually
3. Try sending again

#### Cause 4: JavaScript Errors
**Symptoms**: Console shows red error messages
**Debug**: Look for any error messages in console
**Solution**: Report the specific error message

### 3. Expected Flow for Grok Models

1. **Type message** → `hasTextInput: true` → Send button enabled
2. **Click send** → `sendMessage()` called
3. **Check API key** → If missing → BYOK dialog appears
4. **Enter XAI API key** → Dialog closes → Message sends

### 4. Manual Workaround

If the issue persists:
1. Go to Settings → API Keys  
2. Add your XAI API key: `sk-...` 
3. Select Grok model
4. Type your message
5. Click send

### 5. System Requirements

- **Account**: Must be signed in
- **API Key**: XAI API key required (get from console.x.ai)
- **Browser**: Modern browser with JavaScript enabled
- **Network**: Internet connection for API calls

## Technical Details

### Grok Model Configuration
- **Grok 3**: `grok-3` → Requires `XAI_API_KEY`
- **Grok 3 Mini**: `grok-3-mini` → Requires `XAI_API_KEY`  
- **Grok 4**: `grok-4` → Requires `XAI_API_KEY`

### BYOK (Bring Your Own Key) Flow
1. Grok models are **not** server-funded
2. All users (including VT+) need to provide XAI API key
3. Missing key should trigger BYOK validation dialog
4. Key is stored securely in browser local storage

## If Issue Persists

Please provide:
1. Browser console logs (especially the debug messages above)
2. Browser type and version
3. Whether you're signed in 
4. Whether you have an XAI API key
5. Exact steps to reproduce

## Recent Changes

Debug logging has been added to help diagnose this issue. The logs will help identify exactly where the submission flow is breaking.
