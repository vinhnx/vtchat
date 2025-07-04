import crypto from 'crypto';

/**
 * PII patterns for masking sensitive content
 */
const PII_PATTERNS = [
    // Email addresses
    {
        pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        replacement: '[EMAIL_REDACTED]',
    },
    // Phone numbers (various formats)
    {
        pattern: /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g,
        replacement: '[PHONE_REDACTED]',
    },
    // Credit card numbers
    { pattern: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g, replacement: '[CARD_REDACTED]' },
    // ZIP codes (US format) - Must come before SSN to avoid conflicts
    { pattern: /\b\d{5}(?:-\d{4})?\b/g, replacement: '[ZIP_REDACTED]' },
    // SSN (more specific pattern to avoid ZIP conflicts)
    { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: '[SSN_REDACTED]' },
    // IP addresses
    { pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, replacement: '[IP_REDACTED]' },
    // URLs with potential sensitive info
    { pattern: /https?:\/\/[^\s]+/g, replacement: '[URL_REDACTED]' },
    // Home addresses (street addresses with numbers)
    {
        pattern:
            /\b\d{1,6}\s+[A-Za-z\s]{1,50}(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Court|Ct|Place|Pl|Way|Circle|Cir|Loop|Parkway|Pkwy|Highway|Hwy)\b/gi,
        replacement: '[ADDRESS_REDACTED]',
    },
    // International addresses (number followed by multiple words, like "173 Truong Dinh")
    {
        pattern:
            /\b\d{1,6}\s+[A-Za-z]+(?:\s+[A-Za-z]+){1,4}(?:\s*,?\s*(?:TP|Quan|District|Ward|City|Province|State)\s+[\w\s]+)?\b/gi,
        replacement: '[ADDRESS_REDACTED]',
    },
    // Apartment/unit numbers
    {
        pattern: /\b(?:Apt|Apartment|Unit|Suite|Ste)\.?\s*#?\s*[A-Za-z0-9-]+\b/gi,
        replacement: '[UNIT_REDACTED]',
    },
];

/**
 * Masks PII in content while preserving semantic meaning for embeddings
 */
export function maskPII(content: string): string {
    let maskedContent = content;

    for (const { pattern, replacement } of PII_PATTERNS) {
        maskedContent = maskedContent.replace(pattern, replacement);
    }

    return maskedContent;
}

/**
 * Creates a secure hash of content for storage
 * Uses first 100 chars + hash for human readability while maintaining security
 */
export function createContentHash(content: string): string {
    const preview = content.substring(0, 100).replace(/\s+/g, ' ').trim();
    const hash = crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
    return `${maskPII(preview)}... [HASH:${hash}]`;
}

/**
 * Determines if content contains potential PII
 */
export function containsPII(content: string): boolean {
    return PII_PATTERNS.some(({ pattern }) => pattern.test(content));
}

/**
 * Secure content for embedding storage
 * - For PII content: return masked version
 * - For non-PII: return truncated version with hash
 */
export function secureContentForEmbedding(content: string): string {
    if (containsPII(content)) {
        return maskPII(content);
    }

    // For non-PII content, still limit storage to prevent bloat
    if (content.length > 500) {
        return createContentHash(content);
    }

    return content;
}
