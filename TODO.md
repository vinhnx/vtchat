# TODO

--

ok go-> https://vtchat.io.vn/

---

Research and rename "VT" to better and memorable name

--
https://chatgpt.com/c/68972f85-1fc0-8333-879f-e61e8ad627ef

--

https://oss-vibe-coding-platform.vercel.app/
https://github.com/codesandbox/sandpackWIP on deepresearch: 18d20878 feat(performance): Optimize LCP by implementing resource preloading and skeleton loading

--

Got it — I fixed the cause of the runtime error and tightened the Pyodide loader
so the app builds cleanly. Below is a quick summary, then a concise self-test g
uide.

**Fixes Applied**

- Tool schemas: Switched sandbox tools to use `parameters` (not `inputSchema`) t
  o match the AI SDK’s tool format and avoid the “Cannot read property '\_def'” err
  or.
    - File: `packages/ai/tools/sandbox.ts` (openSandbox/startSandbox/stopSandbox)
- Pyodide loader: Replaced dynamic https import with script injection to fix Nex
  t/Webpack UnhandledSchemeError.
    - File: `apps/web/components/pyodide-runner.tsx`

**Verify Build/Lint**

- Format: `bun run biome:format` (already passes for changed files)
- Build: `bun run build` (Pyodide script injection removes the https loader erro
  r)
- Dev: `bun dev`

If you still see “Cannot read '\_def'”, re-run dev so the updated tool schema is
picked up.

**Self-Test Guide**

- Prereqs:
    - `bun install`
    - Set `E2B_API_KEY` in `.env` for server sandboxes (VT+ only).
    - Start dev: `bun dev` → open `http://localhost:3000`.
    - In the app’s model settings, pick a tool-capable model (e.g., `gpt-4o-mini`)
      .

- Client Sandbox (React):
    - Prompt: “Open a sandbox with a minimal React counter: /App.tsx and /index.ts
      x.”
    - Expect: The right rail shows a Sandpack editor running the React app.

- Client Sandbox (Python/Pyodide):
    - Prompt: “Open a Python sandbox with /main.py that prints ‘hello VT’.”
    - Expect: The right rail shows a Python output panel with the printed message.
    - Note: First run shows “Booting Python…” briefly while Pyodide loads from CDN

- Server Sandbox (E2B, VT+ only):
    - Ensure you’re VT+ (userTier = PLUS) and `E2B_API_KEY` is set.
    - Prompt: “Start a server sandbox with template ‘python-interpreter’. Creat
      e /
      main.py that serves ‘Hello’ on port 8000 using aiohttp. Run `python main.py`.
      Po
      rt: 8000.”
    - Expect: Right rail iframe preview; if blocked by X-Frame-Options, use “Op
      en
      in new tab”.
    - Click “Stop sandbox” to verify cleanup; preview disappears.

- Right-Rail Behavior:
    - The latest `openSandbox` result takes priority over older ones.
    - If `startSandbox` returns a host, the iframe preview shows the app and a
      lin
      k to open in a new tab.

- Troubleshooting:
    - Tool list shows in server logs. After a prompt, confirm: “Final tools for
      AI
      { data: [ 'openSandbox', ... ] }”.
    - If you don’t see server sandbox tools, ensure `userTier` is PLUS; otherwi
      se
      only `openSandbox` will register.
    - If E2B key is missing/short, server sandbox throws: “Server sandbox is un
      ava
      ilable: E2B_API_KEY is not configured on the server.”
    - If iframe is blank, use the “Open in new tab” link.

Want me to also add a small VT+ upsell dialog for server sandbox attempts by
non
‑PLUS users, or wire the exact system prompt hints to push the model toward `
ope
nSandbox`/`startSandbox`?

--

https://github.com/e2b-dev/e2b-cookbook?tab=readme-ov-file

https://ai-sdk.dev/elements/overview

--

# TASK: E2B Sandbox Integration for Next.js App

## CONTEXT

Current state: Multiple sandbox environments (pyodide, sandpack) exist
Goal: Replace with single e2b implementation as premium feature

## REQUIREMENTS

### Core Implementation

- **REMOVE**: pyodide, sandpack code sandbox environments
- **IMPLEMENT**: e2b as sole execution environment
- **FOLLOW**: Next.js integration patterns from context7
- **REFINE**: panel component + system prompts for sandbox invocation

### User Access Control

```
VT+ Users: 2 executions/day ✅
VT Free: No access ❌
Free Users: No access ❌
```

### UI Requirements

- Dedicated sandbox invoke button in chat input (make it special/distinctive)
- Enhanced panel component for sandbox management
- Visual indicators for execution limits

### Technical Constraints

- Use only e2b free tier
- Internet access: OFF by default (configurable in /settings)
- Rate limits: https://e2b.dev/docs/sandbox/rate-limits
- Efficient lifecycle management to minimize costs

### Critical Features

1. **Rate Limiting**: Track daily executions per user
2. **Lifecycle Management**: Smart session reuse, auto-cleanup, timeouts
3. **Cost Optimization**: Minimize API calls and execution time
4. **Error Handling**: Graceful degradation when limits exceeded

## IMPLEMENTATION GUIDES

1. https://github.com/e2b-dev/e2b-cookbook/tree/main/examples/nextjs-code-interpreter
2. https://e2b.dev/docs/sandbox
3. https://e2b.dev/docs/sandbox/metadata
4. https://e2b.dev/docs/sandbox/internet-access

## OUTPUT FOCUS

- Complete working implementation
- Efficient sandbox management logic
- Premium feature gating
- Rate limiting system
- Cost-optimized configuration

--

https://github.com/e2b-dev/e2b-cookbook/tree/main/examples/anthropic-claude-code-in-sandbox-js

--

check branch e2b-sandbox

-

integrate https://github.com/e2b-dev/fragments/tree/main/sandbox-templates

--

https://ai-sdk.dev/cookbook/guides/gemini-2-5
