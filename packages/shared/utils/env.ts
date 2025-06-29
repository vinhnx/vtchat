import { EnvironmentType } from '../types/environment';
import { logger } from '@repo/shared/logger';

/**
 * Checks if the current environment is production.
 * It considers CREEM_ENVIRONMENT first, then NODE_ENV.
 * @returns {boolean} True if the environment is production, false otherwise.
 */
export function isProductionEnvironment(): boolean {
    const currentEnv = getCurrentEnvironmentType();
    return currentEnv === EnvironmentType.PRODUCTION;
}

/**
 * Checks if the current environment is sandbox.
 * It considers CREEM_ENVIRONMENT first, then NODE_ENV.
 * @returns {boolean} True if the environment is sandbox, false otherwise.
 */
export function isSandboxEnvironment(): boolean {
    const currentEnv = getCurrentEnvironmentType();
    return currentEnv === EnvironmentType.SANDBOX;
}

/**
 * Gets the current environment type.
 * It checks `process.env.CREEM_ENVIRONMENT` first. If that's not set or invalid,
 * it falls back to `process.env.NODE_ENV`.
 * Defaults to DEVELOPMENT if neither is a recognized value.
 * @returns {EnvironmentType} The current environment type.
 */
export function getCurrentEnvironmentType(): EnvironmentType {
    const creemEnv = process.env.CREEM_ENVIRONMENT?.toLowerCase();
    if (creemEnv === EnvironmentType.PRODUCTION) {
        return EnvironmentType.PRODUCTION;
    }
    if (creemEnv === EnvironmentType.SANDBOX) {
        return EnvironmentType.SANDBOX;
    }

    const nodeEnv = process.env.NODE_ENV?.toLowerCase();
    if (nodeEnv === EnvironmentType.PRODUCTION) {
        return EnvironmentType.PRODUCTION;
    }
    // Assuming sandbox for non-production NODE_ENV if CREEM_ENVIRONMENT is not explicitly production
    // This aligns with typical development/staging setups often pointing to sandbox services.
    if (nodeEnv === EnvironmentType.DEVELOPMENT) {
        return EnvironmentType.DEVELOPMENT;
    }

    // Default to DEVELOPMENT if no specific environment is matched.
    // Or, if specific sandbox detection is needed for NODE_ENV:
    // if (nodeEnv === 'test' || nodeEnv === 'staging') return EnvironmentType.SANDBOX;

    return EnvironmentType.DEVELOPMENT;
}

/**
 * Development environment detection utilities
 */
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

/**
 * Development-only console logging utility
 */
export const devLog = {
    log: (...args: any[]) => {
        if (isDevelopment) {
            console.log(...args);
        }
    },
    warn: (...args: any[]) => {
        if (isDevelopment) {
            console.warn(...args);
        }
    },
    error: (...args: any[]) => {
        if (isDevelopment) {
            console.error(...args);
        }
    },
    info: (...args: any[]) => {
        if (isDevelopment) {
            console.info(...args);
        }
    },
    debug: (...args: any[]) => {
        if (isDevelopment) {
            console.debug(...args);
        }
    },
};

/**
 * Production-safe console logging that only shows errors and warnings
 */
export const prodSafeLog = {
    log: (...args: any[]) => {
        if (isDevelopment) {
            console.log(...args);
        }
    },
    warn: (...args: any[]) => {
        console.warn(...args);
    },
    error: (...args: any[]) => {
        console.error(...args);
    },
    info: (...args: any[]) => {
        if (isDevelopment) {
            console.info(...args);
        }
    },
    debug: (...args: any[]) => {
        if (isDevelopment) {
            console.debug(...args);
        }
    },
};
