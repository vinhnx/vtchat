# AI SDK v5 Migration

## Overview

Upgraded project from AI SDK v4 to v5.

## Changes

- Updated `ai` package to v5.
- Bumped provider packages to v2 where available.
- Switched Google provider back to v2 for v5 compatibility.
- Replaced `experimental_generateSpeech` with `generateSpeech` and added structured logging.

## Verification

- `bun run lint`
- `bun run biome:format`
- `bun run build`
- `bun test`
