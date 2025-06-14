# TODO List

[] Customer portal:

or calling:
const redirectUrl = await axios.post(
  `https://{host}/v1/customers/billing`,
    {
      "customer_id": "cust_xxxxxxx",
    },
    {
      headers: { "x-api-key": `creem_123456789` },
    },
);

NOTE:

1. where {host} is: make sure `https://test-api.creem.io/v1/customers/billing` is for creem.io sandbox and `https://api.creem.io/v1/customers/billin` is production
1. `customer_id` value in request body is the current `creem_customer_id` or `stripe_customer_id` id in `user_subscriptions` table from neon postgresql db
1. `x-api-key` in headers is get from `CREEM_API_KEY` in .env file
1. handle `manage subscription` logic in packages/common/hooks/use-payment-subscription.ts -> fetch above api and handle url response -> open that api to view

--
check db

1. creem_customer_id in users table
1. stripe_customer_id, stripe_subscription_id in user_subscriptions table -> rename colum to remove `strip_` -> replace with `creem_`
1. unify creem_customer_id in users table and newly renamed creem_customer_id, creem_subscription_id in user_subscriptions table
1. update apps/web/lib/database/schema.ts and apps/web/migration_better_auth.sql, do migration
1. you can use drizzle orm, context7, neon, better-auth, creem.io MCP tools to make db schema and migration on db
--

1. wow! <https://tailark.com/>

--

1. now review #codebase and draft a plan, make sure subscription logic works across the app from payment -> subscription store -> db call on neon db sync -> sync app plan instantly and
1. should call on app start or page refresh: /api/subscription/status should be call once and update to db, only refresh after payment callback or sub expired, Or every page refresh
1. IMPORTANT: make sure to handle this logic per account and check non-login
1. check for GatedFeatureAlert entrypoint calling #codebase and check sub status
1. unify subscription logic and use one unidufy sub use in #editFiles and
1. update schema and migration if  needed
note: you can use context7, neon, better-auth, creem.io MCP tools
--

1. migrate useVtPlusAccess and use useSubscriptionStatus
1. make sure unify subscription logic as once and remove redundant logic make sure sync with neon db and web hook from creem.io payment call back
1. you can use context7, neon, better-auth, creem.io MCP tools

--

1. optimize /api/subscription/status should be call once and update to db, only refresh after payment callback or sub expired
1. IMPORTANT: make sure to handle this logic per account and check non-login
you can use MCP tools like neon context7 creem.io
--

1. rename Usage Credits in settings modal to `Plan` -> also update card components on Usage Credits settings modal to HoverCard components with dark/light mode proper typography and color. better UI on the Plan tab

--

1. on routing to creem.io page to make payment and redirect back to app -> show a loading spinner

--

Subscription Management
--

### VT+ subscription product description brief specs

name: VT+
product id: prod_1XIVxekQ92QfjjOqbDVQk6 (use env: CREEM_PRODUCT_ID key instead. don't hardcode value)
description: For everyday productivity
Payment Details:

* type: supbscription
* pricing: 9.99 USD
* subscription inverval: monthly
* price includes tax
Product Features:
1 Pro Search
a. description: "Pro Search: Enhanced search with web integration for real-time information."

2. Dark Mode:
a. description: "Access to dark mode."
3. Deep Research
a. description:: "Deep Research: Comprehensive analysis of complex topics with in-depth exploration."

Plan

1. Implement the subscription logic using Creem.io SDK, ensuring that the subscription status is checked and updated correctly.
1. sync subscription to neon with user id
1. when user purchase -> make sure subscription logic and storage updated -> review #codebase and update from previous subscription logic. migrate from zustand storage and schema if needed
1. update tier plan in Settings > Usage Credits -> show badge user-tier-badge component instead of "FREE" currently
1. activated gated dark_theme feature for the user and handle subscription for this benefit according.
1. Base on subscription tier -> update handle "View Plans" button on side bar with logic -> if subscribed -> show user's creem.io subscription portal (Search from docs on how to implement) -> if not -> show "View Plans" as of now. Guide <https://docs.creem.io/learn/customers/customer-portal>. example <https://www.creem.io/test/my-orders/JDJhJDE1JHhTMzUvcU1nRFJhYnV3anVhSFVpTmU>
1. check dev env creem.io webhook guide <https://docs.creem.io/learn/webhooks/introduction#2-register-your-development-webhook-endpoint>
1. pricing page -> show current tier (including free) check mark on card /plus page

Note

1. you can use Context7 MCP tools
1. you can use Neon MCP tools
2. you can use any mcp tools if stuck.
1. make sure to check for current environment.
   * If in development, use sandbox API keys and test customer IDs.
   * If in production, use live API keys and ensure proper customer management.
--
Dev Payment Webhook log and config

--
please note that the web hook on dev is
webhookUrl: <https://0f4c-42-118-189-41.ngrok-free.app//api/webhook/creem>
--

--

subscription.active

Response
HTTP status code404

--
Webhooks
Verify Webhook Requests

How to verify Creem signature on webhook objects.
​
How to verify Creem signature?

Creem signature is sent in the creem-signature header of the webhook request. The signature is generated using the HMAC-SHA256 algorithm with the webhook secret as the key, and the request payload as the message.
Copy

{
'creem-signature': 'dd7bdd2cf1f6bac6e171c6c508c157b7cd3cc1fd196394277fb59ba0bdd9b87b'
}

To verify the signature, you need to generate the signature using the same algorithm and compare it with the signature sent in the header. If the two signatures match, the request is authentic.

You can find your webhook secret on the Developers>Webhook page.

To generate the signature, you can use the following code snippet:
Copy

import * as crypto from 'crypto';

  generateSignature(payload: string, secret: string): string {
    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    return computedSignature;
  }

In the code snippet above, the payload is the request body, and the secret is the webhook secret. Simply compare the generated Signature with the one received on the header to complete the verification process.

--

1. on click subscribe in VT plus page , the app is asking for subscribe even though user has susribe. fix this.
1. check vt_plus on plan_slug row of the users table and user_subscriptions table on neon and update local sub store and logic
--
[] <https://github.com/zpg6/better-auth-cloudflare>
--

[] check package.json and remove redundant dependencies and unused deps
[] check package.json to review icons lib use -> unify

--

# IMPORTANT

### VT+ subscription product description brief specs

name: VT+
product id: prod_1XIVxekQ92QfjjOqbDVQk6 (use env: CREEM_PRODUCT_ID key instead. don't hardcode value)
description: For everyday productivity
Payment Details:

* type: supbscription
* pricing: 9.99 USD
* subscription inverval: monthly
* price includes tax
Product Features:
1 Pro Search
a. description: "Pro Search: Enhanced search with web integration for real-time information."

2. Dark Mode:
a. description: "Access to dark mode."
3. Deep Research
a. description:: "Deep Research: Comprehensive analysis of complex topics with in-depth exploration."

--

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

[] pricing page -> show current tier (including free) check mark on card /plus page
[] before sending message in input bar -> check credit store -> if avail -> send messgae -> otherwise show a toast alert.
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

* <https://supersaas.dev/blog/how-to-launch-your-side-project>

[] remove unrelated depedencies from our main stack -> use [knip](https://knip.dev/)

* review and unify icon package usage in #codebase. review package.json and use 1 package (lucide-react) for icons.
* buy domain name -> .io.vn (gov sponsor)
* vtai.io.vn
* vtchat.io.vn
<https://whois.inet.vn/whois?domain=vtchat.io.vn>
* <https://vnnic.vn/whois-information>
* <https://viettelidc.com.vn/Domain/SearchAutomationDomain?keyword=vtchat.io.vn>
* good <https://secure.vinahost.vn/ac/cart.php?a=confdomains>
* <https://www.domainsgpt.ai/DomainSearch/?domain=vtai.com>
* <https://www.namecheap.com/domains/registration/results/?domain=vtai>
* <https://porkbun.com/checkout/search?prb=d41b158dc5&q=vtai.space>
* <https://namelix.com/app/?keywords=vtai>
* <https://domainr.com/?q=vtai>
* [] cookie consent

--

1. Monet: try <https://github.com/lingodotdev/lingo.dev>

--

1. <https://github.com/electron/electron>
