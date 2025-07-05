# TODO

--
ok go-> https://vtchat.io.vn/

--
22:44:11.512 Cannot update a component (`ChatInput`) while rendering a different component (`Thread`). To locate the bad setState() call inside `Thread`, follow the stack trace as described in https://react.dev/link/setstate-in-render Stack:
    scheduleUpdateOnFiber react-dom-client.development.js:14486
    forceStoreRerender react-dom-client.development.js:7264
    [project]/node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js [app-client] (ecmascript)/subscribeToStore/< react-dom-client.development.js:7249
    [project]/packages/common/node_modules/zustand/esm/vanilla.mjs [app-client] (ecmascript)/createStoreImpl/setState/< vanilla.mjs:9
    setState vanilla.mjs:9
    [project]/packages/common/node_modules/zustand/esm/middleware/immer.mjs [app-client] (ecmascript)/immerImpl/</store.setState immer.mjs:6
    getPreviousThreadItems chat.store.ts:1651
    previousThreadItems thread-combo.tsx:11
    [project]/packages/common/node_modules/zustand/esm/react/shallow.mjs [app-client] (ecmascript)/useShallow/< shallow.mjs:44
    memoizedSelector with-selector.development.js:47
    [project]/node_modules/use-sync-external-store/cjs/use-sync-external-store-shim/with-selector.development.js [app-client] (ecmascript)/exports.useSyncExternalStoreWithSelector/instRef</< with-selector.development.js:71
    mountSyncExternalStore react-dom-client.development.js:7129
    useSyncExternalStore react-dom-client.development.js:23316
    [project]/node_modules/next/dist/compiled/react/cjs/react.development.js [app-client] (ecmascript)/exports.useSyncExternalStore React
    [project]/node_modules/use-sync-external-store/cjs/use-sync-external-store-shim/with-selector.development.js [app-client] (ecmascript)/exports.useSyncExternalStoreWithSelector with-selector.development.js:82
    useStore index.mjs:18
    useBoundStore index.mjs:34
    Thread thread-combo.tsx:11
    HomePage page.tsx:32
    ClientPageRoot client-page.tsx:60
intercept-console-error.ts:40:26

-

tap on "No API key configured" field on each BYOK field should allow to edit the field.
--

https://startupfa.me/dashboard/vt-chat/promote

help me Add a badge on your home page and get featured on Startup Fame for free.

More visibility for your startup
10+ « Do-follow » links to your website
« Featured » badge
Dedicated page for your startup
Unlimited startup edits

in homepage footer make sure this requirement is met
"To complete verification, please add a badge to your website, https://vtchat.io.vn, with a standard link (without the ‘nofollow’ attribute)."

--

for RAG -> keep the local db -> don't sync to remove DB to fully support local-first architecture.
ask oracle for review feedback then implement
use context7 or neon mcp tool to get the latest documentation and guides.

--
Thinking Mode should be enable by default for VT+ tier users.

--

setup your API keys modal in RAG page is not fit on mobile screen, need to fix it
--
make sure this fit the smart semantic routing logic. but also make sure when user explicit activate any tools button in chat input. it should work as expected -> ask oracle
--

IMPORTANT remove required VT+ tier for advanced models (claude 4, GPT-4.1, O3, gemini 2.5 pro, etc.) check model slugs and plan slugs to all model barriers are removed. Only VT+ Deep Research, Pro Search, RAG (Personal AI Assistant). update gated features logic and documentations and tiers UI accordingly.

ask oracle for for plan first and then start implementing on that plan. iterate until oracle approves the changes.

--
1. setup your API keys modal in RAG page is not fit on mobile screen,
2. fix usage settings tab not showing on mobile screen, need to fix it
--
rethink Plus tier offering -> maybe remove BYOK.

--

when a tools is invoked using smart semantic routing feature, it should be able to select the best tool BUTTON in chat input bar for the user based on the query.
for example:

"Calculate 2+2" -> Math tool button enabled and selected

"Search latest Hacker News" -> Web Search button enabled and selected

"Create a line chart sales data: A 100, B 150, C 120, D 200" -> Charts button enabled and selected

--

user feedbacks:
kindly check, not giving reasonable answers

a) try to use api of chat models

## b) dall-e and spon-video model of gpt

## https://dotenvx.com/docs/platforms/fly

https://contentsignals.org/

# NOTICE: The collection of content and other data on this

# site through automated means, including any device, tool,

# or process designed to data mine or scrape content, is

# prohibited except (1) as provided by the below Content

# Usage directives or (2) with express written permission

# from VT.

# The Content Usage directives in this file use syntax and

# vocabulary from a proposed IETF standard drafted by the AI

# Preferences (aipref) working group and have the meanings

# set forth in that standard. To learn more, please see

# https://contentsignals.org/.

# To request permission to license our intellectual property

# and/or other materials, please contact us at

# hello@vtchat.io.vn.

User-Agent: \*
Content-Usage: tdm=n, search=y
Allow: /
--
think and create new visual tools if neeed
--

try to find a way to do semantics tool router -> auto select the best tool for the user based on the query
https://claude.ai/chat/937e24c6-06b6-4525-8974-d427b3e8561a

--

ask the Oracle for review feedback.

--

Show HN: Built a Local-First AI Research Platform with Advanced RAG
I've built VT Chat, a privacy-first AI platform that keeps all your conversations local while providing advanced research capabilities and access to 15+ AI models including Claude 4, GPT-4.1, and O3.

Live: https://vtchat.io.vn | Source: https://github.com/vinhnx/vtchat

The core difference is true local-first architecture. All chats are stored in IndexedDB with zero server storage. Your API keys never leave your browser, and I can't see them even as the developer. You can switch between OpenAI, Anthropic, Google and other providers to compare responses, with complete data isolation for shared machines.

I've added some research features that I actually use daily: Deep Research does multi-step research with source verification, Pro Search integrates real-time web search, and AI Memory creates a personal knowledge base from your conversations. There's also document processing for PDFs, a "thinking mode" to see complete AI reasoning, and structured extraction to turn documents into JSON. AI-powered semantic routing automatically activates tools based on your queries, available free for all users.

Built with Next.js 14, TypeScript, and Turborepo in a monorepo setup. Everything is fully open source for self-hosting with your own API keys. The hosted version keeps most features free, with optional VT+ for premium models and advanced research capabilities.

## Happy to discuss the local-first design decisions or research workflow architecture.

--

--

https://github.com/e2b-dev/fragments

--

https://ai-sdk.dev/docs/advanced/rendering-ui-with-language-models

https://ai-sdk.dev/cookbook/rsc/stream-updates-to-visual-interfaces

--

## https://ai-sdk.dev/docs/advanced/multiple-streamables

## https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-tool-usage

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

--

Good luck!
