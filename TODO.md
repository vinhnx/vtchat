# TODO

--

ok go-> https://vtchat.io.vn/


--

critical
fix deploy fly.io use flymcp to debug

                                                                0.4s
 => ERROR [builder 5/5] RUN cd apps/web &&     echo "=== BUILD ENVIRONMENT DEBUG ===" &&     echo "BASE_U  40.7s
------
 > [builder 5/5] RUN cd apps/web &&     echo "=== BUILD ENVIRONMENT DEBUG ===" &&     echo "BASE_URL: " &&     echo "NEXT_PUBLIC_BASE_URL: " &&     echo "CREEM_ENVIRONMENT: " &&     echo "DATABASE_URL: [PLACEHOLDER - actual value set at runtime]" &&     echo "NODE_ENV will be automatically set by Next.js build process" &&     echo "NEXT_PHASE: phase-production-build" &&     echo "==============================" &&     bun run build:
0.101 === BUILD ENVIRONMENT DEBUG ===
0.101 BASE_URL:
0.101 NEXT_PUBLIC_BASE_URL:
0.101 CREEM_ENVIRONMENT:
0.101 DATABASE_URL: [PLACEHOLDER - actual value set at runtime]
0.101 NODE_ENV will be automatically set by Next.js build process
0.101 NEXT_PHASE: phase-production-build
0.101 ==============================
0.115 $ next build
1.278 Attention: Next.js now collects completely anonymous telemetry regarding usage.
1.278 This information is used to shape Next.js' roadmap and prioritize features.
1.278 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
1.278 https://nextjs.org/telemetry
1.278
1.378    ▲ Next.js 15.3.5
1.379    - Environments: .env.local, .env.production
1.379    - Experiments (use with caution):
1.379      ⨯ serverMinification
1.379
1.503    Creating an optimized production build ...
40.16 Failed to compile.
40.16
40.16 ../../packages/ui/src/components/accordion.tsx
40.16 Module not found: Can't resolve 'radix-ui'
40.16
40.16 https://nextjs.org/docs/messages/module-not-found
40.16
40.16 ../../packages/ui/src/components/alert-dialog.tsx
40.16 Module not found: Can't resolve 'radix-ui'
40.16
40.16 https://nextjs.org/docs/messages/module-not-found
40.16
40.16 ../../packages/ui/src/components/breadcrumb.tsx
40.16 Module not found: Can't resolve 'radix-ui'
40.16
40.16 https://nextjs.org/docs/messages/module-not-found
40.16
40.16 Import trace for requested module:
40.16 ../../packages/ui/src/components/index.ts
40.16 ../../packages/ui/src/index.ts
40.16 ../../packages/ui/index.ts
40.16 ./components/offline-indicator.tsx
40.16
40.16 ../../packages/ui/src/components/button-premium.tsx
40.16 Module not found: Can't resolve 'radix-ui'
40.16
40.16 https://nextjs.org/docs/messages/module-not-found
40.16
40.16 Import trace for requested module:
40.16 ../../packages/ui/src/components/index.ts
40.16 ../../packages/ui/src/index.ts
40.16 ../../packages/ui/index.ts
40.16 ./components/offline-indicator.tsx
40.16
40.16 ../../packages/ui/src/components/button.tsx
40.16 Module not found: Can't resolve 'radix-ui'
40.16
40.16 https://nextjs.org/docs/messages/module-not-found
40.16
40.16 Import trace for requested module:
40.16 ../../packages/ui/src/components/alert-dialog.tsx
40.16
40.16
40.16 > Build failed because of webpack errors
40.35 error: script "build" exited with code 1
------
Error: failed to fetch an image or build from source: error building: failed to solve: process "/bin/sh -c cd apps/web &&     echo \"=== BUILD ENVIRONMENT DEBUG ===\" &&     echo \"BASE_URL: $BASE_URL\" &&     echo \"NEXT_PUBLIC_BASE_URL: $NEXT_PUBLIC_BASE_URL\" &&     echo \"CREEM_ENVIRONMENT: $CREEM_ENVIRONMENT\" &&     echo \"DATABASE_URL: [PLACEHOLDER - actual value set at runtime]\" &&     echo \"NODE_ENV will be automatically set by Next.js build process\" &&     echo \"NEXT_PHASE: $NEXT_PHASE\" &&     echo \"==============================\" &&     bun run build" did not complete successfully: exit code: 1
[ERROR] Deployment failed with exit code 1
--
limit deep research to 5 queries/day for VT+ users
limit pro research to 10 queries/day for VT+ users
--


https://www.better-auth.com/docs/plugins/mcp
--
https://github.com/vercel/mcp-adapter

--

https://tailwindcss.com/docs/upgrade-guide

--
https://nextjs.org/docs/app/guides/upgrading/version-15
--

--

I only set VT+ tier as 5.99 usd what should i do

--

https://github.com/MiguelsPizza/WebMCP


--

https://xmcp.dev/docs

--
https://github.com/idosal/mcp-ui

--

--

rethink Plus tier offering -> maybe remove BYOK.

base on the current state of project can you help me
rethink Plus tier offering

Workspace: Collecting workspace informationOf course. Based on the current state of the project, the free tier is very generous, offering access to all premium AI models via "Bring Your Own Key" (BYOK) and including many advanced features. The VT+ tier's value is concentrated in three exclusive research features: `PRO_SEARCH`, `DEEP_RESEARCH`, and `RAG`.

Your note in TODO.md to "rethink Plus tier offering -> maybe remove BYOK" is a key insight. Here is a strategic proposal to create a stronger value proposition for the VT+ tier.

### Proposed New Tier Structure

The goal is to make the upgrade to VT+ more compelling by gating the most powerful capabilities, specifically access to top-tier AI models.

#### 1. Redefined **Free Tier (VT_BASE)**

This tier would be focused on providing a high-quality experience with a curated set of models, encouraging users to upgrade for full power.

- **AI Models**:
    - Continue to provide the 9 free server-funded models (Gemini and OpenRouter).
    - **Remove BYOK access for premium models** like Claude 4, GPT-4.1, etc. This is the most critical change.
- **Features**:
    - Keep core features: Document Processing, Chart Visualization, Mathematical Calculator, Dark Mode.
    - Consider making **Thinking Mode** a VT+ exclusive feature again to add more value to the premium tier, as documented in thinking-mode-vt-plus-restriction.md.

#### 2. Strengthened **VT+ Tier**

This tier becomes the clear choice for professionals and power users who need access to the best models and advanced research tools.

- **AI Models**:
    - **Re-introduce BYOK for all premium AI models** (Claude 4, GPT-4.1, O3, etc.) as an exclusive VT+ benefit.
    - Offer higher rate limits or unlimited access to the server-funded models.
- **Exclusive Features**:
    - Keep the three core research features: `PRO_SEARCH`, `DEEP_RESEARCH`, and `RAG`.
    - Add **Thinking Mode** as an exclusive feature.
    - Future advanced features like voice integration, team collaboration, or advanced analytics (from your PROJECT-STATUS.md roadmap) would be added here.

### Strategic Impact

- **Clear Upgrade Path**: Creates a powerful and obvious reason for users to subscribe: to unlock the full potential of the platform with their own keys for premium models.
- **Stronger Value Proposition**: The value of VT+ is no longer just three features, but foundational access to the entire ecosystem of advanced AI models.
- **Competitive Alignment**: This model is more aligned with industry standards where access to top-tier models is a primary driver for premium subscriptions.

This change would require updating configuration files (like chat-mode.ts), documentation, and the pricing page (pricing.ts) to reflect the new feature distribution.

vinhnguyenxuan-ct: i don't have much budget, almost use free tier saas, fly and neon . i have 300 usd google cloud credit for use in 3 months

GitHub Copilot: Thank you for sharing your budget constraints. That's a critical factor. With a limited budget and a temporary $300 Google Cloud credit, the strategy needs to prioritize minimizing operational costs for the free tier while creating a sustainable path to revenue.

My previous suggestion was based on a common SaaS model but might lead to high costs from server-funded models on the free tier. Given your situation, here is a revised, more budget-conscious strategy.

### The "Lean Free Tier" Strategy

The goal is to offload the primary cost—AI model usage—to the user via "Bring Your Own Key" (BYOK), making your free tier sustainable while making the platform's unique features the reason to upgrade.

#### 1. Redefined **Free Tier (VT_BASE)** - Sustainable & Generous

Keep the free tier highly functional but low-cost to operate.

- **AI Models**:
    - **Keep BYOK for all models.** This is the most important change. Let free users access the entire range of models (including premium ones like GPT-4.1, Claude 4, etc.) with their own API keys. This makes your platform a valuable tool without incurring API costs for you.
    - **Limit Server-Funded Models**: Use your Google Cloud credit strategically. Instead of 9 models, offer only 1-2 of the most cost-effective server-funded models (e.g., Gemini 1.5 Flash). This provides a taste of the platform's capabilities without high burn rates. When the credit runs out, you can decide whether to continue this offering based on VT+ revenue.

- **Features**:
    - Keep the core platform features: Document Processing, Chart Visualization, Dark Mode, etc.

#### 2. Strengthened **VT+ Tier** - The "Power-User" Upgrade

The value of VT+ becomes access to your proprietary, high-value, server-intensive features.

- **Exclusive Features**: This is the core of the paid offering.
    - **`PRO_SEARCH`**, **`DEEP_RESEARCH`**, and **`RAG`**: These are powerful, unique research tools that justify a subscription.
    - **`Thinking Mode`**: As discussed, making this a VT+ exclusive adds another compelling reason to upgrade.
    - **Future Power Features**: All new, advanced features from your roadmap (team collaboration, advanced analytics, etc.) would be exclusive to VT+.

- **Rate Limits**: Offer significantly higher (or unlimited) usage for any server-side actions, including the limited free models you provide.

### Strategic Impact & Next Steps

- **Sustainability**: This model makes your free tier financially sustainable long-term, as the main operational cost (model usage) is borne by the users. Your costs are limited to hosting (Fly.io, Neon) which are manageable on free/hobby tiers.
- **Clear Value**: The upgrade path is clear. Users pay for _your unique features and power-user tools_, not just to unlock models they could access elsewhere.
- **Strategic Use of Credits**: Your $300 Google Cloud credit becomes a marketing and user acquisition tool for a limited time, not a core operational dependency.

This approach aligns your business model with your budget, reduces financial risk, and builds a solid foundation for sustainable growth.

--

https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-tool-usage


--

enhance playwright auth script
https://playwright.dev/docs/auth#introduction

allow then when seeing /login, click through google oauth and use the first account to sign in

--

https://playwright.dev/docs/best-practices
--

v5 improve openai response api support
https://ai-sdk.dev/docs/guides/openai-responses

--

Future plan

- improve openai response api support https://ai-sdk.dev/docs/guides/openai-responses
- improve Anthropic support https://ai-sdk.dev/providers/ai-sdk-providers/anthropic
- Adding username/password login option https://www.better-auth.com/docs/plugins/username
- forgot password
- update profile
- verify email
- otp email
- magic link
- mcp
- localization
- local models Connecting local models via Ollama and LM Studio

--

Good luck!
