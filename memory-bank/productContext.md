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
Description: "For everyday productivity"
Payment: Subscription type, 7.99 USD monthly, price includes tax.
Features:
Pro Search: "Pro Search: Enhanced search with web integration for real-time information."
Dark Mode: "Access to dark mode."
Deep Research: "Deep Research: Comprehensive analysis of complex topics with in-depth exploration."
