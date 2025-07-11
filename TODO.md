# TODO

--
ok go-> https://vtchat.io.vn/


--

DRY on these code block

"// Determine VT+ feature based on mode"

--

make sure every subscription check in the codebase use 1 single unidifed logic in packages/shared/utils/access-control.ts

==

impotant fix pro search web search agent tool auto trigger

make sure pro search activate "native web search" tool by default. update the prompt to proactive use tool call.

for example -> i ask "what is the current weather in Tri Ton, An Giang" -> should use web search tool. user don't need to manually click "Native Web Search" button on chat input


--

add/update loading indicator thread chat when waiting for api/completion response

add timeout tracking, if more than a few second show indicator

--

https://tailwindcss.com/docs/upgrade-guide

--
https://nextjs.org/docs/app/guides/upgrading/version-15
--
check
June 2025 - radix-ui

We've added a new command to migrate to the new radix-ui package. This command will replace all @radix-ui/react-* imports with radix-ui.

bunx --bun shadcn@latest migrate radix

It will automatically update all imports in your ui components and install radix-ui as a dependency.
components/ui/alert-dialog.tsx

- import * as AlertDialogPrimitive from "@radix-ui/react-dialog"
+ import { AlertDialog as AlertDialogPrimitive } from "radix-ui"

Make sure to test your components and project after running the command.

Note: To update imports for newly added components, run the migration command again.

--

add new Deep Research, Pro search, Rag usage chart in Usage Overview, use data from rate limit and usage limit logic and db

--

use this chart reesponsive template for new chart and existing chart. make sure response on mobile

import React, { PureComponent } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
{
name: 'Page A',
uv: 4000,
pv: 2400,
amt: 2400,
},
{
name: 'Page B',
uv: 3000,
pv: 1398,
amt: 2210,
},
{
name: 'Page C',
uv: 2000,
pv: 9800,
amt: 2290,
},
{
name: 'Page D',
uv: 2780,
pv: 3908,
amt: 2000,
},
{
name: 'Page E',
uv: 1890,
pv: 4800,
amt: 2181,
},
{
name: 'Page F',
uv: 2390,
pv: 3800,
amt: 2500,
},
{
name: 'Page G',
uv: 3490,
pv: 4300,
amt: 2100,
},
];

export default class Example extends PureComponent {

render() {
return (
<div style={{ width: '100%', height: 300 }}>
<ResponsiveContainer>
<AreaChart
data={data}
margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }} >
<CartesianGrid strokeDasharray="3 3" />
<XAxis dataKey="name" />
<YAxis />
<Tooltip />
<Area type="monotone" dataKey="uv" stroke="#8884d8" fill="#8884d8" />
</AreaChart>
</ResponsiveContainer>
</div>
);
}
}

--

what is the current weather in Tri Ton, An Giang
Grounding Web Search
1 Step
I'm sorry, but I cannot provide real-time weather updates. My capabilities do not include accessing live, up-to-the-minute weather information.

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

https://xmcp.dev/docs

--

rethink Plus tier offering -> maybe remove BYOK.

vinhnguyenxuan-ct: base on the current state of project can you help me
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
https://ai-sdk.dev/docs/advanced/multiple-streamables

--

https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-tool-usage

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
