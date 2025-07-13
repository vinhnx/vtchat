import { createId, verifyId } from 'legid';
import { log } from '../logger-simple';

// Shared salt for client/server sync - must be consistent across all environments
const THREAD_ID_SALT = 'vtchat-thread:';
const THREAD_ID_LENGTH = 10;

/**
 * Generate a new thread ID using legid following official documentation
 * Safe for client-side generation, verifiable on server-side
 *
 * @returns Promise<string> A legid-generated thread ID
 */
export async function generateThreadId(): Promise<string> {
    try {
        // Use legid exactly as documented - client-side generation
        const id = await createId({
            approximateLength: THREAD_ID_LENGTH,
            salt: THREAD_ID_SALT,
        });

        log.debug({ id, length: id.length }, 'Generated legid thread ID');
        return id;
    } catch (error) {
        log.error({ error }, 'Legid generation failed, using fallback');
        // Fallback to temporary ID if legid fails
        return generateFallbackId();
    }
}

/**
 * DEPRECATED: Synchronous generation not recommended
 * legid is async-only by design for security reasons
 * Use generateThreadId() instead when possible
 */
export function generateThreadIdSync(): string {
    log.warn('Synchronous thread ID generation requested - this should be avoided');
    return generateFallbackId();
}

/**
 * Generate a secure fallback ID when legid is unavailable
 * Uses crypto.getRandomValues when available for better security
 */
function generateFallbackId(): string {
    try {
        // Use crypto.getRandomValues if available (browser/Node 19+)
        if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
            const array = new Uint8Array(16);
            crypto.getRandomValues(array);
            const randomHex = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
                ''
            );
            return `tmp_${Date.now().toString(36)}_${randomHex.substring(0, 12)}`;
        }
    } catch (error) {
        log.warn({ error }, 'Crypto fallback failed, using Math.random');
    }

    // Fallback to Math.random if crypto is unavailable
    const timestamp = Date.now().toString(36);
    const random1 = Math.random().toString(36).substring(2, 8);
    const random2 = Math.random().toString(36).substring(2, 8);
    return `tmp_${timestamp}_${random1}${random2}`;
}

/**
 * Verify a thread ID following legid documentation
 * Server-side verification of client-generated IDs
 *
 * @param id The thread ID to verify
 * @returns Promise<boolean> True if ID is valid legid or acceptable fallback
 */
export async function verifyThreadId(id: string): Promise<boolean> {
    if (!id || typeof id !== 'string') {
        log.warn({ id }, 'Invalid thread ID format');
        return false;
    }

    // Accept temporary fallback IDs as valid (not ideal but functional)
    if (isTemporaryThreadId(id)) {
        log.debug({ id }, 'Verified temporary thread ID');
        return true;
    }

    // Accept legacy thread IDs during migration period
    if (isLegacyThreadId(id)) {
        log.debug({ id }, 'Verified legacy thread ID');
        return true;
    }

    try {
        // Verify using legid with same salt as generation
        const isValid = await verifyId(id, {
            salt: THREAD_ID_SALT,
        });

        log.debug({ id, isValid }, 'Legid verification result');
        return isValid;
    } catch (error) {
        log.error({ error, id }, 'Thread ID verification failed');
        return false;
    }
}

/**
 * Check if a thread ID uses the old format (nanoid/uuid) or temporary fallback
 * Used for migration purposes and identifying non-legid IDs
 */
export function isLegacyThreadId(id: string): boolean {
    // Legacy IDs are either:
    // - nanoid: 21 characters, alphanumeric + _ and -
    // - uuid: 36 characters with dashes
    // - temporary fallback: starts with 'tmp_'
    const nanoidPattern = /^[A-Za-z0-9_-]{21}$/;
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return nanoidPattern.test(id) || uuidPattern.test(id) || id.startsWith('tmp_');
}

/**
 * Check if a thread ID is a temporary fallback ID
 * These should be replaced with proper legid IDs ASAP
 */
export function isTemporaryThreadId(id: string): boolean {
    return id.startsWith('tmp_');
}
