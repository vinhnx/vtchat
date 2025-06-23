# TODO


--
combine RAG into main agent flow?cumentation.

--

--> check Claude for inspiration on how to implement RAG knowledge base
https://claude.ai/settings/profile

1. put this in settings VT+ section
# Section RAG knowledge base
What should ChatGPT call you? {name} -> rag
What best describes your work? {about me} -> rag
-> also note a note about privacy, this data is not shared with any third party and only used to improve your experience with VTChat.

1. add a option to clear RAG knowledge base
1. add a option to view RAG knowledge base
1. this feature is only available for VT+ users
update these information to RAG knowledge base
--

--
@vtchat/web:dev: Database connection removed from pool
@vtchat/web:dev:  ○ Compiling /api/chat/rag ...
@vtchat/web:dev:  ✓ Compiled /api/chat/rag in 1776ms
@vtchat/web:dev: Query: insert into "resources" ("id", "user_id", "content", "created_at", "updated_at") values ($1, $2, $3, default, default) returning "id", "user_id", "content", "created_at", "updated_at" -- params: ["83e540d8-4d61-401c-acdd-7f6a54cf3c5c", "dc60d50d-9aac-47e7-8cb1-ce9000d28208", "My favorite food is pizza"]
@vtchat/web:dev: Database connection established
@vtchat/web:dev: Error creating resource: Error: OpenAI API key is required for OpenAI embeddings. Please add it in Settings → API Keys.
@vtchat/web:dev:     at generateEmbeddings (lib/ai/embedding.ts:96:18)
@vtchat/web:dev:     at createResource (lib/actions/resources.ts:41:58)
@vtchat/web:dev:   94 |         const openaiApiKey = apiKeys.OPENAI_API_KEY;
@vtchat/web:dev:   95 |         if (!openaiApiKey) {
@vtchat/web:dev: > 96 |             throw new Error('OpenAI API key is required for OpenAI embeddings. Please add it in Settings → API Keys.');
@vtchat/web:dev:      |                  ^
@vtchat/web:dev:   97 |         }
@vtchat/web:dev:   98 |
@vtchat/web:dev:   99 |         const modelConfig = EMBEDDING_MODEL_CONFIG[embeddingModel];
@vtchat/web:dev: Query: insert into "resources" ("id", "user_id", "content", "created_at", "updated_at") values ($1, $2, $3, default, default) returning "id", "user_id", "content", "created_at", "updated_at" -- params: ["6a155c5e-29fb-421f-ae2c-771ce0727e71", "dc60d50d-9aac-47e7-8cb1-ce9000d28208", "My favorite food is pizza"]
@vtchat/web:dev: Error creating resource: Error: OpenAI API key is required for OpenAI embeddings. Please add it in Settings → API Keys.
@vtchat/web:dev:     at generateEmbeddings (lib/ai/embedding.ts:96:18)
@vtchat/web:dev:     at createResource (lib/actions/resources.ts:41:58)
@vtchat/web:dev:   94 |         const openaiApiKey = apiKeys.OPENAI_API_KEY;
@vtchat/web:dev:   95 |         if (!openaiApiKey) {
@vtchat/web:dev: > 96 |             throw new Error('OpenAI API key is required for OpenAI embeddings. Please add it in Settings → API Keys.');
@vtchat/web:dev:      |                  ^
@vtchat/web:dev:   97 |         }
@vtchat/web:dev:   98 |
@vtchat/web:dev:   99 |         const modelConfig = EMBEDDING_MODEL_CONFIG[embeddingModel];
@vtchat/web:dev:  POST /api/chat/rag 200 in 6088ms
@vtchat/web:dev:  POST /api/chat/rag 200 in 2074ms
@vtchat/web:dev:  ○ Compiling /_not-found/page ...
@vtchat/web:dev:  GET /rag 200 in 644ms
@vtchat/web:dev:  ✓ Compiled /_not-found/page in 4.7s
@vtchat/web:dev:  GET /installHook.js.map 404 in 5238ms
@vtchat/web:dev: Database connection removed from pool

--

there seem to be inconsistent of retrieval model and embedding and apikey flow.
also, please make gemini embedding and models are default
--

sometime get auth and subscription failed

 Console Error

Error: Subscription fetch timeout (5s)

Call Stack 1
SubscriptionProvider.useCallback[fetchSubscriptionStatus]
file:/Users/vinh.nguyenxuan/Developer/learn-by-doing/vtchat/apps/web/.next/static/chunks/packages_common_d6e0c1dd._.js (2310:39)

--

https://next-safe-action.dev/
--
https://fluid.tw/#installation
--

## https://react-scan.com/

## https://requestindexing.com/

## https://og.new/

## https://unlighthouse.dev/

## https://million.dev/docs

https://page-speed.dev

--
https://github.com/e2b-dev/fragments

--
--

https://fly.io/docs/apps/going-to-production/
https://claude.ai/chat/524e3244-6d68-4f2a-9a74-4a4c281aba99
migrate from railway to fly.io
-> free if use under 5$ a month

--

https://ai-sdk.dev/cookbook/next/chat-with-pdf

--

railway: https://docs.railway.com/reference/production-readiness-checklist

--

<https://docs.creem.io/faq/account-reviews>

==

[]
remember to publish Google Auth
<https://console.cloud.google.com/auth/audience?authuser=6&inv=1&invt=Ab0LuQ&project=psyched-span-463012-h5>

--
[] Reddit marketing cheat codes every startup founder should know: <https://x.natiakourdadze/status/1933939677016228177>

--

[][monet] RAG <https://ai-sdk.dev/docs/guides/rag-chatbot>

--

<https://ai-sdk.dev/cookbook/node/web-search-agent#building-a-web-search-tool>

--

## Future

- [ ] Free tier: Continue using local IndexedDB for threads.
- [ ] [PLUS TIER ONLY] Implement full remote thread synchronization with Neon DB.
- [ ] [PLUS TIER ONLY] Sync threads to Neon DB.

--

- [ ] Electron: [https://github.com/electron/electron](https://github.com/electron/electron)

--

Domain:

-> vtchat.io.vn

- [ ] Domain Name Research (vtai.io.vn, vtchat.io.vn) - _Consider moving detailed notes to a separate research document._
    - Whois VN: [https://whois.inet.vn/whois?domain=vtchat.io.vn](https://whois.inet.vn/whois?domain=vtchat.io.vn)
    - VinaHost: [https://secure.vinahost.vn/ac/cart.php?a=confdomains](https://secure.vinahost.vn/ac/cart.php?a=confdomains)
    - <https://www.matbao.net/ten-mien/ket-qua-kiem-tra-ten-mien.html?tenmien=vtchat.io.vn#top_search>

--

[] grand final showcase <https://github.com/vercel/ai/discussions/1914>

--

Before final production deployment, ensure all environment variables are set correctly for production, including API keys, database URLs, and any other sensitive information.

- [ ] Finalize production environment configuration:
- [ ] Ensure all environment variables are set correctly for production, including API keys, database URLs, and any other sensitive information.
- [ ] Test the production deployment thoroughly to ensure all features work as expected.
- [ ] Set up monitoring and logging for the production environment to catch any issues early
- [ ] Document the production deployment process for future reference.
- [ ] Create a final checklist for production deployment, including:
    - [ ] Environment variable verification
    - [ ] Database connection checks
    - [ ] API key validation
    - [ ] Feature testing
    - [ ] Monitoring setup
- [ ] Review and finalize the production deployment documentation, ensuring it is clear and comprehensive for future deployments.
- [ ] Conduct a final review of the codebase to ensure all changes are committed and pushed to the main branch.
- [ ] Prepare a final release note summarizing the changes, features, and fixes included in the production deployment.
- [ ] Schedule a final deployment date and time, ensuring all team members are aware and available for any last-minute issues that may arise.

--

Write a final report and update readme, documentation, and any other relevant materials to reflect the current state of the project.

--

Good luck!
