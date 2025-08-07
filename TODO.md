# TODO

--

ok go-> https://vtchat.io.vn/

---

Research and rename "VT" to better and memorable name

--

https://openai.com/index/introducing-gpt-oss/

add openai/gpt-oss models

--

check production screem payment failed

subscription.paid
Response
HTTP status code500

{"error":"Internal server error","message":"No transactions support in neon-http driver"}

Request

{
"id": "evt_jRwvSN6mpKiimNW7dNfg7",
"eventType": "subscription.paid",
"created_at": 1754488691295,
"object": {
"id": "sub_s4BJap8T8Y28OzJUrgmY2",
"object": "subscription",
"product": {
"id": "prod_1UZhx15bSgbT8ggWTPQNi",
"object": "product",
"name": "VT+",
"description": "For everyday productivity.",
"image_url": "https://nucn5fajkcc6sgrd.public.blob.vercel-storage.com/bg_vt-mLMQcY0CsXN4guZPe4AokObcK1Kilq.png",
"price": 1000,
"currency": "USD",
"billing_type": "recurring",
"billing_period": "every-month",
"status": "active",
"tax_mode": "exclusive",
"tax_category": "saas",
"default_success_url": null,
"created_at": "2025-06-15T12:55:44.971Z",
"updated_at": "2025-06-15T12:55:44.971Z",
"mode": "prod"
},
"customer": {
"id": "cust_1TFvfGvNMr1dsS0hy4ZwLj",
"object": "customer",
"email": "vinhnguyen2308@gmail.com",
"name": "Vinh Nguyen",
"country": "VN",
"created_at": "2025-07-05T12:53:29.795Z",
"updated_at": "2025-07-05T12:53:29.795Z",
"mode": "prod"
},
"items": [
{
"object": "subscription_item",
"id": "sitem_3kj8ot0xt1fsJyp4LRqH0N",
"product_id": "prod_1UZhx15bSgbT8ggWTPQNi",
"price_id": "pprice_7FqYmexPg9NZHSGtyEGwSi",
"units": 1,
"created_at": "2025-07-05T12:53:39.929Z",
"updated_at": "2025-07-05T12:53:39.929Z",
"mode": "prod"
}
],
"collection_method": "charge_automatically",
"status": "active",
"last_transaction_id": "tran_46bSAcdS8OwvXW1TgukX9x",
"last_transaction": {
"id": "tran_46bSAcdS8OwvXW1TgukX9x",
"object": "transaction",
"amount": 599,
"amount_paid": 0,
"currency": "USD",
"type": "invoice",
"tax_country": "VN",
"tax_amount": 0,
"discount_amount": 599,
"status": "paid",
"refunded_amount": null,
"order": "ord_2sSQ3ZBrfwGkjwKAesVniU",
"subscription": "sub_s4BJap8T8Y28OzJUrgmY2",
"customer": null,
"description": "Subscription payment",
"period_start": 1754484817000,
"period_end": 1757163217000,
"created_at": 1754484874979,
"mode": "prod"
},
"last_transaction_date": "2025-08-06T12:53:37.000Z",
"next_transaction_date": "2025-09-06T12:53:37.000Z",
"current_period_start_date": "2025-08-06T12:53:37.000Z",
"current_period_end_date": "2025-09-06T12:53:37.000Z",
"canceled_at": null,
"created_at": "2025-07-05T12:53:39.889Z",
"updated_at": "2025-07-06T12:54:42.638Z",
"metadata": {
"source": "vtchat-app",
"packageId": "vt_plus",
"timestamp": "2025-07-05T12:51:00.444Z",
"successUrl": "http://localhost:3000/success?plan=vt_plus",
"isSubscription": "true"
},
"mode": "prod"
}
}

--

11:03:15.386 Chat store initialization completed 5652-33abe25d401137ac.js:1:5629
11:03:15.419 [Plus Defaults] Initial setup for plan
Object { plan: "anonymous" }
5652-33abe25d401137ac.js:1:5715
11:03:15.430 Connected to SharedWorker
Object { context: "ChatStore", workerId: "0.vmxcobd3r" }
5652-33abe25d401137ac.js:1:5715
11:03:15.535 [ThreadAuth] User changed
Object { previousUserId: "anonymous", currentUserId: "117c0269-51a1-4cc6-813e-cca1eb2667bc" }
5652-33abe25d401137ac.js:1:5715
11:03:15.535 [ThreadDB] Switching to database for user
Object { isAnonymous: false }
5652-33abe25d401137ac.js:1:5715
11:03:15.535 Initialized database for user
Object { context: "ThreadDB", isAnonymous: false }
5652-33abe25d401137ac.js:1:5715
11:03:15.547 Referrer Policy: Ignoring the less restricted referrer policy “origin-when-cross-origin” for the cross-site request: https://avatars.githubusercontent.com/u/1097578?v=4&_d=2025-08-07 1097578
11:03:15.561 Persisted config for user
Object { context: "ThreadDB", userId: "117c0269-51a1-4cc6-813e-cca1eb2667bc" }
5652-33abe25d401137ac.js:1:5715
11:03:15.561 Successfully switched to user database
Object { context: "ThreadDB", threadsCount: 17 }
5652-33abe25d401137ac.js:1:5715
11:03:15.567 [ThreadAuth] Successfully switched to database for user
Object { userId: "117c0269-51a1-4cc6-813e-cca1eb2667bc" }
5652-33abe25d401137ac.js:1:5715
11:03:15.831 [Plus Defaults] Plan changed
Object { previousPlan: "anonymous", currentPlan: "vt_plus" }
5652-33abe25d401137ac.js:1:5715
11:03:37.311 🆕 Creating new thread
Object { optimisticId: "d8Midv4ZYI" }
5652-33abe25d401137ac.js:1:5715
11:03:37.317 📝 Creating optimistic thread item
Object { optimisticUserThreadItem: {…} }
5652-33abe25d401137ac.js:1:5715
11:03:37.320 ✅ Verified optimistic thread item and thread state
Object { verifyItem: true, itemId: "ckEQZjWutG", totalItemsForThread: 1, threadExists: true }
5652-33abe25d401137ac.js:1:5715
11:03:37.320 🚀 Navigating to thread page
Object { optimisticId: "d8Midv4ZYI" }
5652-33abe25d401137ac.js:1:5715
11:03:37.321 threadItems
Object { data: [] }
5652-33abe25d401137ac.js:1:5715
11:03:37.321 🚀 Sending to handleSubmit with flags
Object { useWebSearch: false, useMathCalculator: false, useCharts: false }
5652-33abe25d401137ac.js:1:5715
11:03:37.321 Agent provider received flags
Object { useWebSearch: false, useMathCalculator: false, useCharts: false }
5652-33abe25d401137ac.js:1:5715
11:03:37.644 🎯 API routing decision
Object { mode: "gpt-oss-120b", isFreeModel: false, hasVtPlusAccess: false, needsServerSide: false, shouldUseServerSideAPI: false, hasApiKey: true, deepResearch: false, proSearch: false }
5652-33abe25d401137ac.js:1:5715
11:03:37.644 📱 Using client-side workflow path
Object { mode: "gpt-oss-120b" }
5652-33abe25d401137ac.js:1:5715
11:03:37.644 About to call startWorkflow
Object { useWebSearch: false, useMathCalculator: false, useCharts: false }
5652-33abe25d401137ac.js:1:5715
11:03:37.644 🚀 Starting workflow with API keys
Object { mode: "gpt-oss-120b", apiKeysConfigured: true }
5652-33abe25d401137ac.js:1:5715
11:03:37.645 Worker API keys configured
Object { mode: "gpt-oss-120b", apiKeySetupCompleted: true }
1359.d03216b20b253168.js:1:2042
11:03:37.645 🔥 runWorkflow called with params:
Object { webSearch: false, mathCalculator: false, charts: false }
1359.d03216b20b253168.js:1:2049
11:03:37.645 🌟 Workflow context created with:
Object { webSearch: false, mathCalculator: false, charts: false }
1359.d03216b20b253168.js:1:2049
11:03:37.646 🚀 Executing task "router" (Run #1) 1359.d03216b20b253168.js:1:1956
11:03:37.647 🚀 Executing task "completion" (Run #1) 1359.d03216b20b253168.js:1:1956
11:03:37.648 🔧 Final tools for AI
Object { data: "none" }
1359.d03216b20b253168.js:1:2042
11:03:37.648 generateText called
Object { model: "openai/gpt-oss-120b", hasAnthropicKey: false, anthropicKeyLength: undefined, mode: "gpt-oss-120b", userTier: "FREE" }
1359.d03216b20b253168.js:1:2042
11:03:37.648 🤖 generateText called
Object { model: "openai/gpt-oss-120b", hasAnthropicKey: false, anthropicKeyLength: undefined, mode: "gpt-oss-120b", userTier: "FREE" }
1359.d03216b20b253168.js:1:2042
11:03:37.649 === getLanguageModel START === 1359.d03216b20b253168.js:1:1956
11:03:37.649 Parameters:
Object { modelEnum: "openai/gpt-oss-120b", hasMiddleware: false, hasByokKeys: true, byokKeys: (1) […], useSearchGrounding: false }
1359.d03216b20b253168.js:1:2049
11:03:37.649 Found model:
Object { found: true, modelId: "openai/gpt-oss-120b", modelName: "OpenAI gpt-oss-120b (via OpenRouter)", modelProvider: "openrouter" }
1359.d03216b20b253168.js:1:2049
11:03:37.649 Getting provider instance for:
Object { data: "openrouter" }
1359.d03216b20b253168.js:1:2049
11:03:37.649 Provider instance debug:
Object { provider: "openrouter", isFreeModel: undefined, hasApiKey: true, hasByokKeys: true, byokKeysKeys: (1) […], apiKeyLength: 73, isVtPlus: false, envGeminiKey: undefined }
1359.d03216b20b253168.js:1:2049
11:03:37.649 Provider instance created:
Object { hasInstance: true, instanceType: "function" }
1359.d03216b20b253168.js:1:2049
11:03:37.649 Creating standard model... 1359.d03216b20b253168.js:1:1956
11:03:37.649 Using model ID:
Object { data: "openai/gpt-oss-120b" }
1359.d03216b20b253168.js:1:2049
11:03:37.649 Standard model created:
Object { hasModel: true, modelType: "object" }
1359.d03216b20b253168.js:1:2049
11:03:37.649 === getLanguageModel END === 1359.d03216b20b253168.js:1:1956
11:03:37.878 Loading thread from URL
Object { threadId: "d8Midv4ZYI", currentThreadId: "d8Midv4ZYI" }
5652-33abe25d401137ac.js:1:5715
11:03:37.878 Thread already loaded in current state
Object { threadId: "d8Midv4ZYI" }
5652-33abe25d401137ac.js:1:5715
11:03:37.878 Using existing thread items from store (optimistic items)
Object { threadId: "d8Midv4ZYI", itemsCount: 1 }
5652-33abe25d401137ac.js:1:5715
11:03:42.963 🚀 Executing task "suggestions" (Run #1) 1359.d03216b20b253168.js:1:1956
11:03:42.963 🏁 Workflow ended after task "suggestions". 1359.d03216b20b253168.js:1:1956
11:04:31.187 threadItems
Object { data: (1) […] }
5652-33abe25d401137ac.js:1:5715
11:04:31.187 🚀 Sending to handleSubmit with flags
Object { useWebSearch: false, useMathCalculator: false, useCharts: false }
5652-33abe25d401137ac.js:1:5715
11:04:31.188 Abort signal received
Object { threadId: "d8Midv4ZYI" }
5652-33abe25d401137ac.js:1:5715
11:04:31.189 Agent provider received flags
Object { useWebSearch: false, useMathCalculator: false, useCharts: false }
5652-33abe25d401137ac.js:1:5715
11:04:31.207 Loading thread from URL
Object { threadId: "d8Midv4ZYI", currentThreadId: "d8Midv4ZYI" }
5652-33abe25d401137ac.js:1:5715
11:04:31.207 Thread already loaded in current state
Object { threadId: "d8Midv4ZYI" }
5652-33abe25d401137ac.js:1:5715
11:04:31.207 Using existing thread items from store (optimistic items)
Object { threadId: "d8Midv4ZYI", itemsCount: 1 }
5652-33abe25d401137ac.js:1:5715
11:04:31.231 🎯 API routing decision
Object { mode: "gpt-oss-120b", isFreeModel: false, hasVtPlusAccess: false, needsServerSide: false, shouldUseServerSideAPI: false, hasApiKey: true, deepResearch: false, proSearch: false }
5652-33abe25d401137ac.js:1:5715
11:04:31.231 📱 Using client-side workflow path
Object { mode: "gpt-oss-120b" }
5652-33abe25d401137ac.js:1:5715
11:04:31.231 About to call startWorkflow
Object { useWebSearch: false, useMathCalculator: false, useCharts: false }
5652-33abe25d401137ac.js:1:5715
11:04:31.231 🚀 Starting workflow with API keys
Object { mode: "gpt-oss-120b", apiKeysConfigured: true }
5652-33abe25d401137ac.js:1:5715
11:04:31.232 Worker API keys configured
Object { mode: "gpt-oss-120b", apiKeySetupCompleted: true }
1359.d03216b20b253168.js:1:2042
11:04:31.232 🔥 runWorkflow called with params:
Object { webSearch: false, mathCalculator: false, charts: false }
1359.d03216b20b253168.js:1:2049
11:04:31.232 🌟 Workflow context created with:
Object { webSearch: false, mathCalculator: false, charts: false }
1359.d03216b20b253168.js:1:2049
11:04:31.232 🚀 Executing task "router" (Run #1) 1359.d03216b20b253168.js:1:1956
11:04:31.233 🚀 Executing task "completion" (Run #1) 1359.d03216b20b253168.js:1:1956
11:04:31.234 🔧 Final tools for AI
Object { data: "none" }
1359.d03216b20b253168.js:1:2042
11:04:31.234 generateText called
Object { model: "openai/gpt-oss-120b", hasAnthropicKey: false, anthropicKeyLength: undefined, mode: "gpt-oss-120b", userTier: "FREE" }
1359.d03216b20b253168.js:1:2042
11:04:31.234 🤖 generateText called
Object { model: "openai/gpt-oss-120b", hasAnthropicKey: false, anthropicKeyLength: undefined, mode: "gpt-oss-120b", userTier: "FREE" }
1359.d03216b20b253168.js:1:2042
11:04:31.234 === getLanguageModel START === 1359.d03216b20b253168.js:1:1956
11:04:31.234 Parameters:
Object { modelEnum: "openai/gpt-oss-120b", hasMiddleware: false, hasByokKeys: true, byokKeys: (1) […], useSearchGrounding: false }
1359.d03216b20b253168.js:1:2049
11:04:31.234 Found model:
Object { found: true, modelId: "openai/gpt-oss-120b", modelName: "OpenAI gpt-oss-120b (via OpenRouter)", modelProvider: "openrouter" }
1359.d03216b20b253168.js:1:2049
11:04:31.234 Getting provider instance for:
Object { data: "openrouter" }
1359.d03216b20b253168.js:1:2049
11:04:31.234 Provider instance debug:
Object { provider: "openrouter", isFreeModel: undefined, hasApiKey: true, hasByokKeys: true, byokKeysKeys: (1) […], apiKeyLength: 73, isVtPlus: false, envGeminiKey: undefined }
1359.d03216b20b253168.js:1:2049
11:04:31.235 Provider instance created:
Object { hasInstance: true, instanceType: "function" }
1359.d03216b20b253168.js:1:2049
11:04:31.235 Creating standard model... 1359.d03216b20b253168.js:1:1956
11:04:31.235 Using model ID:
Object { data: "openai/gpt-oss-120b" }
1359.d03216b20b253168.js:1:2049
11:04:31.235 Standard model created:
Object { hasModel: true, modelType: "object" }
1359.d03216b20b253168.js:1:2049
11:04:31.235 === getLanguageModel END === 1359.d03216b20b253168.js:1:1956
11:04:34.086 🚀 Executing task "suggestions" (Run #1) 1359.d03216b20b253168.js:1:1956
11:04:34.086 🏁 Workflow ended after task "suggestions". 1359.d03216b20b253168.js:1:1956
11:04:42.433 🌐 web search button clicked
Object { webSearch: false }
5652-33abe25d401137ac.js:1:5715
11:04:42.433 🌐 web search button toggled 5652-33abe25d401137ac.js:1:5629
11:04:48.396 Successfully persisted chat mode
Object { context: "ChatStore" }
5652-33abe25d401137ac.js:1:5715
11:04:49.760 threadItems
Object { data: (2) […] }
5652-33abe25d401137ac.js:1:5715
11:04:49.760 🚀 Sending to handleSubmit with flags
Object { useWebSearch: false, useMathCalculator: false, useCharts: false }
5652-33abe25d401137ac.js:1:5715
11:04:49.760 Abort signal received
Object { threadId: "d8Midv4ZYI" }
5652-33abe25d401137ac.js:1:5715
11:04:49.760 Agent provider received flags
Object { useWebSearch: false, useMathCalculator: false, useCharts: false }
5652-33abe25d401137ac.js:1:5715
11:04:49.765 Loading thread from URL
Object { threadId: "d8Midv4ZYI", currentThreadId: "d8Midv4ZYI" }
5652-33abe25d401137ac.js:1:5715
11:04:49.765 Thread already loaded in current state
Object { threadId: "d8Midv4ZYI" }
5652-33abe25d401137ac.js:1:5715
11:04:49.765 Using existing thread items from store (optimistic items)
Object { threadId: "d8Midv4ZYI", itemsCount: 2 }
5652-33abe25d401137ac.js:1:5715
11:04:49.784 🎯 API routing decision
Object { mode: "gpt-oss-20b", isFreeModel: false, hasVtPlusAccess: false, needsServerSide: false, shouldUseServerSideAPI: false, hasApiKey: true, deepResearch: false, proSearch: false }
5652-33abe25d401137ac.js:1:5715
11:04:49.784 📱 Using client-side workflow path
Object { mode: "gpt-oss-20b" }
5652-33abe25d401137ac.js:1:5715
11:04:49.784 About to call startWorkflow
Object { useWebSearch: false, useMathCalculator: false, useCharts: false }
5652-33abe25d401137ac.js:1:5715
11:04:49.784 🚀 Starting workflow with API keys
Object { mode: "gpt-oss-20b", apiKeysConfigured: true }
5652-33abe25d401137ac.js:1:5715
11:04:49.785 Worker API keys configured
Object { mode: "gpt-oss-20b", apiKeySetupCompleted: true }
1359.d03216b20b253168.js:1:2042
11:04:49.785 🔥 runWorkflow called with params:
Object { webSearch: false, mathCalculator: false, charts: false }
1359.d03216b20b253168.js:1:2049
11:04:49.785 🌟 Workflow context created with:
Object { webSearch: false, mathCalculator: false, charts: false }
1359.d03216b20b253168.js:1:2049
11:04:49.785 🚀 Executing task "router" (Run #1) 1359.d03216b20b253168.js:1:1956
11:04:49.786 🚀 Executing task "completion" (Run #1) 1359.d03216b20b253168.js:1:1956
11:04:49.786 🔧 Final tools for AI
Object { data: "none" }
1359.d03216b20b253168.js:1:2042
11:04:49.787 generateText called
Object { model: "openai/gpt-oss-20b", hasAnthropicKey: false, anthropicKeyLength: undefined, mode: "gpt-oss-20b", userTier: "FREE" }
1359.d03216b20b253168.js:1:2042
11:04:49.787 🤖 generateText called
Object { model: "openai/gpt-oss-20b", hasAnthropicKey: false, anthropicKeyLength: undefined, mode: "gpt-oss-20b", userTier: "FREE" }
1359.d03216b20b253168.js:1:2042
11:04:49.787 === getLanguageModel START === 1359.d03216b20b253168.js:1:1956
11:04:49.787 Parameters:
Object { modelEnum: "openai/gpt-oss-20b", hasMiddleware: false, hasByokKeys: true, byokKeys: (1) […], useSearchGrounding: false }
1359.d03216b20b253168.js:1:2049
11:04:49.787 Found model:
Object { found: true, modelId: "openai/gpt-oss-20b", modelName: "OpenAI gpt-oss-20b (via OpenRouter)", modelProvider: "openrouter" }
1359.d03216b20b253168.js:1:2049
11:04:49.787 Getting provider instance for:
Object { data: "openrouter" }
1359.d03216b20b253168.js:1:2049
11:04:49.787 Provider instance debug:
Object { provider: "openrouter", isFreeModel: undefined, hasApiKey: true, hasByokKeys: true, byokKeysKeys: (1) […], apiKeyLength: 73, isVtPlus: false, envGeminiKey: undefined }
1359.d03216b20b253168.js:1:2049
11:04:49.787 Provider instance created:
Object { hasInstance: true, instanceType: "function" }
1359.d03216b20b253168.js:1:2049
11:04:49.787 Creating standard model... 1359.d03216b20b253168.js:1:1956
11:04:49.787 Using model ID:
Object { data: "openai/gpt-oss-20b" }
1359.d03216b20b253168.js:1:2049
11:04:49.787 Standard model created:
Object { hasModel: true, modelType: "object" }
1359.d03216b20b253168.js:1:2049
11:04:49.787 === getLanguageModel END === 1359.d03216b20b253168.js:1:1956
11:04:52.793 🚀 Executing task "suggestions" (Run #1) 1359.d03216b20b253168.js:1:1956
11:04:52.793 🏁 Workflow ended after task "suggestions". 1359.d03216b20b253168.js:1:1956
11:09:42.739 🌐 web search button clicked
Object { webSearch: false }
5652-33abe25d401137ac.js:1:5715
11:09:42.741 🌐 web search button toggled 5652-33abe25d401137ac.js:1:5629
11:09:47.131 threadItems
Object { data: (3) […] }
5652-33abe25d401137ac.js:1:5715
11:09:47.131 🚀 Sending to handleSubmit with flags
Object { useWebSearch: true, useMathCalculator: false, useCharts: false }
5652-33abe25d401137ac.js:1:5715
11:09:47.132 Abort signal received
Object { threadId: "d8Midv4ZYI" }
5652-33abe25d401137ac.js:1:5715
11:09:47.132 Agent provider received flags
Object { useWebSearch: true, useMathCalculator: false, useCharts: false }
5652-33abe25d401137ac.js:1:5715
11:09:47.141 Loading thread from URL
Object { threadId: "d8Midv4ZYI", currentThreadId: "d8Midv4ZYI" }
5652-33abe25d401137ac.js:1:5715
11:09:47.141 Thread already loaded in current state
Object { threadId: "d8Midv4ZYI" }
5652-33abe25d401137ac.js:1:5715
11:09:47.141 Using existing thread items from store (optimistic items)
Object { threadId: "d8Midv4ZYI", itemsCount: 3 }
5652-33abe25d401137ac.js:1:5715
11:09:47.165 🎯 API routing decision
Object { mode: "gpt-oss-20b", isFreeModel: false, hasVtPlusAccess: false, needsServerSide: false, shouldUseServerSideAPI: false, hasApiKey: true, deepResearch: false, proSearch: false }
5652-33abe25d401137ac.js:1:5715
11:09:47.165 📱 Using client-side workflow path
Object { mode: "gpt-oss-20b" }
5652-33abe25d401137ac.js:1:5715
11:09:47.165 About to call startWorkflow
Object { useWebSearch: true, useMathCalculator: false, useCharts: false }
5652-33abe25d401137ac.js:1:5715
11:09:47.165 🚀 Starting workflow with API keys
Object { mode: "gpt-oss-20b", apiKeysConfigured: true }
5652-33abe25d401137ac.js:1:5715
11:09:47.166 Worker API keys configured
Object { mode: "gpt-oss-20b", apiKeySetupCompleted: true }
1359.d03216b20b253168.js:1:2042
11:09:47.166 🔥 runWorkflow called with params:
Object { webSearch: true, mathCalculator: false, charts: false }
1359.d03216b20b253168.js:1:2049
11:09:47.167 🌟 Workflow context created with:
Object { webSearch: true, mathCalculator: false, charts: false }
1359.d03216b20b253168.js:1:2049
11:09:47.167 🚀 Executing task "router" (Run #1) 1359.d03216b20b253168.js:1:1956
11:09:47.168 🚀 Executing task "completion" (Run #1) 1359.d03216b20b253168.js:1:1956
11:09:47.168 🚀 Executing task "planner" (Run #1) 1359.d03216b20b253168.js:1:1956
11:09:47.169 === selectAvailableModel START === 1359.d03216b20b253168.js:1:1956
11:09:47.169 Input:
Object { preferredModel: "openai/gpt-oss-20b", availableKeys: (1) […], byokKeys: (1) […], hasSelf: true, hasWindow: true, hasSelfApiKeys: true, hasWindowApiKeys: false }
1359.d03216b20b253168.js:1:2049
11:09:47.169 === generateObject START === 1359.d03216b20b253168.js:1:1956
11:09:47.169 Input parameters:
Object { prompt: "\n You're a strategic research planner. Your job is to analyze research questi...", model: "openai/gpt-oss-20b", hasSchema: true, messagesLength: 7, hasSignal: false, byokKeys: (1) […] }
1359.d03216b20b253168.js:1:2049
11:09:47.170 Message filtering:
Object { originalCount: 7, filteredCount: 7, removedCount: 0 }
1359.d03216b20b253168.js:1:2049
11:09:47.170 === getLanguageModel START === 1359.d03216b20b253168.js:1:1956
11:09:47.170 Parameters:
Object { modelEnum: "openai/gpt-oss-20b", hasMiddleware: false, hasByokKeys: true, byokKeys: (1) […], useSearchGrounding: undefined }
1359.d03216b20b253168.js:1:2049
11:09:47.170 Found model:
Object { found: true, modelId: "openai/gpt-oss-20b", modelName: "OpenAI gpt-oss-20b (via OpenRouter)", modelProvider: "openrouter" }
1359.d03216b20b253168.js:1:2049
11:09:47.170 Getting provider instance for:
Object { data: "openrouter" }
1359.d03216b20b253168.js:1:2049
11:09:47.170 Provider instance debug:
Object { provider: "openrouter", isFreeModel: undefined, hasApiKey: true, hasByokKeys: true, byokKeysKeys: (1) […], apiKeyLength: 73, isVtPlus: false, envGeminiKey: undefined }
1359.d03216b20b253168.js:1:2049
11:09:47.170 Provider instance created:
Object { hasInstance: true, instanceType: "function" }
1359.d03216b20b253168.js:1:2049
11:09:47.170 Creating standard model... 1359.d03216b20b253168.js:1:1956
11:09:47.170 Using model ID:
Object { data: "openai/gpt-oss-20b" }
1359.d03216b20b253168.js:1:2049
11:09:47.170 Standard model created:
Object { hasModel: true, modelType: "object" }
1359.d03216b20b253168.js:1:2049
11:09:47.170 === getLanguageModel END === 1359.d03216b20b253168.js:1:1956
11:09:47.170 Selected model for generateObject:
Object { hasModel: true, modelType: "object" }
1359.d03216b20b253168.js:1:2049
11:09:47.170 Calling generateObjectAi with:
Object { configType: "with-messages", hasPrompt: true, hasSchema: true, messagesCount: 7, hasProviderOptions: false }
1359.d03216b20b253168.js:1:2049
11:09:50.769 Error in generateObject:
Object { error: "No object generated: the tool was not called.", stack: "e@https://vtchat.io.vn/_next/static/chunks/vendor-fffd9bda-2e36f19df397890c.js:4:1681\nee@https://vtchat.io.vn/_next/static/chunks/vendor-6820486d-9d4e532a2909a0b9.js:1:6311\nfn@https://vtchat.io.vn/_next/static/chunks/vendor-6820486d-9d4e532a2909a0b9.js:5:11398\n", data: Error }
1359.d03216b20b253168.js:1:2049
11:09:50.769 Generating user-friendly error message
Object { provider: "openai", model: "openai/gpt-oss-20b", hasApiKey: true, isVtPlus: false, errorType: "object", errorLength: 45 }
1359.d03216b20b253168.js:1:2049
11:09:50.770 ❌ Error in task "planner" (Attempt 1):
Object { data: Error }
1359.d03216b20b253168.js:1:2049
11:09:50.770 Generating user-friendly error message
Object { provider: undefined, model: undefined, hasApiKey: undefined, isVtPlus: undefined, errorType: "object", errorLength: 118 }
1359.d03216b20b253168.js:1:2049
11:09:50.771 Task failed
Object { data: Error }
1359.d03216b20b253168.js:1:2049
11:09:54.719 Uncaught (in promise) TypeError: can't access property "includes", args.site.enabledFeatures is undefined
isFeatureBroken <anonymous code>:980
updateFeaturesInner <anonymous code>:9240
updateFeaturesInner <anonymous code>:9239
<anonymous code>:980:143
