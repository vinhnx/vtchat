# TODO

--
ok go-> https://vtchat.io.vn/

--

remove semantic router features completely

@vtchat/web:dev: 🌟 Workflow context created with:
@vtchat/web:dev: 🚀 Executing task "semantic-tool-router" (Run #1)
@vtchat/web:dev: 🧠 Semantic router task started
@vtchat/web:dev: Starting semantic tool routing {
@vtchat/web:dev: questionLength: 5,
@vtchat/web:dev: userTier: 'PLUS',
@vtchat/web:dev: question: 'hello',
@vtchat/web:dev: hasChartAccess: true
@vtchat/web:dev: }
@vtchat/web:dev: Generated Gemini embedding { textLength: 477, embeddingLength: 768, model: 'text-embedding-004' }
@vtchat/web:dev: Generated Gemini embedding { textLength: 384, embeddingLength: 768, model: 'text-embedding-004' }
@vtchat/web:dev: Generated Gemini embedding { textLength: 455, embeddingLength: 768, model: 'text-embedding-004' }
@vtchat/web:dev: Generated Gemini embedding { textLength: 598, embeddingLength: 768, model: 'text-embedding-004' }
@vtchat/web:dev: Generated Gemini embedding { textLength: 5, embeddingLength: 768, model: 'text-embedding-004' }
@vtchat/web:dev: Generated Gemini embedding { textLength: 425, embeddingLength: 768, model: 'text-embedding-004' }
@vtchat/web:dev: Generated Gemini embedding { textLength: 407, embeddingLength: 768, model: 'text-embedding-004' }
@vtchat/web:dev: Tool embeddings initialized { cachedCount: 6 }
@vtchat/web:dev: Generated Gemini embedding { textLength: 407, embeddingLength: 768, model: 'text-embedding-004' }
@vtchat/web:dev: Semantic tool routing failed {
@vtchat/web:dev: error: TypeError: updater is not a function
@vtchat/web:dev: at TypedEventEmitter.update (../../packages/orchestrator/events.ts:50:25)
@vtchat/web:dev: at Object.execute (../../packages/ai/workflow/tasks/semantic-tool-router.ts:117:29)
@vtchat/web:dev: at async WorkflowEngine.executeTask (../../packages/orchestrator/engine.ts:171:22)
@vtchat/web:dev: at async WorkflowEngine.start (../../packages/orchestrator/engine.ts:84:8)
@vtchat/web:dev: at async executeStream (app/api/completion/stream-handlers.ts:152:8)
@vtchat/web:dev: at async Object.start (app/api/completion/route.ts:287:16)
@vtchat/web:dev: 48 | update<K extends keyof T>(event: K, updater: (current: T[K]) => T[K]) {
@vtchat/web:dev: 49 | const currentValue = this.state[event] as T[K];
@vtchat/web:dev: > 50 | const newValue = updater(currentValue);
@vtchat/web:dev: | ^
@vtchat/web:dev: 51 | this.emit(event, newValue);
@vtchat/web:dev: 52 | return this;
@vtchat/web:dev: 53 | },
@vtchat/web:dev: question: 'hello'
@vtchat/web:dev: }
--

https://xmcp.dev/docs

--

just disabe rag feature completedly

==

RLS embeddings RAG feature

--

disable semantic router in rag feature

--

replace /rag endpoint with /assistant endpoint

--

fix structure output tool, it should be able to detect if a document has been uploaded on chat input

--
check structure output. show "Upload a Document First" dialog even though the user has uploaded a document.
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
