# TODO List

[] https://github.com/trendy-design/llmchat?tab=readme-ov-file#workflow-orchestration

--

[] Double check VT+ features

--
[] Pro Search Enhanced search with web integration for real-time information.

--

[] Deep Research: Comprehensive analysis of complex topics with in-depth exploration.

--
[] use <vinhnguyenxuan@icloud.com> for ampcode

--

## High Priority / Immediate Focus

[] check MCP Tools in settings

- [] <https://resend.com/>

- (Review and populate based on current sprint/goals)

## Authentication (Better Auth Integration & Enhancements)

- [ ] Handle current free -> anonymous flow: [https://www.better-auth.com/docs/plugins/anonymous](https://www.better-auth.com/docs/plugins/anonymous)
- [ ] Implement Email Verification: [https://www.better-auth.com/docs/authentication/email-password#email-verification](https://www.better-auth.com/docs/authentication/email-password#email-verification)
- [ ] Implement 2FA: [https://www.better-auth.com/docs/plugins/2fa](https://www.better-auth.com/docs/plugins/2fa)
- [ ] Implement Username Plugin: [https://www.better-auth.com/docs/plugins/username](https://www.better-auth.com/docs/plugins/username)
- [ ] Implement Email OTP: [https://www.better-auth.com/docs/plugins/email-otp](https://www.better-auth.com/docs/plugins/email-otp)
- [ ] Implement Magic Link: [https://www.better-auth.com/docs/plugins/magic-link](https://www.better-auth.com/docs/plugins/magic-link)
- [ ] Implement Captcha (especially for Admin Portal): [https://www.better-auth.com/docs/plugins/captcha](https://www.better-auth.com/docs/plugins/captcha)
- [ ] Optimize Better Auth for performance (Database, General): [https://www.better-auth.com/docs/guides/optimizing-for-performance#database-optimizations](https://www.better-auth.com/docs/guides/optimizing-for-performance#database-optimizations), [https://www.better-auth.com/docs/guides/optimizing-for-performance](https://www.better-auth.com/docs/guides/optimizing-for-performance)
- [ ] Build user profile concept: [https://www.better-auth.com/docs/concepts/users-accounts](https://www.better-auth.com/docs/concepts/users-accounts)
- [ ] Refactor auth client:
  - [ ] Use one shared `auth-client.ts`.
  - [ ] Move `auth-client.ts` to `packages/shared/lib/` (or a more appropriate shared location).
  - [ ] Rename `apps/web/lib/auth.ts` to `auth-server.ts` (if it's purely server-side).
- [ ] Update Better Auth config for `/error` and `/welcome` routes: [https://www.better-auth.com/docs/basic-usage#sign-in-with-social-providers](https://www.better-auth.com/docs/basic-usage#sign-in-with-social-providers)
- [ ] Implement request user avatar when login/signup from OAuth provider like Google and gitHub and sync to Neon DB.
- [ ] Handle account verification to protect against bots: [https://www.better-auth.com/docs/concepts/email](https://www.better-auth.com/docs/concepts/email)
- [ ] Ensure API keys are removed from client-side/session on logout or account switch.
- [ ] Review Better Auth general options: [https://www.better-auth.com/docs/reference/options](https://www.better-auth.com/docs/reference/options)
- [ ] Explore additional Better Auth resources:
  - [ ] Better Auth Utils: [https://github.com/better-auth/utils](https://github.com/better-auth/utils)
  - [ ] Better Auth OTP: <https://github.com/better-auth/utils?tab=readme-ov-file#otp>
  - [ ] Better Auth Cloudflare: [https://github.com/zpg6/better-auth-cloudflare](https://github.com/zpg6/better-auth-cloudflare)
  - [ ] Better Auth Validation: [https://github.com/Daanish2003/validation-better-auth](https://github.com/Daanish2003/validation-better-auth)
- [ ] Consider replacing Redis with Better Auth secondary storage options: [https://www.better-auth.com/docs/concepts/database#secondary-storage](https://www.better-auth.com/docs/concepts/database#secondary-storage)

## Subscription & Payments (Creemio & Neon Integration)

## Thread Management (Account-based & Neon Sync)

- [ ] Ensure threads are per-account and hidden when a user is logged out.
- [ ] On login (to existing or new account), fetch threads from the appropriate store (e.g., remote DB via API, then update local IndexedDB/Zustand).
- [ ] Design and implement an account-based thread management system using Neon/Postgres, leveraging existing thread schema and store logic. Review codebase for current implementation details.
- [ ] Free tier: Continue using local IndexedDB for threads.
- [ ] [PLUS TIER ONLY] Implement full remote thread synchronization with Neon DB.
- [ ] [PLUS TIER ONLY] Sync threads to Neon DB.

## UI/UX Improvements

- [ ] Migrate `@repo/ui` to use Shadcn's `components/ui` as the base.
- [ ] Clean up old `@repo/ui` code to unify the UI and remove redundancies.
- [ ] Leverage Context7 for Shadcn components and migrate components in `packages/common/components` to use Shadcn/Tailwind components.
- [ ] General UI/UX improvements across the application.
- [ ] Implement cookie consent mechanism.

## Dependencies & Code Health

- [ ] Review `package.json` files across the monorepo and remove redundant or unused dependencies. Consider using a tool like Knip ([https://knip.dev/](https://knip.dev/)) for assistance.

## AI & Providers

- [ ] Expand support for more AI providers using the AI SDK: [https://ai-sdk.dev/providers/ai-sdk-providers](https://ai-sdk.dev/providers/ai-sdk-providers)
- [ ] Review Gemini AI SDK Cheatsheet for potential optimizations/features: [https://patloeber.com/gemini-ai-sdk-cheatsheet/](https://patloeber.com/gemini-ai-sdk-cheatsheet/)
- [ ] Explore OpenAI Agents JS examples for advanced AI interactions: [https://github.com/openai/openai-agents-js/tree/main/examples/ai-sdk](https://github.com/openai/openai-agents-js/tree/main/examples/ai-sdk)

## Research & Exploration

- [ ] Explore Tailark: [https://tailark.com/](https://tailark.com/)
- [ ] UI Inspiration - ibelick.com: [https://ui.ibelick.com/](https://ui.ibelick.com/)
- [ ] Prompt Kit by ibelick: [https://github.com/ibelick/prompt-kit](https://github.com/ibelick/prompt-kit)
- [ ] Monetization Exploration - Lingo.dev: [https://github.com/lingodotdev/lingo.dev](https://github.com/lingodotdev/lingo.dev)
- [ ] Desktop Application - Electron: [https://github.com/electron/electron](https://github.com/electron/electron)
- [ ] Domain Name Research (vtai.io.vn, vtchat.io.vn) - *Consider moving detailed notes to a separate research document.*
  - Whois VN: [https://whois.inet.vn/whois?domain=vtchat.io.vn](https://whois.inet.vn/whois?domain=vtchat.io.vn)
  - VinaHost: [https://secure.vinahost.vn/ac/cart.php?a=confdomains](https://secure.vinahost.vn/ac/cart.php?a=confdomains)
  - <https://www.matbao.net/ten-mien/ket-qua-kiem-tra-ten-mien.html?tenmien=vtchat.io.vn#top_search>
