# TODO

-

[] explore full Anthropic capablity
<https://ai-sdk.dev/providers/ai-sdk-providers/anthropic>
[] <https://ai-sdk.dev/providers/ai-sdk-providers/anthropic#computer-use>
[] <https://ai-sdk.dev/providers/ai-sdk-providers/anthropic#bash-tool>
[] <https://ai-sdk.dev/providers/ai-sdk-providers/anthropic#text-editor-tool>
[] <https://ai-sdk.dev/providers/ai-sdk-providers/anthropic#computer-tool>
[] <https://ai-sdk.dev/providers/ai-sdk-providers/anthropic#pdf-support>

--

[] <https://ai-sdk.dev/cookbook/node/retrieval-augmented-generation>

--

[pro] <https://ai-sdk.dev/cookbook/next/chat-with-pdf>
--

<https://docs.railway.com/reference/production-readiness-checklist>
--

--

[] <https://docs.creem.io/faq/account-reviews>

--

[] remove FREE_TIER_DAILY_LIMIT and KV Redis Upstash depedeny completly
[] open free chat for logged in user -> use vtchat gemini key
[] free: if use pre-defined key: 9 per day
[] plus: if use pre-defined key: 30 per day
[] -> if has gemini in byok -> unlimited
[] implement credit tracking (FREE_TIER_DAILY_LIMIT)

--

[]
remember to publish Google Auth
<https://console.cloud.google.com/auth/audience?authuser=6&inv=1&invt=Ab0LuQ&project=psyched-span-463012-h5>

--
[] <https://scira.ai/settings?tab=profile>
--

<https://github.com/zaidmukaddam/scira/blob/main/app/settings/page.tsx> -> clone ProfileSection
--

[] <https://github.com/ping-maxwell/better-auth-kit/tree/main/packages/plugins/reverify>
--

[] <https://github.com/ping-maxwell/better-auth-kit/tree/main/packages/plugins/profile-image>
--

[] <https://github.com/ping-maxwell/better-auth-kit/tree/main/packages/plugins/legal-consent>
--

[] <https://github.com/ping-maxwell/better-auth-kit/tree/main/packages/plugins/app-invite>

--
[] build waitlist ?
<https://github.com/ping-maxwell/better-auth-kit/tree/main/packages/plugins/waitlist>

--
[] Reddit marketing cheat codes every startup founder should know: <https://x.natiakourdadze/status/1933939677016228177>

--
[][monet] <https://ai-sdk.dev/docs/guides/multi-modal-chatbot>
--

[][monet] RAG <https://ai-sdk.dev/docs/guides/rag-chatbot>

--
[] <https://ai-sdk.dev/cookbook/node/web-search-agent#building-a-web-search-tool>

--
[] support openai full
[] <https://ai-sdk.dev/providers/ai-sdk-providers/openai>
[][monet] OpenAI web search - <https://ai-sdk.dev/providers/ai-sdk-providers/openai#web-search>
[][monet] <https://ai-sdk.dev/providers/ai-sdk-providers/openai#audio-input>
[][monet] <https://ai-sdk.dev/providers/ai-sdk-providers/openai#reasoning-summaries>
[][monet] <https://ai-sdk.dev/providers/ai-sdk-providers/openai#reasoning-summaries>
[][monet] <https://ai-sdk.dev/providers/ai-sdk-providers/openai#image-models>
[][monet] <https://ai-sdk.dev/providers/ai-sdk-providers/openai#image-models>
[][monet] <https://ai-sdk.dev/providers/ai-sdk-providers/openai#speech-models>
--

[] Gemini
[] <https://ai-sdk.dev/providers/ai-sdk-providers/google-generative-ai#cached-content>
[][monet] <https://ai-sdk.dev/providers/ai-sdk-providers/google-generative-ai#image-outputs>
[][monet] <https://ai-sdk.dev/providers/ai-sdk-providers/google-generative-ai#explicit-caching>
--

- [] <https://resend.com/docs/introduction>

## Authentication (Better Auth Integration & Enhancements)

- [ ] Handle current free -> anonymous flow: [https://www.better-auth.com/docs/plugins/anonymous](https://www.better-auth.com/docs/plugins/anonymous)
- [ ] Implement Email Verification: [https://www.better-auth.com/docs/authentication/email-password#email-verification](https://www.better-auth.com/docs/authentication/email-password#email-verification)
- [ ] Implement 2FA: [https://www.better-auth.com/docs/plugins/2fa](https://www.better-auth.com/docs/plugins/2fa)
- [ ] Implement Username Plugin: [https://www.better-auth.com/docs/plugins/username](https://www.better-auth.com/docs/plugins/username)
- [ ] Implement Email OTP: [https://www.better-auth.com/docs/plugins/email-otp](https://www.better-auth.com/docs/plugins/email-otp)
- [ ] Implement Magic Link: [https://www.better-auth.com/docs/plugins/magic-link](https://www.better-auth.com/docs/plugins/magic-link)
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

## Thread Management (Account-based & Neon Sync)

- [ ] Free tier: Continue using local IndexedDB for threads.
- [ ] [PLUS TIER ONLY] Implement full remote thread synchronization with Neon DB.
- [ ] [PLUS TIER ONLY] Sync threads to Neon DB.

## UI/UX Improvements

- [ ] Migrate `@repo/ui` to use Shadcn's `components/ui` as the base.
- [ ] Clean up old `@repo/ui` code to unify the UI and remove redundancies.
- [ ] Leverage Context7 for Shadcn components and migrate components in `packages/common/components` to use Shadcn/Tailwind components.
- [ ] General UI/UX improvements across the application.

--

- [ ] Desktop Application - Electron: [https://github.com/electron/electron](https://github.com/electron/electron)
- [ ] Domain Name Research (vtai.io.vn, vtchat.io.vn) - _Consider moving detailed notes to a separate research document._
  - Whois VN: [https://whois.inet.vn/whois?domain=vtchat.io.vn](https://whois.inet.vn/whois?domain=vtchat.io.vn)
  - VinaHost: [https://secure.vinahost.vn/ac/cart.php?a=confdomains](https://secure.vinahost.vn/ac/cart.php?a=confdomains)
  - <https://www.matbao.net/ten-mien/ket-qua-kiem-tra-ten-mien.html?tenmien=vtchat.io.vn#top_search>

--

[] grand final showcase <https://github.com/vercel/ai/discussions/1914>

[] grand final showcase <https://github.com/vercel/ai/discussions/1914>
[] grand final showcase <https://github.com/vercel/ai/discussions/1914>
[] grand final showcase <https://github.com/vercel/ai/discussions/1914>
