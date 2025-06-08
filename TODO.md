# TODO List

--
[x] move footer (terms, condition) of /chat to side menu menu profile popup
[x] apps/web/app/chat/page.tsx update this page
[x] remove NEXT_PUBLIC_DEV_TEST_MODE and entire dev mode by pass
--

[] new pricing page use V7 -> <https://v0.dev/chat/vt-subscription-layout-CWqgkAmbme9>
--

[] revamp /plus layout and wording, don't hard code
--

[] check dev env creem.io webhook guide <https://docs.creem.io/learn/webhooks/introduction#2-register-your-development-webhook-endpoint>
--

--

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

[] remove plausible

[] remove langfuse

[] <https://www.better-auth.com/docs/plugins/2fa>

[] <https://www.better-auth.com/docs/plugins/username>

[] handle current free -> anonymous flow <https://www.better-auth.com/docs/plugins/anonymous>
[] use plunk for email provider <https://app.useplunk.com/>

--

1. remove /success page
1. remove /credits page -> use openCustomerPortal func
1. unify subscription experience make sure it work and sync to db and reflecting into the app
1. check isPlusSubscriber logic, make sure to check subscription status
can just use return url instead of web hook ?
<https://docs.creem.io/learn/checkout-session/return-url>

--

1. you can use better auth mcp
1. you can use Context7 MCP tools
2. you can use any mcp tools if stuck.
1. make sure to check for current environment.
   - If in development, use sandbox API keys and test customer IDs.
   - If in production, use live API keys and ensure proper customer management.

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
[] IMPORTANT
handle creemio subscription hook to sync to neon db and user session. connect with better auth if needed

this is the log on payment success

--

[] IMPORTANT MUST CHECK FOR EXISTING CREEM SUBSCRIPTION STATUS OTHERWISE DON'T LET USER SUBSCRIPT TOO MANY TIME IMPORTANT

--

[] <https://www.better-auth.com/docs/guides/optimizing-for-performance#database-optimizations>
[] optimize <https://www.better-auth.com/docs/guides/optimizing-for-performance>
[] email verify <https://www.better-auth.com/docs/authentication/email-password#email-verification>
[] build user profile <https://www.better-auth.com/docs/concepts/users-accounts>;;

[] on start next.js compile /chat by default to speed up

/better-auth-llmstxt

1. use 1 shared auth-client. remove the one from apps/web/lib.
1. move the auth-client.ts to apps/web/lib/
1. rename auth.ts to auth-server.ts

[] PLUS TIER ONLY? sync store user_subscriptions to neon db <https://console.neon.tech/app/projects/lucky-cake-27376292/branches/br-sparkling-glitter-a1wtucle/tables?database=vt_dev>
[] replace redis with <https://www.better-auth.com/docs/concepts/database#secondary-storage>
[] build error page
[] build welcome page
[] update better auth config on /error /welcome route <https://www.better-auth.com/docs/basic-usage#sign-in-with-social-providers>
[] ref pricing <https://chorus.sh/pricing>
[] user avatar better auth from oauth provider and sync neon db
[] handle account verify to protect bot? <https://www.better-auth.com/docs/concepts/email>
[] <https://ui.ibelick.com/>
[] <https://github.com/ibelick/prompt-kit>

implement full remote thread sync.
can you implement account-based thread managements system with neon and postgres using out existing thread schema and store logic. review #codebase for clues.

Note

1. make sure thread is per account.
1. you can use Neon MCP to make schema and db migration.
1. you can use Context7 MCP tools
2. you can use any mcp tools if stuck.
1. make sure to check for current environment.
   - If in development, use sandbox API keys and test customer IDs.
   - If in production, use live API keys and ensure proper customer management.

[] pricing page -> show current tier (including free) check tailwind v0 design
[] before sending message -> check credit store -> if avail -> send messgae -> otherwise show a toast alert.
[] remove langfuse
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
[] remove /success content page on payment success, just keep as loading and a redirect to homepage -> only show success message toast({
    title: 'Welcome to VT+! 🎉',
    description:
        'Your subscription is now active with monthly credits included.',
});
[] <https://tailwindcss.com/plus/ui-blocks/marketing/sections/pricing>
[] <https://tailwindcss.com/plus/ui-blocks/marketing/feedback/404-pages>
[] update side bar ui <https://ui.shadcn.com/blocks/sidebar#sidebar-09>

1. migrate `@repo/ui` to use shadcn's components/ui
2. cleanup old repo ui code to unify ui and cleanup
3. use context7 for shadcn components and migrate from package commonet components to use shadcn/tailwinds components instead
4. #fetch <https://ui.shadcn.com/docs/components/typography> and replace all current hardcode typography to use shadcn typo system

[] <https://patloeber.com/gemini-ai-sdk-cheatsheet/>
[] <https://www.youraiscroll.com/pricing>
[] show Free plan, current plan
[] replace @repo/ui with shadcn components
[] <https://docs.creem.io/sdk/nextjs-template> sample creem.io integration
[] <https://github.com/openai/openai-agents-js/tree/main/examples/ai-sdk>
[] support more providers <https://ai-sdk.dev/providers/ai-sdk-providers>
[] <https://www.better-auth-kit.com/docs/introduction>
[] <https://better-auth-ui.com/>

--
Subscription Management
--

plan/features

// Plan slug enumerations
export enum PlanSlug {
    VT_BASE = 'vt_base',
    VT_PLUS = 'vt_plus',
}

// Feature slug enumerations
export enum FeatureSlug {
    // Base Plan Features
    ACCESS_CHAT = 'access_chat',
    BASE_MODELS = 'base_models',

    // VT+ Plan Features
    DARK_THEME = 'dark_theme',
    DEEP_RESEARCH = 'deep_research',
    PRO_SEARCH = 'pro_search',
    ADVANCED_CHAT_MODES = 'advanced_chat_modes',
}

1. Implement the subscription logic using Creem.io SDK, ensuring that the subscription status is checked and updated correctly.
1. sync subscription to neon with user id
1. when user purchase -> make sure subscription logic and storage updated -> review #codebase and update from previous subscription logic. migrate from zustand storage and schema if needed
1. update tier plan in Settings > Usage Credits -> show badge user-tier-badge component instead of "FREE" currently
1. activated gated dark_theme feature for the user and handle subscription for this benefit according.
1. Base on subscription tier -> update handle "View Plans" button on side bar with logic -> if subscribed -> show user's creem.io subscription portal (Search from docs on how to implement) -> if not -> show "View Plans" as of now. Guide <https://docs.creem.io/learn/customers/customer-portal>. example <https://www.creem.io/test/my-orders/JDJhJDE1JHhTMzUvcU1nRFJhYnV3anVhSFVpTmU>

Note

1. you can use Context7 MCP tools
2. you can use any mcp tools if stuck.
1. make sure to check for current environment.
   - If in development, use sandbox API keys and test customer IDs.
   - If in production, use live API keys and ensure proper customer management.

- <https://supersaas.dev/blog/how-to-launch-your-side-project>

[] remove unrelated depedencies from our main stack

- use free models default
- check for commented out todo items in codebase "/*"
- view terms.ts file
- review model lists
- review model token policy CHAT_MODE_CREDIT_COSTS
- credits system
- tracing?
- build terms page <https://llmchat.co/terms>
- build privacy page <https://llmchat.co/privacy>
- build landing page
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
- [] Handle usage quota -> prompt to purchase more tokens
- [] cookie consent
