import { log } from "@repo/shared/logger";

/**
 * Key rotation and security management utilities
 *
 * SECURITY: Implements secure key management practices including rotation,
 * validation, and secure storage patterns.
 */

export interface ApiKeyMetadata {
    readonly provider: string;
    readonly keyId: string;
    readonly createdAt: number;
    readonly lastUsed?: number;
    readonly expiresAt?: number;
    readonly isActive: boolean;
    readonly rotationReminder?: number;
}

export interface KeyRotationConfig {
    readonly maxAge: number; // Maximum age in milliseconds
    readonly reminderThreshold: number; // When to show rotation reminder (days before expiry)
    readonly validateInterval: number; // How often to validate keys (milliseconds)
    readonly maxFailedAttempts: number; // Max failed validation attempts before marking inactive
}

/**
 * Default rotation configuration - conservative security settings
 */
export const DEFAULT_ROTATION_CONFIG: KeyRotationConfig = {
    maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
    reminderThreshold: 7, // 7 days warning
    validateInterval: 24 * 60 * 60 * 1000, // Daily validation
    maxFailedAttempts: 3,
} as const;

/**
 * Secure key comparison that prevents timing attacks
 */
export function secureCompareKeys(a: string, b: string): boolean {
    if (a.length !== b.length) {
        return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
}

/**
 * Masks an API key for safe display
 */
export function maskApiKey(key: string): string {
    if (!key || key.length < 8) {
        return "****";
    }

    const prefix = key.substring(0, 4);
    const suffix = key.substring(key.length - 4);
    const masked = "*".repeat(Math.max(4, key.length - 8));

    return `${prefix}${masked}${suffix}`;
}

/**
 * Generates a unique key identifier for rotation tracking
 */
export function generateKeyId(provider: string, keyPrefix: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${provider}_${keyPrefix}_${timestamp}_${random}`;
}

/**
 * Checks if a key needs rotation based on age and usage
 */
export function needsRotation(
    metadata: ApiKeyMetadata,
    config: KeyRotationConfig = DEFAULT_ROTATION_CONFIG,
): boolean {
    const now = Date.now();
    const age = now - metadata.createdAt;

    // Check if key has expired
    if (metadata.expiresAt && now > metadata.expiresAt) {
        return true;
    }

    // Check if key is too old
    if (age > config.maxAge) {
        return true;
    }

    // Key is still valid
    return false;
}

/**
 * Checks if a rotation reminder should be shown
 */
export function shouldShowRotationReminder(
    metadata: ApiKeyMetadata,
    config: KeyRotationConfig = DEFAULT_ROTATION_CONFIG,
): boolean {
    const now = Date.now();
    const reminderTime = config.reminderThreshold * 24 * 60 * 60 * 1000; // Convert days to ms

    // Check against expiry date
    if (metadata.expiresAt) {
        return now > metadata.expiresAt - reminderTime;
    }

    // Check against max age
    const keyAge = now - metadata.createdAt;
    const maxAge = config.maxAge;
    return keyAge > maxAge - reminderTime;
}

/**
 * Creates metadata for a new API key
 */
export function createKeyMetadata(
    provider: string,
    key: string,
    expiresAt?: number,
): ApiKeyMetadata {
    const keyPrefix = key.substring(0, Math.min(4, key.length));

    return {
        provider,
        keyId: generateKeyId(provider, keyPrefix),
        createdAt: Date.now(),
        expiresAt,
        isActive: true,
    };
}

/**
 * Validates an API key format without exposing the key value
 */
export function validateKeyFormat(
    provider: string,
    key: string,
): {
    isValid: boolean;
    reason?: string;
} {
    if (!key || typeof key !== "string") {
        return { isValid: false, reason: "Key must be a non-empty string" };
    }

    // Basic length validation (provider-specific logic can be added)
    if (key.length < 8) {
        return { isValid: false, reason: "Key too short" };
    }

    if (key.length > 512) {
        return { isValid: false, reason: "Key too long" };
    }

    // Provider-specific validation
    switch (provider.toLowerCase()) {
        case "openai":
            if (!key.startsWith("sk-")) {
                return { isValid: false, reason: "OpenAI keys must start with 'sk-'" };
            }
            break;
        case "anthropic":
            if (!key.startsWith("sk-ant-")) {
                return { isValid: false, reason: "Anthropic keys must start with 'sk-ant-'" };
            }
            break;
        case "openrouter":
            if (!key.startsWith("sk-or-")) {
                return { isValid: false, reason: "OpenRouter keys must start with 'sk-or-'" };
            }
            break;
    }

    return { isValid: true };
}

/**
 * Securely logs key operations without exposing sensitive data
 */
export function logKeyOperation(
    operation: "created" | "rotated" | "validated" | "expired" | "failed",
    provider: string,
    success: boolean = true,
): void {
    // SECURITY: Never log actual key values or detailed metadata
    log.info(
        {
            operation,
            provider,
            success,
            timestamp: Date.now(),
        },
        `API key ${operation}`,
    );
}

/**
 * Key rotation reminder utility
 */
export class KeyRotationReminder {
    private reminders = new Map<string, number>();

    shouldRemind(keyId: string, metadata: ApiKeyMetadata): boolean {
        const lastReminder = this.reminders.get(keyId) || 0;
        const oneDayMs = 24 * 60 * 60 * 1000;

        // Only remind once per day
        if (Date.now() - lastReminder < oneDayMs) {
            return false;
        }

        const shouldRemind = shouldShowRotationReminder(metadata);
        if (shouldRemind) {
            this.reminders.set(keyId, Date.now());
        }

        return shouldRemind;
    }

    clearReminder(keyId: string): void {
        this.reminders.delete(keyId);
    }
}
