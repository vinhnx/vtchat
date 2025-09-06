# Gemini Image Generation Integration

Date: 2025-09-06

Changes:

- Added Gemini image generation support using `gemini-2.5-flash-image-preview`.
- New model enum and registry entry for image-preview model.
- Server API `POST /api/image` to generate images from a prompt.
- Client button `ImageGenButton` to trigger image generation from the chat input.
- Thread rendering now displays AI-generated images in the chat thread.

Files:

- packages/ai/models.ts: Added `GEMINI_2_5_FLASH_IMAGE_PREVIEW`.
- packages/ai/image.ts: Helper `generateGeminiImage` with `responseModalities`.
- apps/web/app/api/image/route.ts: New API route.
- packages/shared/types.ts: Added `ImageOutput` and `ThreadItem.imageOutputs`.
- packages/common/components/thread/thread-item.tsx: Render `imageOutputs`.
- packages/common/components/chat-input/actions/ImageGenButton.tsx: New action button.
- packages/common/components/chat-input/chat-actions.tsx: Export `ImageGenButton`.
- packages/common/components/chat-input/input.tsx: Added button to toolbar.
- packages/shared/**tests**/gemini-image-preview-model.test.ts: Model test.

Notes:

- Uses centralized HTTP client via `@repo/shared/lib/http-client`.
- Respects BYOK via mapped API keys; VT+ server key policy remains intact in providers.
- Minimal UI addition; images render as a simple grid below AI content.
