# TODO

--
ok go! -> https://vtchat.io.vn/


--

should mask user email on users DB? use neon mcp and better-auth to handle user data privacy

--

now Add this to your coding workflow AGENT.md: before implement every task, make sure you should ask the Oracle for details plan first. then review the feedback and start to implement your answer. then ask Oracle for view feedback again when done then apply changes if needed, reiterate until oracle approve.

--

Show HN: Built a Local-First AI Research Platform with Advanced RAG

I've built VT Chat, a privacy-first AI platform that keeps all your conversations local while providing advanced research capabilities and access to 15+ AI models including Claude 4, GPT-4.1, and O3.

Live demo: https://vtchat.io.vn | Source: https://github.com/vinhnx/vtchat | Peerlist: https://peerlist.io/vinhnx/project/vt (#68 ranking, 12 upvotes)

Advanced capabilities:
- Deep Research: AI conducts comprehensive multi-step research with source verification
- Pro Search: Real-time web search integration with intelligent result synthesis
- AI Memory (RAG): Personal knowledge base that learns from your conversations
- Document processing: Upload PDFs/docs for AI analysis (free for all users)
- "Thinking mode": See complete AI reasoning process with full token transparency
- Structured extraction: Turn documents into JSON with AI (free feature)

Privacy-first architecture:
- True local-first: All chats stored in IndexedDB, zero server storage
- Multi-provider switching: Compare responses across OpenAI, Anthropic, Google, etc.
- Per-user isolation: Safe for shared machines with complete data separation
- Your API keys never leave your browser—even I can't see them as the developer

Technical highlights:
- Fully open source: Self-host with your own API keys (BYOK)
- Turborepo monorepo with 87% faster builds via Turbopack
- Next.js 14 App Router + TypeScript + Tailwind
- Comprehensive testing with zero TypeScript errors
- Production-ready on Fly.io with 2-region deployment

The platform is completely open source for self-hosting. For the hosted version, most features are free with optional VT+ for premium models and advanced research features.

Happy to discuss the research workflow architecture, local-first design, or any other technical details!
--


--

https://ai-sdk.dev/providers/ai-sdk-providers/groq

## https://console.groq.com/docs/ai-sdk -> offer free

tailwind v4

--

https://github.com/e2b-dev/fragments

    --

# https://ai-sdk.dev/docs/advanced/rendering-ui-with-language-models

## https://ai-sdk.dev/docs/advanced/multiple-streamables

## https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-tool-usage

## https://ai-sdk.dev/docs/ai-sdk-core/prompt-engineering

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
- https://supermemory.ai/docs/memory-api/overview
- mcp
- localization

--

Good luck!
