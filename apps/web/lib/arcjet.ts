import { createArcjetConfig, createChatArcjet, createAuthArcjet, createAPIArcjet, createFeedbackArcjet } from '@repo/shared/lib/arcjet-config';
import { ARCJET_ENV_KEYS } from '@repo/shared/constants';
import { logger } from '@repo/shared/logger';

// Get Arcjet API key from environment
const ARCJET_KEY = process.env[ARCJET_ENV_KEYS.ARCJET_KEY];

if (!ARCJET_KEY) {
    logger.warn('[Arcjet] ARCJET_KEY environment variable is not set. Security features will be disabled.');
}

// Create Arcjet instances for different use cases
export const arcjetChat = ARCJET_KEY ? createChatArcjet(ARCJET_KEY) : null;
export const arcjetAuth = ARCJET_KEY ? createAuthArcjet(ARCJET_KEY) : null;
export const arcjetAPI = ARCJET_KEY ? createAPIArcjet(ARCJET_KEY) : null;
export const arcjetFeedback = ARCJET_KEY ? createFeedbackArcjet(ARCJET_KEY) : null;

// Default Arcjet instance for general protection
export const arcjetDefault = ARCJET_KEY ? createArcjetConfig({
    key: ARCJET_KEY,
    enableBot: true,
    enableShield: true,
    enableRateLimit: true,
    rateLimitConfig: {
        algorithm: 'slidingWindow',
        max: 60,
        interval: '1h',
    },
    characteristics: ['ip.src'],
}) : null;

// Helper to get the appropriate Arcjet instance based on route
export const getArcjetForRoute = (pathname: string) => {
    if (!ARCJET_KEY) return null;
    
    if (pathname.startsWith('/api/chat')) {
        return arcjetChat;
    }
    
    if (pathname.startsWith('/api/auth')) {
        return arcjetAuth;
    }
    
    if (pathname.startsWith('/api/feedback')) {
        return arcjetFeedback;
    }
    
    if (pathname.startsWith('/api/')) {
        return arcjetAPI;
    }
    
    return arcjetDefault;
};

// Re-export utilities
export { handleArcjetDecision } from '@repo/shared/lib/arcjet-config';
export type { ArcjetRequest, ArcjetDecision } from '@repo/shared/lib/arcjet-config';
