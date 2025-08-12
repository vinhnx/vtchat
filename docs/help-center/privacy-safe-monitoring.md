# Privacy-Safe Traffic Monitoring - Help Center

## Overview

VTChat implements privacy-first traffic monitoring to optimize our global infrastructure without compromising user privacy.

## What We Monitor

### ✅ What We Log

- **Region codes only**: 3-letter codes like "sin", "iad", "ams"
- **Aggregate statistics**: Total requests per region
- **Infrastructure optimization**: Server placement decisions

### ❌ What We DON'T Log

- **IP addresses**: Never logged or stored
- **Personal information**: No user identification
- **Detailed location**: No city/country level tracking
- **User behavior**: No individual user tracking

## How It Works

```
User Request → Fly.io Edge → Region Code → Our Logs
    ↓              ↓            ↓           ↓
[Personal]    [Geographic]  [Anonymous]  [Aggregate]
```

**Example Log Entry:**

```
[Traffic] Region: iad
```

This tells us a request came through our Virginia region, but nothing about who made the request.

## Privacy Compliance

### GDPR Compliance

- ✅ **Not personal data**: Region codes cannot identify individuals
- ✅ **Legitimate interest**: Infrastructure optimization
- ✅ **Minimal data**: Only essential information collected
- ✅ **Transparent purpose**: Clearly stated business need

### Data Protection

- ✅ **No user profiles**: Cannot link data to individuals
- ✅ **Ephemeral storage**: Logs automatically rotate/delete
- ✅ **Access controlled**: Only our engineering team can view
- ✅ **No third parties**: Data never shared externally

## Why We Monitor

### Better User Experience

- **Faster response times**: Place servers closer to users
- **Reduced latency**: Target <50ms response times globally
- **Smart scaling**: Add regions based on actual usage

### Cost Optimization

- **Data-driven decisions**: Only add regions with real demand
- **Resource efficiency**: Avoid over-provisioning
- **Budget management**: Scale infrastructure cost-effectively

## How We Use The Data

### Scaling Decisions

```bash
# If we see patterns like:
# 50 [Traffic] Region: sin
# 25 [Traffic] Region: iad  ← Consistent US traffic
# 3 [Traffic] Region: ams

# We might add US region for better user experience
```

### Infrastructure Optimization

- **Add US region**: When seeing consistent American users
- **Add EU region**: When seeing consistent European users
- **Remove unused regions**: If traffic drops in certain areas

## Data Retention

- **Fly.io logs**: Automatically rotated (typically 7-30 days)
- **No permanent storage**: We don't save this data to databases
- **No analytics platforms**: Not sent to Google Analytics, etc.
- **Memory only**: Used for immediate scaling decisions

## Your Rights

### Under GDPR

Since region codes are not personal data, standard GDPR rights don't apply to this monitoring. However, you can:

- **Contact us**: Ask questions about our monitoring
- **Request information**: Learn more about our practices
- **Provide feedback**: Suggest improvements to our approach

### Opting Out

Since no personal data is collected, there's no opt-out mechanism needed. The monitoring is:

- **Anonymous by design**
- **Cannot be linked to you**
- **Used only for infrastructure**

## Transparency Report

### What Changed

- **Added**: Region-level traffic monitoring (December 2024)
- **Privacy-first design**: No PII collection from day one
- **Purpose**: Support global expansion for US market

### Data Volume

- **Minimal footprint**: ~10-50 log entries per day
- **No growth over time**: Doesn't accumulate personal data
- **Aggregate only**: Individual entries meaningless

## Technical Details

### Implementation

```typescript
// Our actual implementation
const flyRegion = request.headers.get('Fly-Region') || 'unknown';
console.log(`[Traffic] Region: ${flyRegion}`);
```

### Data Flow

1. **User visits site** → Fly.io routes request
2. **Fly.io adds region header** → Standard infrastructure header
3. **Our middleware logs region** → Anonymous 3-letter code only
4. **Engineering reviews patterns** → Monthly infrastructure decisions

## Contact & Questions

- **Privacy concerns**: privacy@vtchat.io.vn
- **Technical questions**: support@vtchat.io.vn
- **General feedback**: Contact form in app

## Alternative Approaches

If you prefer even more privacy, we considered these alternatives:

### Option 1: No Logging

- **Pros**: Zero data collection
- **Cons**: Cannot optimize user experience globally

### Option 2: Sampling

- **Implementation**: Log only 1% of requests
- **Pros**: Even less data
- **Cons**: Slower infrastructure decisions

### Current Approach (Chosen)

- **Best balance**: Privacy protection + user experience optimization
- **Minimal data**: Only region codes
- **Maximum benefit**: Fast, global AI chat experience

## Updates to This Policy

We'll update this documentation if our monitoring approach changes, always with privacy-first principles.

**Last Updated**: December 2024\
**Next Review**: March 2025
