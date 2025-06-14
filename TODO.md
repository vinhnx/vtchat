# TODO List

## High Priority / Immediate Focus
*   (Review and populate based on current sprint/goals)

## Authentication (Better Auth Integration & Enhancements)
- [ ] Implement Better Auth: [https://better-auth-ui.com/getting-started/installation](https://better-auth-ui.com/getting-started/installation)
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
- [ ] Implement user avatar handling from OAuth provider and sync to Neon DB.
- [ ] Handle account verification to protect against bots: [https://www.better-auth.com/docs/concepts/email](https://www.better-auth.com/docs/concepts/email)
- [ ] Ensure API keys are removed from client-side/session on logout or account switch.
- [ ] Review Better Auth general options: [https://www.better-auth.com/docs/reference/options](https://www.better-auth.com/docs/reference/options)
- [ ] Explore Better Auth UI Components: [https://www.better-auth-kit.com/docs/cli/ui-components](https://www.better-auth-kit.com/docs/cli/ui-components)
- [ ] Implement Legal Consent plugin if required: [https://www.better-auth-kit.com/docs/plugins/legal-consent](https://www.better-auth-kit.com/docs/plugins/legal-consent)
- [ ] Explore additional Better Auth resources:
    - [ ] Awesome Better Auth: [https://github.com/better-auth/awesome](https://github.com/better-auth/awesome)
    - [ ] Better Auth Utils: [https://github.com/better-auth/utils](https://github.com/better-auth/utils)
    - [ ] Better Auth Harmony: [https://github.com/GeKorm/better-auth-harmony](https://github.com/GeKorm/better-auth-harmony) (also [https://github.com/gekorm/better-auth-harmony/](https://github.com/gekorm/better-auth-harmony/))
    - [ ] Better Auth Cloudflare: [https://github.com/zpg6/better-auth-cloudflare](https://github.com/zpg6/better-auth-cloudflare)
    - [ ] Better Auth Validation: [https://github.com/Daanish2003/validation-better-auth](https://github.com/Daanish2003/validation-better-auth)
- [ ] Consider replacing Redis with Better Auth secondary storage options: [https://www.better-auth.com/docs/concepts/database#secondary-storage](https://www.better-auth.com/docs/concepts/database#secondary-storage)

## Subscription & Payments (Creemio & Neon Integration)
- [ ] **IMPORTANT**: Handle Creemio subscription hook to sync subscription status to Neon DB and user session. Ensure this integrates with Better Auth if needed.
- [ ] **IMPORTANT**: Verify existing Creem subscription status before allowing a new subscription to prevent duplicates.
- [ ] [PLUS TIER ONLY?] Sync `user_subscriptions` data to Neon DB. Refer to Neon Console: [https://console.neon.tech/app/projects/lucky-cake-27376292/branches/br-sparkling-glitter-a1wtucle/tables?database=vt_dev](https://console.neon.tech/app/projects/lucky-cake-27376292/branches/br-sparkling-glitter-a1wtucle/tables?database=vt_dev)

## Thread Management (Account-based & Neon Sync)
- [ ] Ensure threads are per-account and hidden when a user is logged out.
- [ ] On login (to existing or new account), fetch threads from the appropriate store (e.g., remote DB via API, then update local IndexedDB/Zustand).
- [ ] Implement full remote thread synchronization with Neon DB.
- [ ] Design and implement an account-based thread management system using Neon/Postgres, leveraging existing thread schema and store logic. Review codebase for current implementation details.
- [ ] [PLUS TIER ONLY?] Sync threads to Neon DB.
- [ ] Free tier: Continue using local IndexedDB for threads.

## UI/UX Improvements
- [ ] Migrate `@repo/ui` to use Shadcn's `components/ui` as the base.
- [ ] Clean up old `@repo/ui` code to unify the UI and remove redundancies.
- [ ] Leverage Context7 for Shadcn components and migrate components in `packages/common/components` to use Shadcn/Tailwind components.
- [ ] Standardize typography: Fetch Shadcn typography docs ([https://ui.shadcn.com/docs/components/typography](https://ui.shadcn.com/docs/components/typography)) and replace hardcoded typography styles with the Shadcn system.
- [ ] General UI/UX improvements across the application.
- [ ] Implement cookie consent mechanism.

## Dependencies & Code Health
- [ ] Review `package.json` files across the monorepo and remove redundant or unused dependencies. Consider using a tool like Knip ([https://knip.dev/](https://knip.dev/)) for assistance.
- [ ] Review and unify icon package usage. Aim to use a single package, preferably `lucide-react`.
- [ ] Investigate and apply Next.js 15 optimization directives where appropriate (`use-cache`, `use-client`, `use-server`):
    - [ ] `use-cache`: [https://nextjs.org/docs/app/api-reference/directives/use-cache](https://nextjs.org/docs/app/api-reference/directives/use-cache)
    - [ ] `use-client`: [https://nextjs.org/docs/app/api-reference/directives/use-client](https://nextjs.org/docs/app/api-reference/directives/use-client)
    - [ ] `use-server`: [https://nextjs.org/docs/app/api-reference/directives/use-server](https://nextjs.org/docs/app/api-reference/directives/use-server)
- [ ] Address Webpack build warnings: `<w> [webpack.cache.PackFileCacheStrategy] Serializing big strings (...) impacts deserialization performance (consider using Buffer instead and decode when needed)`.

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
    - VNNIC: [https://vnnic.vn/whois-information](https://vnnic.vn/whois-information)
    - Viettel IDC: [https://viettelidc.com.vn/Domain/SearchAutomationDomain?keyword=vtchat.io.vn](https://viettelidc.com.vn/Domain/SearchAutomationDomain?keyword=vtchat.io.vn)
    - VinaHost: [https://secure.vinahost.vn/ac/cart.php?a=confdomains](https://secure.vinahost.vn/ac/cart.php?a=confdomains)
    - DomainsGPT: [https://www.domainsgpt.ai/DomainSearch/?domain=vtai.com](https://www.domainsgpt.ai/DomainSearch/?domain=vtai.com)
    - Namecheap: [https://www.namecheap.com/domains/registration/results/?domain=vtai](https://www.namecheap.com/domains/registration/results/?domain=vtai)
    - Porkbun: [https://porkbun.com/checkout/search?prb=d41b158dc5&q=vtai.space](https://porkbun.com/checkout/search?prb=d41b158dc5&q=vtai.space)
    - Namelix: [https://namelix.com/app/?keywords=vtai](https://namelix.com/app/?keywords=vtai)
    - Domainr: [https://domainr.com/?q=vtai](https://domainr.com/?q=vtai)
- [ ] Pricing Page Reference: [https://chorus.sh/pricing](https://chorus.sh/pricing)

---
*Note: The "Subscription Management" product brief section from the original TODO.md has been omitted as it's informational rather than a task. This information should ideally reside in `productContext.md` or a dedicated specification document.*
