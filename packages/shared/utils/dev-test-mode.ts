/**
 * DEV TEST MODE utility
 *
 * This utility provides a centralized way to bypass all restrictions
 * (credits, subscriptions, gated features) for development and testing purposes.
 */

/**
 * Check if DEV TEST MODE is enabled
 */
export const isDevTestMode = (): boolean => {
    return process.env.NEXT_PUBLIC_DEV_TEST_MODE === 'true';
};

/**
 * Bypass restrictions in DEV TEST MODE
 */
export const withDevTestModeBypass = <T>(
    restrictedValue: T,
    unrestrictedValue: T,
    context?: string
): T => {
    if (isDevTestMode()) {
        if (context) {
            console.log(`🚧 DEV TEST MODE: Bypassing restriction - ${context}`);
        }
        return unrestrictedValue;
    }
    return restrictedValue;
};

/**
 * Async bypass for DEV TEST MODE
 */
export const withDevTestModeBypassAsync = async <T>(
    restrictedValue: T | Promise<T>,
    unrestrictedValue: T | Promise<T>,
    context?: string
): Promise<T> => {
    if (isDevTestMode()) {
        if (context) {
            console.log(`🚧 DEV TEST MODE: Bypassing restriction (async) - ${context}`);
        }
        return await unrestrictedValue;
    }
    return await restrictedValue;
};

/**
 * Log DEV TEST MODE actions
 */
export const logDevTestModeAction = (action: string, details?: Record<string, any>): void => {
    if (isDevTestMode()) {
        console.log(`🚧 DEV TEST MODE: ${action}`, details);
    }
};
