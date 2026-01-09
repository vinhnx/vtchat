/**
 * Pino-based structured logger for VTChat
 *
 * Features:
 * - Structured JSON logging in production
 * - Pretty-printed output in development
 * - Automatic PII redaction for sensitive fields
 * - Log levels: debug (dev only), info, warn, error, fatal
 * - Child logger support for request tracing
 * - Timer utilities for performance monitoring
 *
 * Usage:
 * import { log } from '@repo/shared/logger';
 * log.info({ userId: '123' }, 'User logged in');
 * log.error({ error, requestId }, 'Request failed');
 */
import type { Logger } from 'pino';
import pino from 'pino';

// Detect if we're running in Next.js
const isNextJs = typeof window === 'undefined'
    && typeof process !== 'undefined'
    && (!!process.env.__NEXT_PRIVATE_ORIGIN || !!process.env.NEXT_RUNTIME);

// Detect browser environment
const isBrowser = typeof window !== 'undefined';

// PII fields that should be automatically redacted
const PII_FIELDS = [
    'email',
    'password',
    'token',
    'apiKey',
    'api_key',
    'accessToken',
    'access_token',
    'refreshToken',
    'refresh_token',
    'sessionId',
    'session_id',
    'userId',
    'user_id',
    'ip',
    'ipAddress',
    'ip_address',
    'phoneNumber',
    'phone_number',
    'phone',
    'ssn',
    'socialSecurityNumber',
    'creditCard',
    'credit_card',
    'ccNumber',
    'cc_number',
    'authorization',
    'Authorization',
    'cookie',
    'Cookie',
];

// Create redaction paths for nested objects
const redactPaths = [
    ...PII_FIELDS,
    ...PII_FIELDS.map((field) => `*.${field}`),
    ...PII_FIELDS.map((field) => `headers.${field}`),
    ...PII_FIELDS.map((field) => `body.${field}`),
    ...PII_FIELDS.map((field) => `data.${field}`),
    ...PII_FIELDS.map((field) => `user.${field}`),
    ...PII_FIELDS.map((field) => `request.${field}`),
    ...PII_FIELDS.map((field) => `response.${field}`),
    // Special header fields
    'headers["x-api-key"]',
    'headers["X-API-Key"]',
    'headers["set-cookie"]',
    'headers["Set-Cookie"]',
];

// Environment detection
const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

// Logger configuration
const loggerConfig: pino.LoggerOptions = {
    level: isDevelopment ? 'debug' : 'info',
    redact: {
        paths: redactPaths,
        censor: '[REDACTED]',
    },
    serializers: {
        err: pino.stdSerializers.err,
        error: pino.stdSerializers.err,
        req: (req: any) => {
            const serialized = pino.stdSerializers.req(req);
            if (serialized?.headers) {
                const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];
                sensitiveHeaders.forEach((header) => {
                    if (serialized.headers[header]) {
                        serialized.headers[header] = '[REDACTED]';
                    }
                });
            }
            return serialized;
        },
        res: pino.stdSerializers.res,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
        level(label: string) {
            return { level: label };
        },
    },
};

// Test configuration (silent output)
if (isTest) {
    loggerConfig.level = 'silent';
}

// Browser configuration (use browser-compatible transport)
if (isBrowser) {
    loggerConfig.browser = {
        asObject: true,
        transmit: {
            level: 'warn',
            send: (level, logEvent) => {
                // In production, could send to external logging service
                // For now, just use console in browser
            },
        },
    };
}

// Create logger instance
let logger: Logger;

try {
    logger = pino(loggerConfig);
} catch {
    // Fallback to a simple console-based logger if pino fails to initialize
    // This can happen in some browser/edge environments
    const createFallbackLogger = (): any => {
        const noop = () => {};
        const logMethod = (level: string) => (...args: any[]) => {
            if (isTest) return;
            const [first, ...rest] = args;
            if (typeof first === 'object' && rest.length > 0) {
                // eslint-disable-next-line no-console
                console[level as keyof Console]?.(`[${level.toUpperCase()}]`, rest[0], first);
            } else {
                // eslint-disable-next-line no-console
                console[level as keyof Console]?.(`[${level.toUpperCase()}]`, ...args);
            }
        };

        return {
            info: logMethod('info'),
            warn: logMethod('warn'),
            error: logMethod('error'),
            debug: isDevelopment ? logMethod('debug') : noop,
            fatal: logMethod('error'),
            trace: isDevelopment ? logMethod('debug') : noop,
            child: () => createFallbackLogger(),
        };
    };

    logger = createFallbackLogger() as unknown as Logger;
}

// Export as 'log' - this is the primary export to use
export const log = logger;

// Child logger creation helper
export const createChildLogger = (bindings: Record<string, any>) => {
    return logger.child(bindings);
};

// Performance timing helper
export const createTimer = (name: string) => {
    const start = Date.now();
    return {
        end: (metadata?: Record<string, any>) => {
            const duration = Date.now() - start;
            log.info({ ...metadata, duration, timer: name }, `Timer: ${name} completed`);
            return duration;
        },
    };
};

// Request ID helper for tracing
export const withRequestId = (requestId: string) => {
    return createChildLogger({ requestId });
};

// Middleware helper for Next.js API routes
export const withLogging = (handler: any) => {
    return async (req: any, res: any) => {
        const requestId = req.headers['x-request-id']
            || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const reqLogger = withRequestId(requestId);

        // Add logger to request object
        req.log = reqLogger;

        const start = Date.now();

        try {
            const result = await handler(req, res);
            const duration = Date.now() - start;

            log.info(
                {
                    method: req.method,
                    url: req.url,
                    status: res.statusCode,
                    duration,
                    userAgent: req.headers['user-agent'],
                },
                'API request completed',
            );

            return result;
        } catch (error) {
            const duration = Date.now() - start;

            log.error(
                {
                    method: req.method,
                    url: req.url,
                    duration,
                    error: error instanceof Error
                        ? {
                            message: error.message,
                            name: error.name,
                            stack: error.stack,
                        }
                        : String(error),
                },
                'API request failed',
            );

            throw error;
        }
    };
};

// Export default logger (same as 'log')
export default log;
