# TODO

--
ok go-> https://vtchat.io.vn/

--

increase chat thread markdown font size to more comfortable size, min 13px
--

rethink Plus tier offering -> maybe remove BYOK.

--
IMPORTANT: fix payment call back fall
ON PRODUCTION CREEM.IO -> CURRENTLY IT USE LOCALHOST REDIRECT. PLEASE HELP TO CHECK ENV AND CREEM SUBSCRITPION FLOW AND LOGIC TO MAKE SURE IT USE PRODUCTION URL: https://vtchat.io.vn FOR PAYMENT CALL BACK. ASK ORACLE FOR REVIEW AND FIX ASAP.

THIS ONE FIX IT ASAP:
```
return CreemService.createCheckout({
    productId: CreemService.PRODUCT_ID || '', // Use the actual Creem product ID, not our internal ID
    customerEmail,
    successUrl: `${typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/success?plan=${PlanSlug.VT_PLUS}`, // Used PlanSlug
});
```
packages/shared/utils/payment-service.ts

CHECK OTHER HARDCODED URL PATH LIKE THIS AND FIX IT ASAP.

http://localhost:3000/success?plan=vt_plus&checkout_id=ch_78yU0Et6VoIPsVsN7gWiQE&order_id=ord_2sSQ3ZBrfwGkjwKAesVniU&customer_id=cust_1TFvfGvNMr1dsS0hy4ZwLj&subscription_id=sub_s4BJap8T8Y28OzJUrgmY2&product_id=prod_1UZhx15bSgbT8ggWTPQNi&signature=24dde2ce32aa45487b1e267cd0c3d07744ea69c20d97e51ce73de3305f9a95a6


USE CONTEXT7, FLYMCP OR ANY MCP TOOLS IF NEEDED

DEPLOY TO  fly.io USING ./deploy-fly.sh  when done
--
update Connected Accounts
with X/Twitter oauth

check better-auth document and implement it like Google and Github

use context7, neon mcp if needed

-> check twitter_link_account git stash

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

b) dall-e and spon-video model of gpt
--
https://dotenvx.com/docs/platforms/fly
--
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

User-Agent: *
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

Happy to discuss the local-first design decisions or research workflow architecture.
--


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
