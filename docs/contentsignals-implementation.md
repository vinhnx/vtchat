# VTChat Content Signals Implementation

**Date:** January 6, 2025  
**Standard:** IETF AI Preferences (aipref) via contentsignals.org

## Overview

VTChat implements the IETF AI Preferences standard to control how automated systems (search engines, AI crawlers) can use our content. This implementation prioritizes PII protection while allowing appropriate use of public information.

## Implementation Details

### robots.txt Configuration

**Location:** `apps/web/public/robots.txt`

**Structure:**
- **Group 1:** Search engines (googlebot, bingbot, OAI-Searchbot) - Block all sensitive areas
- **Group 2:** All other crawlers - Same blocking rules with additional public content permissions

**Blocked Areas:**
- `/profile/` - User account information
- `/rag/` - Personal AI assistant content  
- `/api/` - All API endpoints
- `/chat/` - All chat conversations and threads

**Allowed Areas:**
- `/about`, `/faq`, `/privacy`, `/terms` - Public informational content
- Root `/` - General public content

### HTTP Header Controls

**Location:** `apps/web/next.config.mjs`

**Protected Routes:**
- **API Endpoints** (`/api/:path*`)
  - `Content-Usage: tdm=n, search=n, inference=n`
  - `X-Robots-Tag: noindex, nofollow`
  - `Cache-Control: private, no-store`

- **Chat Routes** (`/chat`, `/chat/:path*`)
  - `Content-Usage: tdm=n, search=n, inference=n`
  - `X-Robots-Tag: noindex, nofollow`
  - `Cache-Control: private, no-store`

- **Profile & RAG** (`/profile/:path*`, `/rag/:path*`)
  - `Content-Usage: tdm=n, search=n, inference=n`
  - `X-Robots-Tag: noindex, nofollow`

**Public Routes:**
- **Informational Pages** (`/about`, `/faq`, `/privacy`, `/terms`)
  - `Content-Usage: tdm=y` (Allow AI training)

- **Default Routes**
  - `Content-Usage: tdm=n, search=y, inference=y`

## Security Measures

### PII Protection
1. **Complete Chat Blocking** - No search indexing of conversations
2. **Profile Privacy** - User data completely protected
3. **RAG Security** - Personal AI content blocked
4. **API Protection** - Server endpoints secured

### Technical Controls
1. **Dual Protection** - Both robots.txt and HTTP headers
2. **Cache Prevention** - Private, no-store policies
3. **Search Blocking** - X-Robots-Tag headers
4. **Standards Compliance** - IETF aipref syntax

## Content Usage Directives

| Directive | Meaning |
|-----------|---------|
| `tdm=y` | Allow text and data mining (AI training) |
| `tdm=n` | Prohibit text and data mining |
| `search=y` | Allow search engine indexing |
| `search=n` | Prohibit search engine indexing |
| `inference=y` | Allow AI inference use |
| `inference=n` | Prohibit AI inference use |

## Route Classification

### Completely Protected (No Access)
- `/profile/` - User profiles and settings
- `/rag/` - Personal AI assistant knowledge base
- `/api/` - All server API endpoints
- `/chat/` - All chat conversations and threads

### AI Training Allowed
- `/about` - Company information
- `/faq` - Frequently asked questions
- `/privacy` - Privacy policy
- `/terms` - Terms of service

### Limited Access (Search Only)
- All other public routes (homepage, etc.)

## Oracle Security Review

The implementation was reviewed by Oracle (o3 reasoning model) which identified and helped fix:

1. **robots.txt Group Precedence** - Fixed multiple User-Agent groups issue
2. **PII Exposure Risk** - Added complete chat blocking
3. **API Endpoint Vulnerability** - Added comprehensive API protection
4. **Header Coverage Gaps** - Implemented full route protection

## Standards Compliance

- ✅ **IETF AI Preferences (aipref)** - Proper syntax and semantics
- ✅ **RFC 9309 robots.txt** - Correct grouping and precedence
- ✅ **HTTP Headers** - Standard Content-Usage implementation
- ✅ **Security Headers** - X-Robots-Tag and Cache-Control

## Validation

To verify implementation:

1. **Check robots.txt:** Visit `/robots.txt`
2. **Inspect headers:** Use browser dev tools on different routes
3. **Test crawler behavior:** Monitor search engine indexing
4. **Verify blocking:** Confirm sensitive routes are not indexed

## Contact

For questions about this implementation:
- Email: hello@vtchat.io.vn
- Documentation: https://contentsignals.org/

## Change Log

- **2025-01-06:** Initial implementation with Oracle security review
- **2025-01-06:** Fixed critical PII protection gaps
- **2025-01-06:** Updated privacy policy and terms of service
