import { EnvironmentType } from '../types/environment';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * Checks if the current environment is production.
 * @returns {boolean} True if the environment is production, false otherwise.
 */
export function isProductionEnvironment(): boolean {
    const currentEnv = getCurrentEnvironmentType();
    return currentEnv === EnvironmentType.PRODUCTION;
}

/**
 * Checks if the current environment is sandbox.
 * @returns {boolean} True if the environment is sandbox, false otherwise.
 */
export function isSandboxEnvironment(): boolean {
    const currentEnv = getCurrentEnvironmentType();
    return currentEnv === EnvironmentType.SANDBOX;
}

/**
 * Gets the current environment type.
 * It checks `process.env.NODE_ENV` and defaults to DEVELOPMENT if needed.
 * @returns {EnvironmentType} The current environment type.
 */
export function getCurrentEnvironmentType(): EnvironmentType {
    const nodeEnv = process.env.NODE_ENV?.toLowerCase();
    if (nodeEnv === EnvironmentType.PRODUCTION) {
        return EnvironmentType.PRODUCTION;
    }
    if (nodeEnv === EnvironmentType.DEVELOPMENT) {
        return EnvironmentType.DEVELOPMENT;
    }

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
    log: (..._args: any[]) => {
        if (!IS_PRODUCTION) {
        }
    },
    warn: (..._args: any[]) => {
        if (!IS_PRODUCTION) {
        }
    },
    error: (..._args: any[]) => {
        // Always log errors, even in production
    },
    info: (..._args: any[]) => {
        if (!IS_PRODUCTION) {
        }
    },
    debug: (..._args: any[]) => {
        if (!IS_PRODUCTION) {
        }
    },
};

/**
 * Production-safe console logging that only shows errors and warnings
 */
export const prodSafeLog = {
    log: (..._args: any[]) => {
        if (!IS_PRODUCTION) {
        }
    },
    warn: (..._args: any[]) => {
    },
    error: (..._args: any[]) => {
        // Always log errors even in production
    },
    info: (..._args: any[]) => {
        if (!IS_PRODUCTION) {
        }
    },
    debug: (..._args: any[]) => {
        if (!IS_PRODUCTION) {
        }
    },
};
