import { VT_PLUS_PRICE_FORMATTED } from '../constants';

export const termsMdx = `
# Terms of Service

**Last Updated:** June 25, 2025

Welcome to **VT** ("we," "our," or "us"), an independent AI wrapper platform providing custom interfaces for AI models. These Terms of Service ("Terms") govern your use of our website, application, and services (collectively, the "Service").

**Important Notice:** VT is an independent platform providing custom interfaces for AI models. We are not affiliated with, endorsed by, or sponsored by OpenAI, Anthropic, Google, or other AI model providers.

By accessing or using VT, you agree to be bound by these Terms. If you disagree with any part of these Terms, please do not use our Service.

---

## 1. Service Overview

VT is an independent AI wrapper platform that provides user-friendly interfaces built on top of AI models to enhance usability and provide additional features. Our platform enables you to:
- **Custom AI Interfaces**: Enhanced user experience for multiple AI model providers
- **Privacy-First Architecture**: All conversations stored locally on your device using IndexedDB
- **Multiple AI Providers**: Access OpenAI, Anthropic, Google, Fireworks, Together AI, and xAI models through our interface
- **Intelligent Tool Router**: AI-powered semantic routing automatically activates tools based on query intent
- **Advanced Features**: Chart visualization, reasoning mode, document processing, web search integration
- **Subscription Tiers**: VT_BASE (free) and VT_PLUS (premium) with clear feature differentiation
- **Free Gemini Model**: Gemini 2.5 Flash Lite Preview access for registered users (20 requests/day, 5/minute rate limit; VT+ users get enhanced limits: 100/day, 10/minute)
- **Local Privacy**: Zero server-side storage of chat data for maximum privacy
- **Mathematical Tools**: Built-in calculator with advanced mathematical functions
- **Document Processing**: Upload and analyze various document formats (VT+ feature)
- **Web Search Integration**: Real-time information grounding (VT+ feature)

**AI Model Disclaimer**: Our platform provides interfaces for third-party AI models. We are not affiliated with the model providers and do not control the underlying AI model outputs.

---

## 1.1 Content Usage & Crawler Protection

VT implements the IETF AI Preferences (aipref) standard to control how automated systems use our content:

**Protected Content Areas:**
- **Private Conversations**: All chat threads are completely blocked from search engines and AI training crawlers
- **User Profiles**: Personal account information is protected from indexing and data mining
- **RAG Content**: Personal AI assistant knowledge base is fully blocked from external access
- **API Endpoints**: All server APIs are protected with no-index and no-store policies

**Public Content Policy:**
- **Informational Pages**: Only our public pages (About, FAQ, Privacy, Terms) may be used for AI training
- **Search Restrictions**: Major search engines are prevented from indexing sensitive user data
- **Training Data Controls**: We explicitly control which content can be used for AI model training

**Technical Implementation:**
- robots.txt compliance with IETF standard syntax
- HTTP Content-Usage headers for granular control
- X-Robots-Tag headers for additional protection
- Cache-Control headers preventing data storage

By using VT, you acknowledge that we protect your private data from being used in AI training datasets while allowing appropriate use of our public informational content.

---

## 2. Account Registration & Age Requirements

### 2.1 Account Creation
- You may use VT anonymously for basic functionality
- Account registration (via Google or GitHub OAuth) is required for:
  - Free Gemini 2.5 Flash Lite Preview access (20 requests/day, 5/minute limit)
  - VT+ subscription features (Grounding Web Search, Dark Mode)
  - Daily usage tracking and fair usage enforcement
  - Thread synchronization and account-based management
- You must provide accurate information during registration

### 2.2 Age Requirements
- You must be at least 13 years old to use VT
- Users under 18 must have parental or legal guardian consent
- We reserve the right to request age verification at any time
- Account access may be suspended if age requirements are not met

---

## 3. Privacy & Data Handling

### 3.1 Local Storage Architecture
- **Your conversations are stored locally** on your device using IndexedDB and Local Storage
- **API keys are encrypted** and stored locally in your browser
- **We do not store, access, or backup** your chat history on our servers
- **You are solely responsible** for backing up your data if desired
- **Account-based users** may optionally sync threads to our database for cross-device access

### 3.2 Data We Collect
**User-Provided Information:**
- Account information (email, name, profile picture) from OAuth providers (Google, GitHub)
- Payment information for VT+ subscriptions (processed securely through Creem.io)
- Support communications and feedback

**Automatically Collected Information:**
- Usage analytics and error logs to improve our service (anonymized)
- Technical information (IP address, browser type, device information)
- Performance metrics and crash reports

### 3.3 API Communications
- **Direct communication**: Messages sent directly from your browser to AI providers
- **Proxy requests**: Some models may route through our proxy servers without logging content
- **No content storage**: We never store the content of your conversations
- **Provider policies apply**: Each AI provider has their own terms and data handling practices

---

## 4. Subscription & Billing (VT+)

### 4.1 Free Tier Benefits (VT_BASE)
VT_BASE is our free tier for logged-in users that includes:
- **All Premium AI Models**: Access to Claude 4, GPT-4.1, O3, Gemini 2.5 Pro, DeepSeek R1, Grok 3 with your own API keys (BYOK)
- **9 Free Server Models**: Gemini and OpenRouter models with VT's server API keys (no BYOK required)
- **Daily Reset**: Usage limits reset at 00:00 UTC daily
- **Registration Required**: Must be signed in to access free tier benefits
- **Advanced Features**: Dark Mode, Thinking Mode, Document Processing, Structured Output, Chart Visualization, Web Search, Intelligent Tool Router, Reasoning Chain, Gemini Explicit Caching, Multi-modal Chat
- **Unlimited BYOK Usage**: No limits when using your own API keys

### 4.2 VT+ Subscription Features
VT+ is a monthly subscription service for **${VT_PLUS_PRICE_FORMATTED} USD** that includes:
- **All Free Tier Features**: Complete access to all premium AI models and advanced features
- **Three Exclusive Research Features**: Enhanced Web Search (PRO_SEARCH), Deep Research (DEEP_RESEARCH), and Personal AI Assistant with Memory (RAG)
- **Priority Support**: Enhanced customer support

### 4.3 Payment Terms
- All payments are processed securely through **Creem.io**
- Subscription fees are charged monthly in advance
- Pricing includes applicable taxes
- Automatic renewal unless cancelled
- Payment processed via secure PCI-compliant infrastructure

### 4.4 Cancellation & Refunds
- You may cancel your subscription at any time through the customer portal
- Access to premium features continues until the end of your current billing period
- **Refund Policy**: Refunds available within 30 days for monthly subscriptions, 14 days for annual subscriptions
- Contact hello@vtchat.io.vn for refund requests and assistance
- Customer support responds within 3 business days as per payment processor requirements

---

## 5. Acceptable Use Policy

### 5.1 Permitted Use
You may use VT for lawful purposes including:
- Personal and professional AI-assisted conversations
- Research, analysis, and educational activities
- Content creation, writing assistance, and brainstorming
- Productivity enhancement and workflow automation
- Code development and technical problem-solving
- Learning and skill development

### 5.2 Prohibited Activities
You may not use VT to:
- Engage in illegal activities or generate harmful, threatening, or abusive content
- Violate intellectual property rights or privacy rights of others
- Attempt to reverse engineer, hack, or compromise our systems or security
- Share accounts, violate usage limits, or abuse fair usage policies
- Collect or harvest personal data about other users
- Transmit viruses, malware, or other malicious code
- Generate spam, fraud, or deceptive content
- Bypass or circumvent subscription restrictions or access controls
- Impersonate others or misrepresent your identity

---

## 6. AI-Generated Content & Disclaimers

### 6.1 Nature of AI Responses
- **AI-generated content** is produced by third-party language models from various providers
- **Accuracy not guaranteed**: Content may not always be accurate, current, complete, or appropriate
- **No endorsement**: We do not endorse, verify, or guarantee the accuracy of AI-generated content
- **Use at your own risk**: Users must evaluate and verify AI responses independently

### 6.2 No Professional Advice
- **VT is not a substitute** for professional advice (legal, medical, financial, tax, etc.)
- **Always consult qualified professionals** before making decisions based on AI outputs
- **Informational purposes only**: Use AI responses for general information and ideation
- **No liability**: We disclaim liability for decisions made based on AI-generated content

---

## 7. Intellectual Property Rights

### 7.1 Our Rights
- VT platform, software, technology, and branding are our proprietary intellectual property
- Our trademarks, service marks, and logos are protected intellectual property
- Unauthorized use of our intellectual property is prohibited

### 7.2 Your Content
- **You retain ownership** of content you input into VT
- **Limited license granted**: You grant us a limited, non-exclusive license to process your content to provide the Service
- **Your responsibility**: You must ensure you have rights to any content you share
- **User-generated content**: You're responsible for the accuracy and legality of your inputs

### 7.3 AI Provider Terms
- Use of AI models is subject to their respective terms of service and policies
- You agree to comply with all applicable AI provider terms and usage policies
- Different providers may have different restrictions and requirements

---

## 8. Service Availability & Changes

### 8.1 Uptime & Maintenance
- We strive for high availability but **cannot guarantee 100% uptime**
- Planned maintenance will be communicated when reasonably possible
- Emergency maintenance may occur without advance notice
- **No liability** for service interruptions or downtime

### 8.2 Service Modifications
- We reserve the right to modify, suspend, or discontinue features at any time
- Significant changes will be communicated to users via email or platform notifications
- **Continued use constitutes acceptance** of changes
- **No guaranteed feature permanence**: Features may be added, modified, or removed

---

## 9. Limitation of Liability

**TO THE MAXIMUM EXTENT PERMITTED BY LAW:**

- **VT IS PROVIDED "AS IS"** WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED
- **WE DISCLAIM ALL WARRANTIES** including merchantability, fitness for purpose, and non-infringement
- **WE ARE NOT LIABLE** for any indirect, incidental, special, consequential, or punitive damages
- **OUR TOTAL LIABILITY** shall not exceed $100 USD or your last 12 months of subscription fees, whichever is greater
- **WE ARE NOT RESPONSIBLE** for AI provider outages, third-party service issues, or data loss
- **LOCAL STORAGE RISKS**: You acknowledge risks of local data storage and browser-based data loss

---

## 10. Account Termination

### 10.1 Your Rights
- You may delete your account and cease using VT at any time
- Account deletion will remove your server-stored data according to our privacy policy
- **Local data remains** on your device until manually cleared

### 10.2 Our Rights
We may suspend or terminate your account if you:
- Violate these Terms or our policies
- Engage in fraudulent, abusive, or illegal activity
- Misuse or abuse the Service or its features
- Fail to pay subscription fees (for VT+ users)

### 10.3 Effect of Termination
- **Immediate cessation** of access to VT+ features upon termination
- **Local data preserved** on your device (not automatically deleted)
- **No refund obligation** unless required by applicable law

---

## 11. Legal & Compliance

### 11.1 Governing Law
- These Terms are governed by the **laws of Vietnam**
- Any disputes will be resolved in Vietnamese courts with competent jurisdiction
- **Arbitration**: We may require binding arbitration for certain disputes

### 11.2 Changes to Terms
- We may update these Terms periodically to reflect service changes or legal requirements
- **Material changes** will be communicated via email or prominent platform notification
- **Continued use** after changes constitutes acceptance of updated Terms
- **Review regularly**: Users should review Terms periodically for updates

### 11.3 Severability & Interpretation
- If any provision is found invalid or unenforceable, remaining Terms continue in effect
- **No waiver**: Failure to enforce any provision does not waive future enforcement
- **Entire agreement**: These Terms constitute the complete agreement between parties

---

## 12. Contact Information

For questions about these Terms, please contact us:

**Email:** vtchat.io@gmail.com
**Address:** An Giang, Vietnam
**Support:** hello@vtchat.io.vn (responds within 3 business days)
**Business Hours:** Monday-Friday, 9 AM - 6 PM UTC+7 (Vietnam Time)
**Customer Portal:** Available 24/7 for subscription management through Creem.io

---

*By using VT, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.*
`;
