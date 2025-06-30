# TODO

ok go! -> https://vtchat.io.vn/


move menu and avatar icon on mobile to top. currently it overlap chat input

--

increase
thread padding. currenltly narrow

--

remove Intelligent document search in rag onboarding

--

fix footer on mobile

--
final discuss fly.io config for budget and scale with Claude
# Production fly.toml
app = 'vtchat'
primary_region = 'sin'

[build]

[env]
  NODE_ENV = 'production'
  BASE_URL = 'https://vtchat.io.vn'
  BETTER_AUTH_URL = 'https://vtchat.io.vn'
  NEXT_PUBLIC_BASE_URL = 'https://vtchat.io.vn'
  NEXT_PUBLIC_APP_URL = 'https://vtchat.io.vn'
  NEXT_PUBLIC_COMMON_URL = 'https://vtchat.io.vn'
  NEXT_PUBLIC_BETTER_AUTH_URL = 'https://vtchat.io.vn'
  CREEM_ENVIRONMENT = 'production'
  BETTER_AUTH_ENV = 'production'

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = 'suspend'
  auto_start_machines = true
  min_machines_running = 0
  processes = ['app']

[[http_service.checks]]
  grace_period = "15s"
  interval = "30s"
  method = "GET"
  timeout = "10s"
  path = "/api/health"

[[http_service.checks]]
  type = "tcp"
  grace_period = "5s"
  interval = "15s"
  timeout = "2s"

[[vm]]
  memory = '1gb'
  cpu_kind = 'shared'
  cpus = 2
--
revamp login page
--

give Tuan Anh 1 month free discount

-

https://github.com/e2b-dev/fragments

--
biome
https://biomejs.dev/guides/getting-started/

--

https://ai-sdk.dev/docs/advanced/rendering-ui-with-language-models

==
https://ai-sdk.dev/docs/advanced/multiple-streamables
--
https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-tool-usage
--
https://ai-sdk.dev/docs/ai-sdk-core/prompt-engineering
--
https://ai-sdk.dev/docs/ai-sdk-core/testing

==
improve openai response api support
https://ai-sdk.dev/docs/guides/openai-responses

--
improve Claude 4 support
https://ai-sdk.dev/docs/guides/claude-4
--

--
launch discount promo code?

--

https://github.com/vercel/mcp-adapter

--
IMPORTANT verify creem.io LIVE payment
good luck!
https://www.creem.io/checkout/prod_1UZhx15bSgbT8ggWTPQNi/ch_4oVL59zbacFQaBIGrGBgug

--

localization

--

https://docs.creem.io/faq/account-reviews

--

Marketting plan
"better to launch waitlist + DMs first, then do researches, before building and launching

I like the idea of SEO with ChatGPT blogs though"

+ https://www.producthunt.com/
+ https://peerlist.io/
+ https://uneed.best/
+ https://microlaunch.net/


grand final -> show hn, good luck!

-> discuss with Claude.
-> ask for tagline

--
Introducing VT Chat

https://vtchat.io.vn/ – The privacy-first AI chat platform.

• Secure, thread-isolated AI chat (OpenAI, Anthropic, Google & more)
• Local storage, BYOK, per-account isolation
• Free & VT+ (Deep Research, Pro Search, multi-modal, RAG, charts)
• Auth: Email/Password, OTP, oAuth (Better Auth)
• DB: Neon Postgres + Drizzle ORM
• Payments: Creem.io

Launch promo: Use code **VTLAUNCH** for a discount on VT+!
--
Product Launch Introduction / Marketing Pitch

Introducing VT Chat – the privacy-first AI chat platform designed for individuals and professionals who demand both power and privacy. VT Chat delivers secure, thread-isolated conversations with leading AI providers (OpenAI, Anthropic, Google, and more), all while keeping your data local and protected. Enjoy a robust free tier, or upgrade to VT+ for unlimited access to advanced features like Deep Research, Pro Search, multi-modal chat, Personal AI Assistant with Memory (RAG), and interactive chart generation. With BYOK (Bring Your Own Key) support and per-account isolation, VT Chat is the trusted choice for research, document analysis, and productivity—without compromising your privacy.

--

Tweet for Launch

🚀 Introducing VT Chat: The privacy-first AI chat platform!

• Secure, thread-isolated AI chat (OpenAI, Anthropic, Google & more)
• Local storage, BYOK, per-account isolation
• Free & VT+ (Deep Research, Pro Search, multi-modal, RAG, charts)
• Framework: Next.js 15.3.3, Bun, Tailwind CSS, Radix UI, Shadcn UI
• SDK: @vercel/ai
• Auth: Email/Password, OTP, oAuth (Better Auth)
• DB: Neon Postgres + Drizzle ORM
• Payments: Creem.io

Try it now 👉 https://vtchat.io.vn/

Limited promo: Use code **VTLAUNCH** for a discount on VT+!

--
Hacker News Show HN Launch Intro

Show HN: VT Chat – A Privacy-First, Multi-Provider AI Chat Platform

I'm excited to launch VT Chat, a production-ready AI chat application focused on privacy and user control. VT Chat supports multiple AI providers (OpenAI, Anthropic, Google, and more), with all conversations stored locally in your browser—never on our servers. Features include per-account thread isolation, BYOK (Bring Your Own Key) for API keys, and a robust free tier. VT+ subscribers unlock Deep Research, Pro Search, multi-modal chat, Personal AI Assistant with Memory (RAG), and interactive chart generation. Ideal for anyone needing secure, reliable AI for research, document analysis, and productivity.

Feedback welcome!

--

gen new launch image https://og.new/

ref https://x.com/fayazara/status/1820354290487083232
Launch day

https://supersaas.dev/ - A comprehensive Nuxt 3 saas starter kit.

Auth - Email/Password, OTP, Passkey, oAuth
DB - Turso, NuxtHub, Postgres
Email - Resend, Sendgrid, Postmark, Plunk
File storage - S3, R2, Local files
Payments - Stripe & Lemonsqueezy
--
Fayaz Ahmed
@fayazara
·
Aug 5, 2024
Launching it on PH as well - Support appreciated - https://producthunt.com/posts/supersaas-1
--

https://x.com/i/communities/1493446837214187523

--

https://oss.now/early-submission

--

[] grand final showcase <https://github.com/vercel/ai/discussions/1914>

--

Write a final readme, documentation, and any other relevant materials to reflect the current state of the project.

--

Future plan
+ Adding username/password login option https://www.better-auth.com/docs/plugins/username
+ forgot password
+ update profile
+ verify email
+ otp email
+ magic link
+ https://supermemory.ai/docs/memory-api/overview
+ mcp

--

Good luck!
