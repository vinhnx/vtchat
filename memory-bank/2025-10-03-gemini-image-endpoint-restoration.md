# Gemini Image Endpoint Restoration

Date: 2025-10-03

Summary:

- Restored `/api/image` to call `generateGeminiImage` using Gemini 3 Flash Image.
- Added BYOK header/body merge with VT+ managed key fallback and security headers.
- Implemented structured error handling, logging, and attachment sanitization.

Impact:

- Fixes 503 maintenance response so image generation works again for users.
- Preserves security posture by requiring Gemini API key for non-VT+ users.
- Provides consistent logging and responses for monitoring and UI consumption.
