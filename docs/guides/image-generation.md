# Image Generation & Nano Banana Conversational Editing

This guide documents VT's image generation experience including the revolutionary **Nano Banana conversational image editor** - the world's first AI-powered conversational image editing system.

## 🌟 Nano Banana - Conversational Image Editing (New to VT)

VT introduces **Nano Banana**, a breakthrough conversational image editor that transforms image creation and editing into natural conversation. Generate an image, then iteratively refine it through chat: "make the cat bigger", "change background to sunset", "add a party hat" - all while preserving your edit history.

👉 **[Complete Nano Banana Guide](./nano-banana-conversational-image-editing.md)** - Learn about this exclusive VT feature

## Traditional Image Generation

For standard one-shot image generation, VT provides powerful tools and integrations:mage Generation

This guide documents VT’s image generation experience and developer hooks, including aspect ratio handling and style templates.

## Overview

- UI entry points: `ImageGenButton`, `StyleModeSelector`, `AspectRatioSelector` in the chat input.
- BYOK required: Google Gemini API key powers image generation.
- API: Uses centralized `http` client to call `POST /api/image` with prompt and optional attachments.
- Logging and UX: Structured logging via `log` and user feedback via `toast` with graceful error states.

## Prerequisites

- Add your Gemini API key in Settings → API Keys. The button tooltip guides users when a key is missing.
- The HTTP client is centralized; never call `fetch()` directly. Import `http` from `@repo/shared/lib/http-client`.

## UI Components

- `packages/common/components/chat-input/actions/ImageGenButton.tsx:1`
  - Triggers generation, creates optimistic thread item, and updates results on completion.
- `packages/common/components/chat-input/actions/ImageGenButton.tsx:220`
  - `StyleModeSelector`: inserts structured prompt templates (Photorealistic, Sticker, Product, Minimalist, Comic).
- `packages/common/components/chat-input/actions/ImageGenButton.tsx:268`
  - `AspectRatioSelector`: applies an aspect ratio hint with replace-over-append behavior.

## Aspect Ratio Behavior

- Centralized util: `@repo/common/utils/aspect-ratio` → `mergeAspectRatioHint(text, ratio)`.
- Purpose: If a prompt already contains an aspect ratio hint, replace it instead of appending duplicates.
- Examples:
  - Source: `"A cat photo [16:9]"` + `1:1` → `"A cat photo [1:1]"` (replaced)
  - Source: `"Product shot in 4:3 aspect ratio"` + `16:9` → `"Product shot in 16:9 aspect ratio"` (replaced)
  - Source: `"Minimalist poster"` + `21:9` → no change (caller appends `in 21:9 aspect ratio`)

Developer reference:

- Util source: `packages/common/utils/aspect-ratio.ts:1`
- Tests: `apps/web/app/tests/ar-merge-behavior.test.ts:1`

## Request Flow

1. Collect prompt from editor, gather image attachments or inline base64 (optional).
2. Call `http.post('/api/image', { body: { prompt, images }, apiKeys, timeout })`.
3. Update the optimistic thread item with `text` and `images` from the response.

Key code paths:

- HTTP call: `packages/common/components/chat-input/actions/ImageGenButton.tsx:64`
- Thread updates: `packages/common/components/chat-input/actions/ImageGenButton.tsx:92`

## Error Handling

- Uses `@repo/shared/logger` (`log.error`) for structured logs with PII redaction.
- Displays `toast` with a friendly message; parses Ky `HTTPError` JSON when available.
- On error, marks the last thread item `ERROR` and persists the state.

References:

- Logging import: `packages/common/components/chat-input/actions/ImageGenButton.tsx:7`
- Toast usage: `packages/common/components/chat-input/actions/ImageGenButton.tsx:21`

## Usage Tips

- Style templates help users craft high-quality prompts quickly.
- Aspect ratio selector keeps the prompt clean by replacing prior hints instead of appending.
- Attachments can be user-uploaded images or inline `imageBase64` for edit flows.

## Testing

- Unit tests cover aspect ratio merge behavior: `apps/web/app/tests/ar-merge-behavior.test.ts:1`.
- Run tests with `bun test`.
