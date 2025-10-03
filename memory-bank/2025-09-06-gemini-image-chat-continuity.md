# Gemini Image Chat Continuity

Date: 2025-09-06

Summary:

- Implemented conversational continuity for image generation/editing with Gemini 2.5 Flash Image.
- When generating an image without new attachments, the client now reuses the last generated image in the current thread as the base for edits.
- Follow-up messages in a thread that previously produced images are automatically routed to the image flow.
- New thread items created during image edits link to the previous image turn via `parentId`.

Changes:

- packages/common/components/chat-input/actions/ImageGenButton.tsx
  - Reuse last `imageOutputs` as input when no images are attached.
  - Set `parentId` to the last image turn for continuity.

- packages/common/components/chat-input/input.tsx
  - Route messages to image flow if the last thread item has `imageOutputs`.
  - Reuse last `imageOutputs` as input when no images are attached.
  - Set `parentId` to the last image turn for continuity.

Notes:

- Keeps the existing AI SDK implementation and server API `/api/image` unchanged.
- Continues to use `ModelEnum.GEMINI_2_5_FLASH_IMAGE` under the hood.
- Respects BYOK and VT+ gating rules via centralized `http` client and stores.
