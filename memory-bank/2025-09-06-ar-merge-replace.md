# 2025-09-06 – AR hint merge/replace behavior

- Added centralized util `packages/common/utils/aspect-ratio.ts` with `mergeAspectRatioHint()` to detect and replace existing aspect ratio hints in prompts.
- Updated `packages/common/components/chat-input/actions/ImageGenButton.tsx` `AspectRatioSelector` to use the util, enabling replace-over-append behavior when an AR is already present.
- Supported forms: `in 16:9 aspect ratio`, bare numeric pairs like `16x9`/`16:9`, and bracketed template hints like `[4:3]`. Also injects a number after `aspect ratio` phrase if present without digits.
- Added tests: `apps/web/app/tests/ar-merge-behavior.test.ts` covering merge scenarios and fallback behavior.
- Ran `bun run fmt`. Skipped fixing unrelated lint issues flagged by oxlint. Tests execution is limited by sandbox; local run recommended.

