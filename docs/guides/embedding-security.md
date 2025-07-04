# Embedding Content Security

## Overview

This document outlines the security measures implemented to protect user privacy in the RAG (Retrieval-Augmented Generation) system's embeddings storage.

## Problem

The embeddings table was storing user content in plain text in the `content` column, exposing sensitive information including:

- Email addresses
- Phone numbers
- Credit card numbers
- Social Security Numbers
- IP addresses
- URLs with sensitive parameters

## Solution

### 1. PII Detection and Masking

The system now automatically detects and masks Personally Identifiable Information (PII) before storing content in the embeddings table.

**Patterns Detected:**

- Email addresses → `[EMAIL_REDACTED]`
- Phone numbers → `[PHONE_REDACTED]`
- Credit cards → `[CARD_REDACTED]`
- Social Security Numbers → `[SSN_REDACTED]`
- IP addresses → `[IP_REDACTED]`
- URLs → `[URL_REDACTED]`
- Home addresses → `[ADDRESS_REDACTED]`
- Apartment/Unit numbers → `[UNIT_REDACTED]`
- ZIP codes → `[ZIP_REDACTED]`

### 2. Content Truncation

Long content (>500 characters) is truncated and hashed to prevent database bloat while maintaining privacy:

- Preview: First 100 characters (with PII masked)
- Hash: SHA-256 hash (first 16 characters)
- Format: `{preview}... [HASH:{hash}]`

### 3. Implementation

**Core Functions** (`apps/web/lib/utils/content-security.ts`):

- `maskPII(content)` - Masks PII in content
- `containsPII(content)` - Detects if content has PII
- `secureContentForEmbedding(content)` - Main security function
- `createContentHash(content)` - Creates secure hash for long content

**Integration** (`apps/web/lib/actions/resources.ts`):

```typescript
// Before: storing raw content
content: embedding.content,

// After: storing secured content
content: secureContentForEmbedding(embedding.content),
```

### 4. Migration

**Database Migration** (`0006_secure_embeddings_content.sql`):

- Creates temporary backup column
- Adds performance indexes
- Documents security changes

**Data Migration** (`scripts/secure-embeddings-migration.ts`):

- Processes existing embeddings in batches
- Applies PII masking to existing data
- Maintains audit trail

## Usage

### Running the Migration

```bash
# 1. Apply database schema changes
bun db:migrate

# 2. Migrate existing data
bun tsx scripts/secure-embeddings-migration.ts
```

### Testing

```bash
bun test app/tests/content-security.test.ts
```

## Security Benefits

1. **Privacy Protection**: PII is masked before storage
2. **Data Minimization**: Only necessary content is stored
3. **Audit Trail**: Migration maintains backup for verification
4. **Performance**: Truncated content reduces storage overhead
5. **Compliance**: Helps meet privacy regulations (GDPR, CCPA)

## Verification

After migration, verify security by checking the embeddings table:

```sql
SELECT content FROM embeddings LIMIT 10;
```

Content should show masked patterns like `[EMAIL_REDACTED]` instead of actual PII.

## Maintenance

- Monitor for new PII patterns that may need masking
- Regularly review and update security patterns
- Consider adding encryption for additional protection
- Implement retention policies for embedding data

## Next Steps

1. Consider implementing end-to-end encryption
2. Add user consent tracking for data processing
3. Implement data deletion workflows
4. Add security monitoring and alerting

## Production Deployment

✅ **Production Ready**: The security implementation is automatically applied when:

- RAG feature is deployed to production
- Embeddings table is created with built-in security
- All new content automatically gets PII masking
- No additional migration needed for production

The production database (`autumn-block-60790575`) currently has only auth tables and will inherit all security measures when RAG features are deployed.
