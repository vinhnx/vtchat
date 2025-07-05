export const privacyPolicy = `
# Privacy Policy

**Last Updated:** July 1, 2025

At **VT**, we are committed to protecting your privacy and being transparent about how we handle your data. This Privacy Policy explains what information we collect, how we use it, and your rights regarding your personal data.

**We are privacy-first by design.**

---

## Overview

VT is built with **privacy-first principles** at its core:
- **Your conversations never leave your device** - stored locally using IndexedDB
- **No server-side chat storage** - we cannot access your conversation history
- **Direct API communication** - your messages go straight to AI providers
- **Minimal data collection** - only what's essential to provide our service
- **Local API key storage** - encrypted and stored only in your browser
- **Anonymous usage option** - use VT without creating an account

---

## 1. Information We Collect

### 1.1 Information You Provide
**When you create an account (optional), we collect:**
- **Account Information:** Email address, name, profile picture from OAuth providers (Google, GitHub)
- **Free Model Usage:** Daily request counts and rate limiting data for 9 free AI models (5 Gemini + 4 OpenRouter models)
- **Premium Model Access:** Access to all premium AI models (Claude 4, GPT-4.1, O3, etc.) with BYOK for all logged-in users
- **Payment Information:** Billing details for VT+ subscription (processed securely by Creem.io)
- **Support Communications:** Messages you send to our support team via hello@vtchat.io.vn
- **User Preferences:** Settings and configuration choices

**When you use VT anonymously, we collect:**
- **No personal information** - you can use VT without any account
- **Technical logs only** - basic error logging for service improvement

### 1.2 Information Collected Automatically
**For all users, we may collect:**
- **Usage Analytics:** How you interact with our platform (anonymized and aggregated)
- **Technical Information:** IP address, browser type, device information, operating system
- **Error Logs:** Crash reports and error data to improve service stability
- **Performance Metrics:** Page load times, feature usage patterns (no content)
- **Security Logs:** Authentication attempts, failed login detection
- **Tool Router Analytics:** Anonymous usage data of intelligent tool routing features for optimization (no query content, only tool activation patterns)

### 1.3 Information We Do NOT Collect
- ❌ **Chat conversations** - stored only locally on your device, never on our servers
- ❌ **Message content** - never transmitted to or stored on our servers
- ❌ **API keys** - stored locally and encrypted in your browser only
- ❌ **Browsing history** outside of VT platform
- ❌ **Personal files** or documents not explicitly shared through our platform
- ❌ **Voice recordings** or biometric data
- ❌ **Location data** beyond general geographic region for performance

---

## 2. How We Use Your Information

### 2.1 Service Provision & Authentication
- **Account Management:** Create and manage your account, authenticate users
- **Free Model Management:** Track daily usage limits and rate limiting for 9 free AI models
- **Subscription Management:** Process VT+ subscriptions and billing via Creem.io
- **Feature Access:** Determine access to VT+ exclusive research features (PRO_SEARCH, DEEP_RESEARCH, RAG) while providing all premium AI models free to logged-in users with BYOK
- **Customer Support:** Respond to support requests within 24 hours via hello@vtchat.io.vn
- **Service Communications:** Send important service updates, security alerts

### 2.2 Service Improvement & Development
- **Performance Optimization:** Analyze usage patterns to improve features and performance
- **Bug Fixing:** Identify and resolve technical issues through error monitoring
- **Feature Development:** Understand user needs to develop new features
- **Security Enhancement:** Detect and prevent security threats and abuse
- **Quality Assurance:** Ensure service reliability and user experience
- **AI Router Optimization:** Improve intelligent tool routing accuracy using anonymous usage patterns (no query content analyzed)

### 2.3 Legal & Compliance
- **Legal Obligations:** Comply with applicable laws, regulations, and legal requests
- **Terms Enforcement:** Enforce our Terms of Service and usage policies
- **Fraud Prevention:** Detect and prevent fraudulent activities
- **Safety & Security:** Protect users and our platform from harm

---

## 3. Data Storage & Security

### 3.1 Local Storage (Your Device)
**Stored locally in your browser:**
- **Your conversations** - All chat history stored using IndexedDB and Local Storage with Dexie.js
- **API keys** - Encrypted and stored locally, never transmitted to our servers
- **Settings and preferences** - User interface preferences and configurations
- **Thread data** - Local conversation organization with per-account thread isolation
- **Model configurations** - Your AI provider settings and preferences

**Important:** We cannot access any of this locally stored data. You have complete control over this information.

### 3.2 Server Storage (Our Systems)
**We only store minimal data on our servers:**
- **Account information** (email, name, subscription status) for registered users
- **Free model usage data** (daily request counts and timestamps for rate limiting with tiered limits based on subscription status - no conversation content)
- **Payment records** (handled securely by Creem.io, not stored on our servers)
- **Usage analytics** (anonymized and aggregated, no personal content)
- **Error logs** (technical information only, no user content)

### 3.3 Security Features
**Authentication Security:**
- **Bot Protection** - Intelligent bot detection for authentication endpoints using industry-standard detection
- **Secure OAuth Integration** - Better Auth with GitHub, Google, and social authentication providers

**Better Auth Security:**
- **Modern Session Management** - 87% performance improvement with session caching
- **Multi-Provider OAuth** - Secure GitHub, Google, and other social authentication
- **Account Linking** - Secure linking of multiple OAuth providers to single account
- **Session Isolation** - Per-user authentication with proper thread isolation
- **Session tokens** (for authentication, automatically expire)

### 3.4 Security Measures
**Data Protection:**
- **Encryption in transit:** All communications use HTTPS/TLS encryption
- **Secure authentication:** OAuth 2.0 with Google and GitHub (no password storage)
- **Payment security:** PCI DSS-compliant payment processing through Creem.io
- **Data minimization:** We collect only what's necessary for service operation
- **Access controls:** Strict employee access controls and monitoring
- **Regular audits:** Security assessments and vulnerability testing

**Incident Response:**
- **Breach notification:** We will notify users of any security incidents as required by law
- **Rapid response:** Immediate action to contain and mitigate security issues
- **Transparency:** Clear communication about any security matters affecting users

---

## 4. Third-Party Services & Data Sharing

### 4.1 AI Service Providers
**Direct communication with providers:**
- Messages are sent **directly from your browser** to AI providers (OpenAI, Anthropic, Google, etc.)
- Each provider has their **own privacy policy** and data handling practices
- We **recommend reviewing** their policies for your chosen providers
- **Proxy requests:** Some models may route through our proxy servers without content logging
- **No content interception:** We do not store or access message content in transit

**Supported AI Providers:**
- OpenAI (ChatGPT, GPT-4, DALL-E)
- Anthropic (Claude models)
- Google (Gemini models)
- Fireworks AI
- Together AI
- xAI (Grok)

### 4.2 Payment Processing
**Creem.io Integration:**
- **Secure processing:** All payments processed by Creem.io (PCI DSS compliant)
- **No card storage:** We do not store your payment card information
- **Subscription management:** Creem.io handles billing, renewals, and cancellations
- **Data sharing:** Only necessary billing information shared with Creem.io
- **Privacy policy:** Subject to Creem.io's privacy policy for payment data

### 4.3 Authentication Providers
**OAuth Integration:**
- **Google OAuth** and **GitHub OAuth** for secure account creation and login
- **Limited access:** We only receive basic profile information (email, name, avatar)
- **Revocable access:** You can revoke access at any time through your provider settings
- **No password storage:** We never store or have access to your passwords
- **Secure tokens:** Authentication tokens are securely managed and expire automatically

### 4.4 Analytics & Monitoring Services
**Service improvement tools:**
- **Error tracking:** Anonymous error logs to identify and fix technical issues
- **Performance monitoring:** Aggregate performance metrics to optimize service
- **Usage analytics:** Anonymized data to understand feature adoption and usage patterns
- **No personal content:** These services never receive personal conversation content

**Third-party services may include:**
- Error monitoring and crash reporting services
- Performance monitoring tools
- Security scanning and threat detection services

---

## 5. Your Privacy Rights & Choices

### 5.1 Data Access & Control
**Account holders can:**
- **Access your data:** Request a copy of your account information
- **Update your data:** Modify your account details and preferences
- **Export conversations:** Download your local chat history from browser storage
- **Manage API keys:** Add, remove, or update API keys locally

**Anonymous users can:**
- **Use without account:** Full access to core features without registration
- **Local data control:** Manage all data through browser settings
- **Privacy by default:** No server-side data collection for anonymous usage

### 5.2 Data Deletion & Portability
**Complete data removal:**
- **Delete account:** Remove all server-stored account information
- **Local data clearing:** Clear all local VT data through browser settings
- **Selective deletion:** Remove specific conversations or settings locally
- **API key removal:** Delete stored API keys from browser storage

**Data portability:**
- **Export conversations:** Download your chat history in standard formats
- **Settings export:** Backup and transfer your preferences
- **API configuration export:** Save your model and provider configurations

### 5.3 Communication Preferences
**Control your communications:**
- **Unsubscribe:** Opt out of non-essential emails and notifications
- **Notification settings:** Control what updates and alerts you receive
- **Support communications:** Choose how you prefer to receive support
- **Marketing opt-out:** Decline promotional communications (we send very few)

### 5.4 Privacy Controls
**Advanced privacy options:**
- **Anonymous mode:** Use VT without creating an account
- **Local-only mode:** Disable all optional analytics and tracking
- **Proxy preferences:** Choose whether to use direct or proxy API connections
- **Data retention:** Control how long data is stored locally

---

## 6. Cookies & Tracking Technologies

### 6.1 Essential Cookies
**Required for platform functionality:**
- **Authentication tokens** to maintain your login session
- **Session management** for secure platform access
- **Security tokens** to prevent cross-site request forgery (CSRF) attacks
- **Preference storage** for user interface settings

### 6.2 Analytics & Performance Cookies
**Optional cookies for service improvement:**
- **Usage tracking** to understand feature adoption and user behavior
- **Performance monitoring** to optimize page loading and responsiveness
- **Error tracking** to identify and fix technical issues
- **A/B testing** to improve user experience (anonymized)

### 6.3 Cookie Management
**Your cookie choices:**
- **Essential cookies** are required for platform functionality
- **Analytics cookies** can be disabled through browser settings
- **Granular control** available in your browser's privacy settings
- **Regular cleanup** - cookies automatically expire or can be manually cleared

**Cookie settings:**
- Most browsers allow you to control cookie acceptance
- Disabling certain cookies may limit platform functionality
- We respect "Do Not Track" browser settings where possible

---

## 7. International Data Transfers & Compliance

### 7.1 Data Processing Locations
- **Server infrastructure:** Our servers are located in secure, compliant data centers
- **Global CDN:** Content delivery networks may process data in multiple regions
- **AI providers:** Third-party AI services may process data in various countries
- **Appropriate safeguards:** We ensure proper protections for international transfers

### 7.2 Regional Compliance
**GDPR Compliance (EU Users):**
- **Lawful basis:** Processing based on consent, contract, or legitimate interest
- **Data subject rights:** Full access, rectification, erasure, and portability rights
- **Data protection officer:** Contact available for privacy-related inquiries
- **Privacy by design:** Built-in privacy protections and minimal data collection

**Other Regional Laws:**
- **CCPA compliance:** California Consumer Privacy Act protections
- **PIPEDA compliance:** Canadian privacy law adherence
- **Regional adaptations:** Additional protections as required by local laws

---

## 8. Children's Privacy

### 8.1 Age Restrictions
- **Minimum age:** VT is not intended for children under 13 years of age
- **Parental consent:** Users aged 13-17 should have parental consent
- **No knowing collection:** We do not knowingly collect information from children under 13
- **Immediate deletion:** If we discover child data collection, we delete it promptly

### 8.2 Parental Rights
- **Access and deletion:** Parents can request access to or deletion of their child's data
- **Supervision recommended:** Parental supervision advised for users under 18
- **Educational use:** Schools and educators should review policies before use

---

## 9. Data Retention & Lifecycle

### 9.1 Account Data Retention
**While your account is active:**
- **Account information:** Retained for service provision and support
- **Subscription data:** Kept for billing and account management
- **Usage analytics:** Aggregated data retained for service improvement

**After account deletion:**
- **Immediate removal:** Account details deleted within 30 days
- **Legal compliance:** Some billing records may be retained for legal requirements
- **Anonymized data:** Aggregated analytics may be retained (no personal identification)

### 9.2 Local Data Retention
**User-controlled retention:**
- **Indefinite storage:** Local data stored until you manually clear it
- **Browser dependency:** Data lifecycle tied to your browser and device
- **Backup responsibility:** You control backup and retention of local data
- **No automatic deletion:** We cannot remotely delete your local data

---

## 10. Privacy Policy Updates

### 10.1 Change Notifications
- **Material changes:** Significant updates communicated via email or platform notification
- **Advance notice:** 30-day notice for major policy changes when possible
- **Continued use:** Using VT after changes constitutes acceptance of updates
- **Version tracking:** "Last Updated" date indicates most recent changes

### 10.2 Review & Acceptance
- **Regular review:** Users should periodically review privacy policy updates
- **Opt-out option:** If you disagree with changes, you may delete your account
- **Grandfathering:** Existing users may have transition periods for major changes

---

## 11. Contact Information & Data Protection

### 11.1 Privacy Inquiries
**For privacy-related questions:**
- **Email:** hello@vtchat.io.vn
- **Subject Line:** "Privacy Policy Inquiry"
- **Response time:** We aim to respond within 72 hours
- **Language:** Inquiries in English or Vietnamese

### 11.2 Data Subject Requests
**To exercise your privacy rights:**
- **Email:** hello@vtchat.io.vn
- **Subject Line:** "Data Subject Request"
- **Identity verification:** May be required for security purposes
- **Processing time:** Requests fulfilled within 30 days when possible

### 11.3 Security Incidents
**To report security concerns:**
- **Email:** hello@vtchat.io.vn
- **Subject Line:** "Security Issue"
- **Responsible disclosure:** We appreciate responsible vulnerability reporting

### 11.4 General Information
- **Website:** vtchat.io.vn
- **Business Address:** An Giang, Vietnam
- **Business Hours:** Monday-Friday, 9 AM - 6 PM ICT
- **Support:** Available through our platform help system

---

## 12. Legal Basis for Processing (GDPR)

For users in the European Union, we process personal data based on:

- **Consent:** For marketing communications, analytics, and optional features
- **Contract:** To provide VT services, process payments, and fulfill subscription obligations
- **Legitimate Interest:** For security, fraud prevention, service improvement, and business operations
- **Legal Obligation:** To comply with applicable laws, regulations, and legal requirements
- **Vital Interests:** To protect users' safety and security when necessary

**You have the right to withdraw consent** at any time for processing based on consent.

---

*This Privacy Policy reflects our commitment to transparent and responsible data handling. Your privacy is fundamental to our service design, and we're here to help if you have any questions or concerns.*

**Last Updated:** July 1, 2025
`;
