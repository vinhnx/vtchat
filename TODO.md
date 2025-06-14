# TODO List

--
@vtchat/web:dev: <w> [webpack.cache.PackFileCacheStrategy] Serializing big strings (108kiB) impacts deserialization performance (consider using Buffer instead and decode when needed)
@vtchat/web:dev: <w> [webpack.cache.PackFileCacheStrategy] Serializing big strings (144kiB) impacts deserialization performance (consider using Buffer instead and decode when needed)
@vtchat/web:dev: <w> [webpack.cache.PackFileCacheStrategy] Serializing big strings (128kiB) impacts deserialization performance (consider using Buffer instead and decode when needed)
@vtchat/web:dev:  ✓ Compiled /chat in 6.3s (4302 modules)

--

[] Implement <https://better-auth-ui.com/getting-started/installation>

--

1. make sure threads is per account and hide on logged out.
1. on login to existing or new account, should fetched from store and indexdb

--

1. wow! <https://tailark.com/>

--

Subscription Management

# IMPORTANT

### VT+ subscription product description brief specs

name: VT+
product id: prod_1XIVxekQ92QfjjOqbDVQk6 (use env: CREEM_PRODUCT_ID key instead. don't hardcode value)
description: For everyday productivity
Payment Details:

- type: supbscription
- pricing: 9.99 USD
- subscription inverval: monthly
- price includes tax
Product Features:
1 Pro Search
a. description: "Pro Search: Enhanced search with web integration for real-time information."

2. Dark Mode:
a. description: "Access to dark mode."
3. Deep Research
a. description:: "Deep Research: Comprehensive analysis of complex topics with in-depth exploration."

--

1. you can use Context7 MCP tools
1. you can use Neon MCP tools
2. you can use any mcp tools if stuck.
1. make sure to check for current environment.
   - If in development, use sandbox API keys and test customer IDs.
   - If in production, use live API keys and ensure proper customer management.

--

[] <https://github.com/zpg6/better-auth-cloudflare>
--

[] check package.json and remove redundant dependencies and unused deps
[] check package.json to review icons lib use -> unify

[] <https://www.better-auth.com/docs/plugins/2fa>

[] <https://www.better-auth.com/docs/plugins/username>

[] handle current free -> anonymous flow <https://www.better-auth.com/docs/plugins/anonymous>
[] use plunk for email provider <https://app.useplunk.com/>

--

[] <https://www.better-auth.com/docs/plugins/email-otp>

[] <https://www.better-auth.com/docs/plugins/magic-link>

[] ADMIN PORTANT <https://www.better-auth.com/docs/plugins/captcha>

[] <https://www.better-auth.com/docs/plugins/captcha>

[] <https://github.com/gekorm/better-auth-harmony/>

[] <https://github.com/Daanish2003/validation-better-auth>

[] check optimization for nextjs 15
<https://nextjs.org/docs/app/api-reference/directives/use-cache>
<https://nextjs.org/docs/app/api-reference/directives/use-client>
<https://nextjs.org/docs/app/api-reference/directives/use-server>

--
[] IMPORTANT handle creemio subscription hook to sync to neon db and user session. connect with better auth if needed

--

[] IMPORTANT MUST CHECK FOR EXISTING CREEM SUBSCRIPTION STATUS OTHERWISE DON'T LET USER SUBSCRIPT TOO MANY TIME IMPORTANT

--

[] <https://www.better-auth.com/docs/guides/optimizing-for-performance#database-optimizations>
[] optimize <https://www.better-auth.com/docs/guides/optimizing-for-performance>
[] email verify <https://www.better-auth.com/docs/authentication/email-password#email-verification>
[] build user profile <https://www.better-auth.com/docs/concepts/users-accounts>;;

/better-auth-llmstxt

1. use 1 shared auth-client. remove the one from apps/web/lib.
1. move the auth-client.ts to apps/web/lib/
1. rename auth.ts to auth-server.ts

[] PLUS TIER ONLY? sync store user_subscriptions to neon db <https://console.neon.tech/app/projects/lucky-cake-27376292/branches/br-sparkling-glitter-a1wtucle/tables?database=vt_dev>
[] replace redis with <https://www.better-auth.com/docs/concepts/database#secondary-storage>
[] update better auth config on /error /welcome route <https://www.better-auth.com/docs/basic-usage#sign-in-with-social-providers>
[] ref pricing <https://chorus.sh/pricing>
[] user avatar better auth from oauth provider and sync neon db
[] handle account verify to protect bot? <https://www.better-auth.com/docs/concepts/email>
[] <https://ui.ibelick.com/>
[] <https://github.com/ibelick/prompt-kit>

implement full remote thread sync.
can you implement account-based thread managements system with neon and postgres using out existing thread schema and store logic. review #codebase for clues
--

[] [PLUS] sync thread to neon?
[] free keep current local threads indexdb
[] remove api keys when logout/switch accounts
[] <https://www.better-auth.com/docs/reference/options>
[] <https://github.com/GeKorm/better-auth-harmony>
[] <https://www.better-auth-kit.com/docs/cli/ui-components>
[] <https://www.better-auth-kit.com/docs/plugins/legal-consent>
[] <https://github.com/better-auth/awesome>
[] <https://github.com/better-auth/utils>
[] improve ui/ux

1. migrate `@repo/ui` to use shadcn's components/ui
2. cleanup old repo ui code to unify ui and cleanup
3. use context7 for shadcn components and migrate from package commonet components to use shadcn/tailwinds components instead
4. #fetch <https://ui.shadcn.com/docs/components/typography> and replace all current hardcode typography to use shadcn typo system

[] <https://patloeber.com/gemini-ai-sdk-cheatsheet/>
[] <https://docs.creem.io/sdk/nextjs-template> sample creem.io integration
[] <https://github.com/openai/openai-agents-js/tree/main/examples/ai-sdk>
[] support more providers <https://ai-sdk.dev/providers/ai-sdk-providers>
[] <https://www.better-auth-kit.com/docs/introduction>
[] <https://better-auth-ui.com/>

--

- <https://supersaas.dev/blog/how-to-launch-your-side-project>

[] remove unrelated depedencies from our main stack -> use [knip](https://knip.dev/)

- review and unify icon package usage in #codebase. review package.json and use 1 package (lucide-react) for icons.
- buy domain name -> .io.vn (gov sponsor)
- vtai.io.vn
- vtchat.io.vn
<https://whois.inet.vn/whois?domain=vtchat.io.vn>
- <https://vnnic.vn/whois-information>
- <https://viettelidc.com.vn/Domain/SearchAutomationDomain?keyword=vtchat.io.vn>
- good <https://secure.vinahost.vn/ac/cart.php?a=confdomains>
- <https://www.domainsgpt.ai/DomainSearch/?domain=vtai.com>
- <https://www.namecheap.com/domains/registration/results/?domain=vtai>
- <https://porkbun.com/checkout/search?prb=d41b158dc5&q=vtai.space>
- <https://namelix.com/app/?keywords=vtai>
- <https://domainr.com/?q=vtai>
- [] cookie consent

--

1. Monet: try <https://github.com/lingodotdev/lingo.dev>

--

1. <https://github.com/electron/electron>
