import arcjet, {
    type ArcjetRequest,
    type ArcjetDecision,
    type BotOptions,
    type EmailOptions,
    type ProtectSignupOptions,
    type SlidingWindowRateLimitOptions,
    detectBot,
    protectSignup,
    shield,
    slidingWindow,
    fixedWindow,
    tokenBucket,
    validateEmail,
} from '@arcjet/next';

// Arcjet configuration for different protection levels
export const createArcjetConfig = (options: {
    key: string;
    enableBot?: boolean;
    enableShield?: boolean;
    enableRateLimit?: boolean;
    rateLimitConfig?: {
        algorithm: 'slidingWindow' | 'fixedWindow' | 'tokenBucket';
        max: number;
        interval: string;
        capacity?: number;
        refillRate?: number;
    };
    enableEmailValidation?: boolean;
    characteristics?: string[];
}) => {
    const {
        key,
        enableBot = true,
        enableShield = true,
        enableRateLimit = true,
        rateLimitConfig = {
            algorithm: 'slidingWindow',
            max: 100,
            interval: '1h',
        },
        enableEmailValidation = false,
        characteristics = ['ip.src'],
    } = options;

    const rules = [];

    // Shield protects against common attacks
    if (enableShield) {
        rules.push(shield({ mode: 'LIVE' }));
    }

    // Bot protection
    if (enableBot) {
        rules.push(
            detectBot({
                mode: 'LIVE',
                allow: [
                    'CATEGORY:SEARCH_ENGINE', // Google, Bing, etc.
                    // Add other allowed bots as needed
                ],
            })
        );
    }

    // Rate limiting
    if (enableRateLimit) {
        switch (rateLimitConfig.algorithm) {
            case 'slidingWindow':
                rules.push(
                    slidingWindow({
                        mode: 'LIVE',
                        interval: rateLimitConfig.interval,
                        max: rateLimitConfig.max,
                    })
                );
                break;
            case 'fixedWindow':
                rules.push(
                    fixedWindow({
                        mode: 'LIVE',
                        window: rateLimitConfig.interval,
                        max: rateLimitConfig.max,
                    })
                );
                break;
            case 'tokenBucket':
                rules.push(
                    tokenBucket({
                        mode: 'LIVE',
                        capacity: rateLimitConfig.capacity || 100,
                        interval: rateLimitConfig.interval,
                        refillRate: rateLimitConfig.refillRate || 10,
                    })
                );
                break;
        }
    }

    // Email validation
    if (enableEmailValidation) {
        rules.push(
            validateEmail({
                mode: 'LIVE',
                block: ['DISPOSABLE', 'INVALID', 'NO_MX_RECORDS'],
            })
        );
    }

    return arcjet({
        key,
        characteristics,
        rules,
    });
};

// Predefined configurations for different use cases
export const createChatArcjet = (key: string) =>
    createArcjetConfig({
        key,
        enableBot: true,
        enableShield: true,
        enableRateLimit: true,
        rateLimitConfig: {
            algorithm: 'slidingWindow',
            max: 50,
            interval: '1h',
        },
        characteristics: ['userId', 'ip.src'],
    });

export const createAuthArcjet = (key: string) =>
    createArcjetConfig({
        key,
        enableBot: true,
        enableShield: true,
        enableRateLimit: true,
        rateLimitConfig: {
            algorithm: 'fixedWindow',
            max: 10,
            interval: '10m',
        },
        enableEmailValidation: true,
        characteristics: ['ip.src'],
    });

export const createAPIArcjet = (key: string) =>
    createArcjetConfig({
        key,
        enableBot: true,
        enableShield: true,
        enableRateLimit: true,
        rateLimitConfig: {
            algorithm: 'tokenBucket',
            max: 100,
            interval: '1m',
            capacity: 100,
            refillRate: 50,
        },
        characteristics: ['ip.src'],
    });

export const createFeedbackArcjet = (key: string) =>
    createArcjetConfig({
        key,
        enableBot: true,
        enableShield: true,
        enableRateLimit: true,
        rateLimitConfig: {
            algorithm: 'slidingWindow',
            max: 5,
            interval: '10m',
        },
        enableEmailValidation: true,
        characteristics: ['ip.src'],
    });

// Response helpers
export const handleArcjetDecision = (decision: ArcjetDecision) => {
    if (decision.isDenied()) {
        if (decision.reason.isBot()) {
            return {
                status: 403,
                body: { error: 'Bot traffic not allowed', type: 'BOT_DENIED' },
            };
        }
        
        if (decision.reason.isRateLimit()) {
            return {
                status: 429,
                body: { 
                    error: 'Rate limit exceeded', 
                    type: 'RATE_LIMIT_EXCEEDED',
                    retryAfter: '3600' // 1 hour
                },
            };
        }
        
        if (decision.reason.isEmail()) {
            return {
                status: 400,
                body: { 
                    error: 'Invalid email address', 
                    type: 'EMAIL_INVALID' 
                },
            };
        }
        
        if (decision.reason.isShield()) {
            return {
                status: 403,
                body: { 
                    error: 'Request blocked by security rules', 
                    type: 'SHIELD_BLOCKED' 
                },
            };
        }
        
        return {
            status: 403,
            body: { error: 'Request denied', type: 'GENERAL_DENIED' },
        };
    }
    
    return null;
};

// Better Auth specific configurations
export const createBetterAuthEmailOptions = (): EmailOptions => ({
    mode: 'LIVE',
    block: ['DISPOSABLE', 'INVALID', 'NO_MX_RECORDS'],
});

export const createBetterAuthBotOptions = (): BotOptions => ({
    mode: 'LIVE',
    allow: [], // Prevent bots from submitting auth forms
});

export const createBetterAuthRateLimitOptions = (): SlidingWindowRateLimitOptions<[]> => ({
    mode: 'LIVE',
    interval: '2m',
    max: 5, // Allow 5 auth attempts within 2 minutes
});

export const createBetterAuthSignupOptions = (): ProtectSignupOptions<[]> => ({
    email: createBetterAuthEmailOptions(),
    bots: createBetterAuthBotOptions(),
    rateLimit: createBetterAuthRateLimitOptions(),
});

// Enhanced auth Arcjet for Better Auth integration
export const createBetterAuthArcjet = (key: string) =>
    arcjet({
        key,
        characteristics: ['userId'],
        rules: [
            shield({
                mode: 'LIVE',
            }),
        ],
    });

// Type exports
export type { 
    ArcjetRequest, 
    ArcjetDecision, 
    BotOptions, 
    EmailOptions, 
    ProtectSignupOptions, 
    SlidingWindowRateLimitOptions 
};
