# TODO

--

ok go-> https://vtchat.io.vn/

--

🎯 ORACLE'S VERDICT: Current BYOK approach is NOT acceptable for production

🚨 CRITICAL SECURITY ISSUES:

API keys in request bodies = high-impact vulnerability
Exposure vectors: Browser dev tools, HAR files, server logs, XSS attacks
No enterprise customer would accept this architecture
✅ SECURE BYOK ARCHITECTURE (Industry Standard):

sequenceDiagram
participant User
participant Frontend
participant API_Keys_Endpoint as /api/keys
participant DB as Encrypted Storage
participant KMS
participant Completion_API as /api/completion
participant Provider as OpenAI/Anthropic

    User->>Frontend: Enter API key (one time)
    Frontend->>API_Keys_Endpoint: POST {provider, key}
    API_Keys_Endpoint->>KMS: Encrypt(key)
    KMS-->>API_Keys_Endpoint: ciphertext
    API_Keys_Endpoint->>DB: Store encrypted key

    Note over User,Provider: Later chat requests
    Frontend->>Completion_API: POST {mode, messages} (no keys!)
    Completion_API->>DB: Get encrypted key for user+provider
    Completion_API->>KMS: Decrypt(ciphertext)
    KMS-->>Completion_API: plaintext key (in memory only)
    Completion_API->>Provider: API call with decrypted key
    Provider-->>Completion_API: Response
    Completion_API-->>Frontend: Chat response

🛠️ IMPLEMENTATION PLAN:

Create secure key storage endpoint: /api/keys
Add encryption: Use AWS KMS, Google Cloud KMS, or Azure Key Vault
Modify /api/completion: Remove apiKeys from request body, fetch from encrypted storage
Frontend changes: One-time key entry, remove keys from chat requests
🔧 IMMEDIATE FIXES NEEDED:

Updated TODOs
⚠️ CURRENT STATE: The filtering fix we implemented helps prevent wrong keys being sent, but the fundamental architecture is still insecure.

🚀 RECOMMENDED APPROACH:

Short-term: Deploy the filtering fix to prevent immediate wrong-key issues
Long-term: Implement proper encrypted server-side key storage (industry standard)
This gives you working BYOK functionality while meeting enterprise security standards. Most SaaS platforms use this exact pattern.

--

oracle: check for vulnerable code path in codebase, in subscription, web hook, in api chat completion, in making payment, in rag ... review carefully, ultrathink, think hard

--

add kimi2 free
https://openrouter.ai/moonshotai/kimi-k2:free

--

important: critical

https://www.kimi.com/share/d1q8vgm6s4ta557cdodg

-

debug check openai/anthropic provider -> we are now not sending plan "apiKeys" field. so there is no model response. how to make sure it work?

--

fix openrouter send dummy api/completion

--

I only set VT+ tier as 5.99 usd what should i do

Oracle's strategic analysis reveals major pricing opportunities:

🚨 Critical Issue: You're severely underpriced
Current market context:

ChatGPT Plus, Claude Pro, Perplexity Pro: $20/month
Your VT+: $5.99/month (70% cheaper!)
Your infrastructure: Only $1.91/month
🎯 Recommended Action Plan
Phase 1: Immediate (Next 2 weeks)
GRANDFATHERING STRATEGY:

- Keep existing users at $5.99 "Early Bird" pricing
- Add countdown banner: "Price increases to $9.99 on Aug 15"
- Protect current subscribers while creating urgency
  Phase 2: New Pricing Tiers
  🆓 Free Tier
- BYOK for premium models
- Basic features only

💎 VT+ Standard ($9.99/month)

- Current VT+ features
- Server-funded Gemini access
- Pro Search 20/day, Deep Research 10/day

🚀 VT Pro ($19.99/month)

- Unlimited quotas
- Priority queue
- API access
- Early model access
  Phase 3: Global Pricing
  Regional pricing using PPP:
- US/EU: $9.99
- India/Vietnam: $4.99 (50% discount)
- Other developing: $2.99 (70% discount)
  💡 Why This Works
  Value justification:

Your features (Deep Research, RAG Memory) are unique
$9.99 still 50% cheaper than competitors
Infrastructure costs remain negligible vs. value delivered
Revenue impact:

Current: 400 users × $5.99 = $2,396/month potential
Optimized: Mix of $9.99/$4.99 = $4,000+/month potential
Next steps: Implement grandfathering logic and prepare new pricing tiers!
