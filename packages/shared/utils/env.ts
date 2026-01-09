import { log } from '../src/lib/logger';
import { EnvironmentType } from '../types/environment';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

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
 * Development-only logging utility using pino
 */
export const devLog = {
    log: (...args: any[]) => {
        if (!IS_PRODUCTION) {
            log.info({ data: args }, 'devLog');
        }
    },
    warn: (...args: any[]) => {
        if (!IS_PRODUCTION) {
            log.warn({ data: args }, 'devLog warning');
        }
    },
    error: (...args: any[]) => {
        // Always log errors, even in production
        log.error({ data: args }, 'devLog error');
    },
    info: (...args: any[]) => {
        if (!IS_PRODUCTION) {
            log.info({ data: args }, 'devLog info');
        }
    },
    debug: (...args: any[]) => {
        if (!IS_PRODUCTION) {
            log.debug({ data: args }, 'devLog debug');
        }
    },
};

/**
 * Production-safe logging that only shows errors and warnings using pino
 */
export const prodSafeLog = {
    log: (...args: any[]) => {
        if (!IS_PRODUCTION) {
            log.info({ data: args }, 'prodSafeLog');
        }
    },
    warn: (...args: any[]) => {
        log.warn({ data: args }, 'prodSafeLog warning');
    },
    error: (...args: any[]) => {
        // Always log errors even in production
        log.error({ data: args }, 'prodSafeLog error');
    },
    info: (...args: any[]) => {
        if (!IS_PRODUCTION) {
            log.info({ data: args }, 'prodSafeLog info');
        }
    },
    debug: (...args: any[]) => {
        if (!IS_PRODUCTION) {
            log.debug({ data: args }, 'prodSafeLog debug');
        }
    },
};
