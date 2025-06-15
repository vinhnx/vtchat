# TODO List

Yes, both ChatMode.Pro and ChatMode.Deep are directly related to the 'Grounding Web Search' feature:

Key findings:

Both modes are named "Web Search Grounding With Gemini" in the UI (lines 235-237)

Configuration details:

ChatMode.Deep: webSearch: false but requires FeatureSlug.DEEP_RESEARCH
ChatMode.Pro: webSearch: false but requires FeatureSlug.PRO_SEARCH
These are specialized research modes, not traditional web search:

They have webSearch: false because they use custom Gemini-powered grounding workflows
They require VT+ subscription (requiredPlan: PlanSlug.VT_PLUS)
They're routed to special workflow tasks (like gemini-web-search for Pro mode)
The distinction:

Regular chat modes with webSearch: true = standard web search
Pro/Deep modes with webSearch: false = specialized "Grounding Web Search - by Gemini" with custom workflows
So yes, these ChatMode values are the core implementation of your "Grounding Web Search" feature - they're the premium, Gemini-powered research modes that provide enhanced web grounding capabilities
--

simplify this since we are now only show/enable 'Web Search' button for subscribed/premium users

--

[] remove 'Web Search' button if not subscribed -> simply workflow
--

[]

Pro = 'pro',
Deep = 'deep',
review these ChatMode and see if relates to 'Grounding Web Search' feature?
-

[] check all provided models and features in dropdown
[] check for gated feature selection on models
[] check for llm api repsonse

--
[] use Gemini as main and default models for Deep Research
[] use Gemini as main and default models for Pro Search

--
[] support openai full
[] https://ai-sdk.dev/providers/ai-sdk-providers/openai
--
[] Gemini
[] https://ai-sdk.dev/providers/ai-sdk-providers/google-generative-ai#cached-content
[] https://ai-sdk.dev/providers/ai-sdk-providers/google-generative-ai#image-outputs
[] monet - https://ai-sdk.dev/providers/ai-sdk-providers/google-generative-ai#explicit-caching
[] monet - dynamicRetrievalConfig https://ai-sdk.dev/providers/ai-sdk-providers/google-generative-ai#dynamic-retrieval
--

[] Remove free/default models, use BYOK completely -> when click on a model on chat models selection list in chat input -> check for existing BYOK settings on Settings cache. if not it should open a modal to save a BYOK model and retry.

--

[] Handle credits system

--
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

## High ority / Immediate Focus

[] check MCP Tools in settings

- [] https://resend.com/docs/introduction

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
