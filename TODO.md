# TODO

--
ok go-> https://vtchat.io.vn/

--

https://xmcp.dev/docs

--
https://github.com/idosal/mcp-ui
--


✅ enable gemini web search check for VT+ users. automatically use gemini api key in env for VT+ users.

✅ Fix VT+ users web search not working - FIXED: Updated generateObject and generateText functions to handle VT+ users without BYOK

✅ Fix all tools (web search, math calculator, charts) to work for VT+ users without BYOK - FIXED: Updated all workflow tasks to pass userTier parameter

✅ Fix VT+ users tools only working with gemini_2_5_flash_lite but not other Gemini models - FIXED: Updated chat-mode-router to only route Pro mode to gemini-web-search when web search is enabled, allowing math/charts tools to work

✅ Fix VT+ users web search not working with ALL Gemini models - FIXED: Updated agent-provider to route all Gemini models for VT+ users to server-side API instead of worker, ensuring consistent behavior across all Gemini models (includes Deep Research, Pro Search, 2.5 Pro, 2.5 Flash, 2.5 Flash Lite, 2.0 Flash, 2.0 Flash Lite, and all preview versions)

--

✅ API Key Required modal still shown when click send chat button even though routing to chat details still work - FIXED: VT+ users now bypass all BYOK checks for Gemini models and tools

--
VTLAUNCH

add promo code for plus page 20% off limited time, limited supply in VT+

--

~~extract this isPremiumMode logic in chatmodebutton to common for reuse later~~ ✅ COMPLETED

--


~~make sure VT+ user won't ever be shown "API Key Required" dialog BYOKValidationDialog in every route~~ ✅ COMPLETED
~~->. currently when vt+ user selected pro search and deep research mode from chat options selection dropdown, it will show "API Key Required" dialog, this is not correct, vt+ user should not be shown this dialog at all.~~ ✅ COMPLETED

--

packages/ai/workflow/tasks/structured-extraction.ts

update add more file type like txt, md, csv ...

--> use default model for structured extraction -> gemini 2.5 Flash Lite

--

update plus tier benefits include GEMINI access for VT+ users without needing to set up BYOK. -> update plus page, VT+ settings and plan/benefits tier config.

--

remove GEMINI BYOK requirements for /RAG feature.

--

remove {/_ BYOK Setup Modal _/} for gemini api keys for VT+
{pendingMode && (
<BYOKSetupModal
        isOpen={byokModalOpen}
        modelName={pendingMode.modelName}
        onApiKeySaved={handleBYOKSaved}
        onClose={handleBYOKClose}
        requiredApiKey={pendingMode.requiredApiKey}
    />
)}

--

--
overall, VT+ users should have unlimited access to Gemini models without needing to set up GEMINI API BYOK specially, check for plus tiers benefits and unlock all of them and update the logic accordingly.

--

also offer VT+ users access to Deep Research and Pro Search and RAG without needing to set up BYOK.
oracle: please plan this change

--

--

Based on the Oracle's approval of Phase 1, here are the immediate next steps:

Phase 2 - Code Quality & Oracle Feedback (Priority: High)

Centralize feature flag logic - Create utility function for NEXT_PUBLIC_VT_PLUS_GEMINI_UNLIMITED checks
Implement VT+ rate limiting - Define specific limits based on $300/3-month budget
Add geminiUsageSource to user preferences - Store user's preferred GEMINI API source
Phase 3 - Component Refactoring (Priority: Medium) 4. Refactor RateLimitUsageMeter for better reusability 5. Use object parameters for functions with multiple boolean parameters 6. Create comprehensive UI tests for settings and chat dropdown

Should I start with the Oracle's high-priority feedback items (centralizing feature flags and implementing VT+ rate limiting)?

--

- Centralize feature flag logic - create utility function for NEXT_PUBLIC_VT_PLUS_GEMINI_UNLIMITED checks
- Refactor RateLimitUsageMeter component for better reusability
- Use object parameters for functions with multiple boolean parameters
- Create GeminiBudgetManager service with usage accounting and cost tracking
- Implement per-user soft/hard limits for VT+ unlimited (500/1000 req/day)
- Add global budget governor with Redis counters (70%/85%/95% thresholds)
- Implement dynamic throttling and circuit breakers
- Add monitoring, alerting, and admin override controls
- Add geminiUsageSource to user preferences store for API source management
- Create comprehensive UI tests for settings page and chat dropdown

The Oracle recommends a layered defense-in-depth approach to protect your $300 budget:

🎯 Key Strategy: Multi-tier Protection

Per-user limits: 500 req/day soft → 1000 req/day hard (maintains "unlimited" feeling)
Global budget governor: 70% warning → 85% critical → 95% emergency shutdown
Dynamic throttling: Progressive delays instead of hard blocks
Circuit breakers: Instant kill switches with admin override
📊 Budget Math: $240 usable (80% safety) = ~115K calls over 90 days = ~1,300 calls/day globally

🚀 Implementation Phases:

Phase 0: Create GeminiBudgetManager service with usage tracking
Phase 1: Implement soft/hard per-user limits
Phase 2: Add global budget governor with Redis counters
Phase 3: Dynamic throttling + emergency controls
Should I start implementing the GeminiBudgetManager service first?

## --

Based on my research, here's my analysis and proposed rate limiting plan for VT+ users:

📊 Gemini API Analysis
Current Free Tier Limits (what users get now):
Gemini 2.5 Flash Lite: 15 RPM, 1,000 RPD
Gemini 2.5 Flash: 10 RPM, 250 RPD
Gemini 2.5 Pro: 5 RPM, 100 RPD
Paid Tier 1 Limits (Google's paid customers):
Gemini 2.5 Flash Lite: 4,000 RPM, unlimited RPD
Gemini 2.5 Flash: 1,000 RPM, 10,000 RPD
Gemini 2.5 Pro: 150 RPM, 1,000 RPD
Cost Analysis:
Gemini 2.5 Flash Lite: $0.10 input / $0.40 output per 1M tokens
Gemini 2.5 Flash: $0.30 input / $2.50 output per 1M tokens
Gemini 2.5 Pro: $1.25-2.50 input / $10-15 output per 1M tokens
🎯 Proposed VT+ Rate Limits
To balance generous access while preventing API key exhaustion, I propose:

VT+ "Unlimited" Gemini Limits:
Model Daily Limit Per-Minute Limit Rationale
Gemini 2.5 Flash Lite 500 requests/day 25 requests/min 50% of free tier daily, but higher burst capacity
Gemini 2.5 Flash 400 requests/day 20 requests/min 60% more than current free tier
Gemini 2.5 Pro 200 requests/day 10 requests/min 2x current free tier
Benefits:
✅ Generous daily allowance - 2-5x current free tier
✅ Higher burst capacity - Better user experience for intensive sessions
✅ Cost protection - Prevents runaway API costs (estimated $50-200/day max per user)
✅ Still "unlimited" feel - Most users won't hit these limits in normal usage

Implementation Plan:
Create VT+ specific rate limiting in existing rate limit service
Add budget monitoring to track daily API costs per user
Graceful degradation - When VT+ limits hit, fall back to free tier limits instead of blocking
Admin controls - Dashboard to monitor usage and adjust limits
User transparency - Show VT+ limits in Usage & Limits settings
Estimated Daily Costs:
Conservative user (50 requests): $1-5/day
Heavy user (500 requests): $10-50/day
Maximum possible: $50-200/day per user
🤔 Questions for Approval:
Are these daily limits acceptable for VT+ users? (500/400/200 for Lite/Flash/Pro)
Should we implement budget caps (e.g., $100/day per user) as additional protection?
How should we handle limit exceeded scenarios - block requests or fallback to free tier?
Do you want monitoring/alerts when users approach these limits?
Would you like me to proceed with implementing this rate limiting system?

--

--

https://nextjs.org/docs/app/guides/redirecting#2-optimizing-data-lookup-performance

--

https://nextjs.org/docs/app/guides/redirecting#2-optimizing-data-lookup-performance

--

https://nextjs.org/docs/app/guides/progressive-web-apps

--

https://nextjs.org/docs/app/guides/progressive-web-apps#6-adding-to-home-screen

--

https://nextjs.org/docs/app/guides/mdx

--

1. to prevent users even vt+ plus, from unlimited usages to quickly exhausted one gemini_api_key oracle. suggest implement a rate limit per day but not too strict for plus tiers users when using gemini models. search for gemini model pricing and limit. use mcp if needed. ask me for plan for approval first before executing
2. make constants, don't use strings

const unlimitedAccessType = hasGeminiApiKey
? 'byok'
: isVtPlusUnlimitedAvailable
? 'vt_plus_unlimited'
: isVtPlus
? 'vt_plus_enhanced'
: null;

3. ## oracle full review

1. revamp rate limit: Summary: VT+ Plus tier can use unlimited GEMINI Models

VT+ Plus tier can use unlimited GEMINI Models, using GEMINI_API_KEY, no need to setup BYOK for GEMINI_API_KEY for VT+ users

(no restrict PLUS_DAY, PLUS_MINUTE) on every request.

export const GEMINI_FLASH_LIMITS = {
FREE_DAY: 20,
FREE_MINUTE: 5,
PLUS_DAY: 100,
PLUS_MINUTE: 10,
} as const;

2. Update plus tier benefits
3. Update tier slugs config
4. Update model configs
5. Update /about, /terms, /privacy, /plus pages about this changes
6. Update benefits icons on model dropdown on chat input

-> oracle please review and draft a plan for this change

7. update subscription store, subscription logic and logic gated for this change
8. check if need to do any migration db
9. use mcp if needed

-> ask for oracle review and iterate until approved

--

https://xmcp.dev/docs

--

just disabe rag feature completedly

==

RLS embeddings RAG feature

## --

replace /rag endpoint with /assistant endpoint

--

fix structure output tool, it should be able to detect if a document has been uploaded on chat input

--
check structure output. show "Upload a Document First" dialog even though the user has uploaded a document.
--

replace attach images and pdf button to use image lucid icons

--

rethink Plus tier offering -> maybe remove BYOK.

--

https://ai-sdk.dev/docs/advanced/multiple-streamables

--

https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-tool-usage

--
10:28:52.624 GET
https://lh3.googleusercontent.com/ogw/AF2bZyhtwE-BhhWqE_Izb8Hctb7RLZJka37DQbjLaqPKGCBioKM=s32-c-mo
NS_BINDING_ABORTED

--

https://ai-sdk.dev/docs/ai-sdk-core/testing

==
v5 improve openai response api support
https://ai-sdk.dev/docs/guides/openai-responses

--
[check ai sdk compatible ver] improve Anthropic support
https://ai-sdk.dev/providers/ai-sdk-providers/anthropic

## --

Future plan

- improve openai response api support https://ai-sdk.dev/docs/guides/openai-responses
- improve Anthropic support https://ai-sdk.dev/providers/ai-sdk-providers/anthropic
- [done] improve Claude 4 support https://ai-sdk.dev/docs/guides/claude-4
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
