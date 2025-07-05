import { log } from '@repo/shared/logger';
/**
 * Storage cleanup utilities for handling corrupted localStorage data
 */

/**
 * Clean up corrupted localStorage entries for per-account isolation stores
 */
export function cleanupCorruptedStorage(): void {
    if (typeof window === 'undefined') return;

    // log.info('[StorageCleanup] Starting cleanup of potentially corrupted storage entries...'); // Removed - too verbose for production

    // Get all localStorage keys that match our per-account patterns
    const storageKeys = Object.keys(localStorage);
    const accountStorageKeys = storageKeys.filter(
        (key) =>
            key.startsWith('api-keys-storage-') ||
            key.startsWith('mcp-tools-storage-') ||
            key.startsWith('chat-config-')
    );

    let cleanedCount = 0;

    for (const key of accountStorageKeys) {
        try {
            const value = localStorage.getItem(key);
            if (value && value.trim()) {
                // Try to parse the JSON to validate it
                JSON.parse(value);
            }
        } catch (error) {
            log.warn({ key, error }, '[StorageCleanup] Removing corrupted entry');
            localStorage.removeItem(key);
            cleanedCount++;
        }
    }

    // Clean up deprecated RAG onboarding keys
    cleanupDeprecatedRagKeys();

    if (cleanedCount > 0) {
        log.info({ count: cleanedCount }, '[StorageCleanup] Cleaned up corrupted storage entries');
    }
    // else {
    //     log.info('[StorageCleanup] No corrupted storage entries found'); // Removed - too verbose for production
    // }
}

/**
 * Clean up deprecated RAG onboarding localStorage keys
 * These are no longer used since the free trial system was removed
 */
function cleanupDeprecatedRagKeys(): void {
    const deprecatedKeys = ['rag-onboarding-completed', 'rag-system-usage-count'];

    for (const key of deprecatedKeys) {
        if (localStorage.getItem(key) !== null) {
            localStorage.removeItem(key);
            // log.info({ key }, '[StorageCleanup] Removed deprecated RAG key'); // Removed - only log if multiple keys found
        }
    }
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(value: string | null, fallback: T): T {
    if (!value) {
        return fallback;
    }

    // Clean the value to handle edge cases
    const cleanValue = value.trim();
    if (!cleanValue) {
        return fallback;
    }

    // Handle common malformed cases
    if (cleanValue === 'undefined' || cleanValue === 'null') {
        return fallback;
    }

    // Check if it starts and ends with proper JSON characters
    if (
        !(
            (cleanValue.startsWith('{') && cleanValue.endsWith('}')) ||
            (cleanValue.startsWith('[') && cleanValue.endsWith(']')) ||
            (cleanValue.startsWith('"') && cleanValue.endsWith('"'))
        )
    ) {
        log.warn(
            { value: cleanValue.substring(0, 100) },
            '[StorageCleanup] Invalid JSON format, using fallback'
        );
        return fallback;
    }

    try {
        const parsed = JSON.parse(cleanValue);
        return parsed;
    } catch (error) {
        log.warn(
            { value: cleanValue.substring(0, 100), error },
            '[StorageCleanup] Failed to parse JSON, using fallback'
        );
        return fallback;
    }
}

/**
 * Initialize storage cleanup on application start
 */
export function initializeStorageCleanup(): void {
    if (typeof window === 'undefined') return;

    // Run cleanup on page load
    cleanupCorruptedStorage();

    // Set up periodic cleanup (every 5 minutes)
    setInterval(cleanupCorruptedStorage, 5 * 60 * 1000);
}
