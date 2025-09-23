# Gemini 2.5 Flash Lite – BYOK Configuration Guide

> **Last updated:** September 2025

Gemini 2.5 Flash Lite is no longer funded by VT servers. Every request must use a user-provided
Gemini API key (BYOK). This guide outlines the required configuration across the app to enforce the
new policy and remove the legacy server-funded behaviour.

## Key Changes

- **Model metadata** – `packages/ai/models.ts` no longer marks Flash Lite as `isFree`.
- **Chat configuration** – `packages/common/components/chat-input/chat-config.tsx` now requires the
  `GEMINI_API_KEY` enum entry and removes the "free" badge.
- **API prompts** – `packages/common/components/api-key-prompt-modal.tsx` and BYOK dialogs list
  Flash Lite under Google models so users are prompted for their Gemini key.
- **Access checks** – `packages/common/components/model-settings.tsx` and
  `packages/common/lib/chat-mode-utils.ts` treat Flash Lite as a BYOK-only model.
- **Workflow execution** – `packages/ai/workflow/utils.ts`,
  `packages/ai/services/google-url-context.ts`, and
  `packages/ai/workflow/tasks/gemini-web-search.ts` reject the server `GEMINI_API_KEY` when
  Flash Lite is selected and surface clear error messages instructing users to add their own key.

## Environment Expectations

- VT infrastructure no longer provides a fallback `GEMINI_API_KEY` for Flash Lite requests.
- VT+ managed keys continue to serve higher tier Gemini models (Flash, Pro). Flash Lite always
  relies on BYOK even for VT+ members.
- Deployment secrets can keep `GEMINI_API_KEY` for other managed models, but it is ignored for
  Flash Lite requests.

## User Experience

1. Selecting Gemini 2.5 Flash Lite triggers the BYOK modal if the local store does not contain a
   Gemini key.
2. Server-side routes (`/api/completion`, structured extract tools, etc.) return explicit
   `Gemini 2.5 Flash Lite now requires your own Gemini API key` errors when no key is present.
3. Model settings, marketing copy, and documentation highlight that Flash Lite is BYOK-only.

## Testing Checklist

- [ ] Switch to Gemini 2.5 Flash Lite without a stored key → API key modal appears.
- [ ] Provide a valid Gemini key → completions stream successfully.
- [ ] Attempt server-side flows (web search, planning) without a Gemini key → receive BYOK error.
- [ ] VT+ users without a Gemini key still see the BYOK requirement for Flash Lite.

Following these steps ensures there is no remaining dependency on the deprecated
server-funded Gemini access for Flash Lite.
