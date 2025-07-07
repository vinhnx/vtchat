# TODO

--
ok go-> https://vtchat.io.vn/

--

what is /api/auth/fetch-options/method/to-upper-case api, and why it keep showing 404 error in the console?

--
-
🚨 CRITICAL: Implement PII masking before external API calls (embeddings & chat)
-
🚨 CRITICAL: Encrypt resources.content at rest or store masked copy only
-
🚨 CRITICAL: Add deterministic post-response PII filtering
-
🔒 Enable Postgres RLS for resources and embeddings tables
-
🔒 Implement PII-safe logging with automatic redaction
-
📋 Update deletion flows to include logs, backups, and provider retention
-
📋 Document GDPR compliance (DPA/SCC with providers, consent UI)

--

rag failed on production
15:20:32.364
Object { plan: "anonymous" }
 [Plus Defaults] Initial setup for plan vendors-b9f70e77-6089d804bc8e296f.js:11:11757
15:20:32.384
Object { context: "ChatStore", workerId: "0.o5srjj21shs" }
 Connected to SharedWorker vendors-b9f70e77-6089d804bc8e296f.js:11:11757
15:20:32.424
Object { previousUserId: "anonymous", currentUserId: "117c0269-51a1-4cc6-813e-cca1eb2667bc" }
 [ThreadAuth] User changed vendors-b9f70e77-6089d804bc8e296f.js:11:11757
15:20:32.424
Object { isAnonymous: false }
 [ThreadDB] Switching to database for user vendors-b9f70e77-6089d804bc8e296f.js:11:11757
15:20:32.424
Object { context: "ThreadDB", isAnonymous: false }
 Initialized database for user vendors-b9f70e77-6089d804bc8e296f.js:11:11757
15:20:32.429
Object { context: "ThreadDB", userId: "117c0269-51a1-4cc6-813e-cca1eb2667bc", configKey: "chat-config-117c0269-51a1-4cc6-813e-cca1eb2667bc" }
 Persisted config for user vendors-b9f70e77-6089d804bc8e296f.js:11:11757
15:20:32.429
Object { context: "ThreadDB", threadsCount: 27 }
 Successfully switched to user database vendors-b9f70e77-6089d804bc8e296f.js:11:11757
15:20:32.440
Object { userId: "117c0269-51a1-4cc6-813e-cca1eb2667bc" }
 [ThreadAuth] Successfully switched to database for user vendors-b9f70e77-6089d804bc8e296f.js:11:11757
15:20:32.503
Object { previousPlan: "anonymous", currentPlan: "vt_plus" }
 [Plus Defaults] Plan changed vendors-b9f70e77-6089d804bc8e296f.js:11:11757
15:20:32.600
Object { status: 500, statusText: "", errorText: '{"error":"Failed to fetch knowledge base"}' }
 Failed to fetch knowledge base <anonymous code>:1:145535
15:20:32.600
Object { error: Error, errorMessage: '{"error":"Failed to fetch knowledge base"}', errorType: "object" }
 showErrorToast called <anonymous code>:1:145535
15:20:32.600
Object { message: '{"error":"failed to fetch knowledge base"}', originalError: Error }
 Processing error message for toast vendors-b9f70e77-6089d804bc8e296f.js:11:11757
15:20:32.600
Object {  }
 Toast error shown successfully vendors-b9f70e77-6089d804bc8e296f.js:11:11757
15:20:33.252
Object { toolCount: 6 }
 Initializing tool embeddings at startup vendors-b9f70e77-6089d804bc8e296f.js:11:11757
15:20:33.252 GEMINI_API_KEY missing – semantic router disabled 6 vendors-b9f70e77-6089d804bc8e296f.js:11:11757
15:20:33.252
Object { cachedCount: 6 }
 Tool embeddings initialized vendors-b9f70e77-6089d804bc8e296f.js:11:11757
15:20:45.941
Object { error: Error, errorKeys: [], errorProto: Error.prototype }
 RAG Chat Error in onError handler <anonymous code>:1:145535
15:20:45.942
Object { error: Error, errorMessage: "An error occurred.", errorType: "object" }
 showErrorToast called <anonymous code>:1:145535
15:20:45.942
Object { message: "an error occurred.", originalError: Error }
 Processing error message for toast vendors-b9f70e77-6089d804bc8e296f.js:11:11757
15:20:45.942
Object {  }
 Toast error shown successfully vendors-b9f70e77-6089d804bc8e296f.js:11:11757
15:20:46.045
Object {  }
 Showing error toast with delay fallback vendors-b9f70e77-6089d804bc8e296f.js:11:11757
15:20:46.045
Object { error: Error, errorMessage: "An error occurred.", errorType: "object" }
 showErrorToast called <anonymous code>:1:145535
15:20:46.045
Object { message: "an error occurred.", originalError: Error }
 Processing error message for toast vendors-b9f70e77-6089d804bc8e296f.js:11:11757
15:20:46.045
Object {  }
 Toast error shown successfully vendors-b9f70e77-6089d804bc8e296f.js:11:11757

--

replace /rag endpoint with /assistant endpoint

--

fix structure output tool, it should be able to detect if a document has been uploaded on chat input

--
check structure output. show "Upload a Document First" dialog even though the user has uploaded a document.

--
improve markdown rendering for chat thread with better typography and faster loading and more performance

support for more markdown features like tables, footnotes, etc.

support llm renderings

--

## local models Connecting local models via Ollama and LM Studio

https://ai-sdk.dev/providers/community-providers/ollama

for RAG -> can't keep all data in the local db -> don't sync to remove DB to fully support local-first architecture.
ask oracle for review feedback then implement
use context7 or neon mcp tool to get the latest documentation and guides.

--
rethink Plus tier offering -> maybe remove BYOK.

--

user feedbacks:
kindly check, not giving reasonable answers

a) try to use api of chat models
b) dall-e and spon-video model of gpt
--
https://dotenvx.com/docs/platforms/fly
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
- local models Connecting local models via Ollama and LM Studio

--

Good luck!
