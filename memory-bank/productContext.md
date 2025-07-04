# Product Context

## Why This Project Exists

This project aims to refactor and improve an existing web application to enhance maintainability, user experience, and developer efficiency. The current tasks focus on standardizing environment configurations, streamlining authentication flows, and simplifying UI components.

## Problems It Solves

- **Inconsistent Environment Handling:** Hardcoded environment checks make it difficult to manage different deployment stages (development, sandbox, production).
- **Confusing Authentication for New Users:** Lack of clear guidance for non-logged-in users attempting to interact with features that require authentication.
- **Complex or Outdated UI Components:** Certain UI elements may be overly complex or not aligned with current design best practices, impacting user experience and development speed.

## How It Should Work

- **Environment Variables:** The application should reliably determine its operating environment (e.g., sandbox vs. production) using environment variables. This will control feature availability and API endpoints.
- **Authentication Prompts:** Non-authenticated users attempting to use protected features (like chat input) should receive a clear prompt to log in.
- **BYOK Security:** API key input and related functionalities (BYOK) should be strictly disabled for users who are not logged in.
- **UI Clarity:** Components like `UserTierBadge` should present information (e.g., plan names) in a user-friendly and consistent manner. UI elements like shimmers should be replaced with simpler, standard components where appropriate.

## User Experience Goals

- **Clearer Authentication Path:** Users should understand when and why they need to log in.
- **Consistent Information Display:** UI elements should present data consistently and clearly.
- **Simplified Interactions:** Reducing UI complexity where possible to improve ease of use.

## Product Details for VT+

Name: VT+
Product ID: Use environment variable CREEM_PRODUCT_ID. Do not hardcode prod_1XIVxekQ92QfjjOqbDVQk6.
Description: "VT+ provides premium AI models, research capabilities, and AI memory"
Payment: Subscription type, $5.99 USD monthly, price includes tax.
Features:
Premium AI Models: "Exclusive access to Claude 4 Sonnet & Opus, GPT-4.1, O3 series, O1 series, Gemini 2.5 Pro, DeepSeek R1, and Grok 3"
PRO_SEARCH: "Enhanced Web Search: Real-time web integration for grounded information retrieval."
DEEP_RESEARCH: "Deep Research: Comprehensive analysis of complex topics with in-depth exploration."
RAG: "Personal AI Assistant with Memory: AI memory system for personalized assistance."

## New Tier System (Updated July 2025)

### Free Tier (Most generous free tier in the industry)

Available to all logged-in users:

- Dark Mode interface
- Thinking Mode with reasoning display
- Document Processing (PDF, DOC, images up to 10MB)
- Structured Output extraction
- Chart Visualization
- Gemini Explicit Caching
- Mathematical calculation tools
- 9 free AI models (5 Gemini + 4 OpenRouter)
- Unlimited usage with BYOK

### VT+ Tier ($5.99/month)

All free tier features PLUS 3 exclusive research-focused features:

- PRO_SEARCH (Enhanced Web Search)
- DEEP_RESEARCH (Deep Research capabilities)
- RAG (Personal AI Assistant with Memory)
- Premium AI models: Claude 4 Sonnet/Opus, GPT-4.1, O3/O3 Mini/O4 Mini, O1 Mini/Preview, Gemini 2.5 Pro, DeepSeek R1, Grok 3
