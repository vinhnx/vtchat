import { log } from '@repo/shared/logger';
import { 
    ANALYTICS_EVENTS, 
    type VemetricEventData, 
    type ChatEventData,
    type UserJourneyEvent,
    type SubscriptionEventData,
    type FileEventData,
    type FeatureEventData,
    type UserProperties,
    type PaymentEventData,
    type DocumentEventData,
    type RagEventData,
    type ToolEventData,
    type PerformanceEventData,
    type SecurityEventData
} from '@repo/shared/types/analytics';
import { PlanSlug } from '@repo/shared/types/subscription';

/**
 * Utility functions for Vemetric analytics tracking
 * Ensures consistent event tracking across the application
 */
export class AnalyticsUtils {
    private static isEnabled(): boolean {
        return process.env.NEXT_PUBLIC_VEMETRIC_TOKEN ? true : false;
    }

    private static sanitizeData(data: VemetricEventData): VemetricEventData {
        const sanitized: VemetricEventData = {};
        
        for (const [key, value] of Object.entries(data)) {
            // Skip potentially sensitive fields
            if (this.isPotentiallyPII(key)) {
                continue;
            }
            
            // Sanitize values
            if (typeof value === 'string') {
                sanitized[key] = this.sanitizeString(value);
            } else {
                sanitized[key] = value;
            }
        }
        
        return sanitized;
    }

    private static isPotentiallyPII(key: string): boolean {
        const piiPatterns = [
            'email', 'password', 'token', 'secret', 'key', 'auth',
            'phone', 'address', 'name', 'username', 'ssn', 'id'
        ];
        
        const lowerKey = key.toLowerCase();
        return piiPatterns.some(pattern => lowerKey.includes(pattern));
    }

    private static sanitizeString(value: string): string {
        // Remove potential PII patterns and limit length
        return value
            .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[email]')
            .replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[card]')
            .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[phone]')
            .substring(0, 100); // Limit length
    }

    /**
     * Create chat event data with proper sanitization
     */
    static createChatEventData(params: {
        messageId?: string;
        modelName?: string;
        messageLength?: number;
        threadId?: string;
        responseTime?: number;
        hasAttachments?: boolean;
        toolsUsed?: string[];
    }): ChatEventData {
        return this.sanitizeData({
            messageId: params.messageId?.substring(0, 8), // Only first 8 chars for correlation
            modelName: params.modelName,
            messageLength: params.messageLength,
            threadId: params.threadId?.substring(0, 8), // Only first 8 chars
            responseTime: params.responseTime,
            hasAttachments: params.hasAttachments,
            toolsUsed: params.toolsUsed?.join(','),
        }) as ChatEventData;
    }

    /**
     * Create subscription event data
     */
    static createSubscriptionEventData(params: {
        tier: PlanSlug;
        plan?: string;
        price?: number;
        currency?: string;
    }): SubscriptionEventData {
        return this.sanitizeData({
            tier: params.tier,
            plan: params.plan,
            price: params.price,
            currency: params.currency,
        }) as SubscriptionEventData;
    }

    /**
     * Create file event data (no PII)
     */
    static createFileEventData(params: {
        fileType?: string;
        fileSize?: number;
        fileName?: string;
    }): FileEventData {
        return this.sanitizeData({
            fileType: params.fileType,
            fileSize: params.fileSize,
            fileName: params.fileName ? this.sanitizeFileName(params.fileName) : undefined,
        }) as FileEventData;
    }

    private static sanitizeFileName(fileName: string): string {
        // Only keep extension and basic info, remove potential PII
        const extension = fileName.split('.').pop();
        return extension ? `file.${extension}` : 'file';
    }

    /**
     * Create feature usage event data
     */
    static createFeatureEventData(params: {
        featureName: string;
        context?: string;
        value?: number;
    }): FeatureEventData {
        return this.sanitizeData({
            featureName: params.featureName,
            context: params.context,
            value: params.value,
        }) as FeatureEventData;
    }

    /**
     * Create user journey event data
     */
    static createUserJourneyEventData(params: {
        step: string;
        value?: number;
        category?: string;
    }): UserJourneyEvent {
        return this.sanitizeData({
            step: params.step,
            value: params.value,
            category: params.category,
        }) as UserJourneyEvent;
    }

    /**
     * Create user properties without PII
     */
    static createUserProperties(params: {
        subscriptionTier: PlanSlug;
        accountAge?: number;
        messageCount?: number;
        preferredModel?: string;
        themePreference?: 'light' | 'dark' | 'system';
        timezone?: string;
        locale?: string;
        deviceType?: 'desktop' | 'mobile' | 'tablet';
        browserName?: string;
        referralSource?: string;
        featureFlags?: string[];
    }): UserProperties {
        return {
            subscriptionTier: params.subscriptionTier,
            accountAge: params.accountAge,
            messageCount: params.messageCount,
            lastActiveDate: new Date().toISOString().split('T')[0], // Date only
            preferredModel: params.preferredModel,
            themePreference: params.themePreference,
            timezone: params.timezone,
            locale: params.locale,
            deviceType: params.deviceType,
            browserName: params.browserName,
            referralSource: params.referralSource,
            featureFlags: params.featureFlags,
        };
    }

    /**
     * Log analytics events for debugging
     */
    static logEvent(eventName: string, data?: VemetricEventData): void {
        if (!this.isEnabled()) return;
        
        log.debug(
            { 
                analyticsEvent: eventName, 
                eventData: data,
                timestamp: new Date().toISOString()
            }, 
            'Analytics event tracked'
        );
    }

    /**
     * Generate performance timing data
     */
    static createPerformanceData(startTime: number): VemetricEventData {
        const duration = performance.now() - startTime;
        return {
            duration: Math.round(duration),
            timestamp: Date.now(),
        };
    }

    /**
     * Get device and browser information (non-PII)
     */
    static getDeviceInfo(): Partial<UserProperties> {
        if (typeof window === 'undefined') return {};

        const ua = navigator.userAgent;
        const deviceType = /Mobile|Android|iPhone|iPad/.test(ua) 
            ? /iPad/.test(ua) ? 'tablet' : 'mobile'
            : 'desktop';

        const browserName = ua.includes('Chrome') ? 'Chrome' :
                          ua.includes('Firefox') ? 'Firefox' :
                          ua.includes('Safari') ? 'Safari' :
                          ua.includes('Edge') ? 'Edge' : 'Unknown';

        return {
            deviceType,
            browserName,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            locale: navigator.language,
        };
    }

    /**
     * Create a timer for performance tracking
     */
    static createTimer() {
        const startTime = performance.now();
        return {
            end: () => this.createPerformanceData(startTime)
        };
    }
}

// Export commonly used event names for easy access
// Helper functions for new event types
export const createPaymentEventData = (params: {
    tier: string;
    amount?: number;
    currency?: string;
    paymentMethod?: string;
    processingTime?: number;
}): PaymentEventData => ({
    tier: params.tier,
    amount: params.amount,
    currency: params.currency,
    paymentMethod: params.paymentMethod,
    processingTime: params.processingTime,
    timestamp: Date.now(),
});

export const createDocumentEventData = (params: {
    documentType: string;
    fileSize: number;
    processingTime?: number;
    success?: boolean;
    errorType?: string;
}): DocumentEventData => ({
    documentType: params.documentType,
    fileSize: params.fileSize,
    processingTime: params.processingTime,
    success: params.success,
    errorType: params.errorType,
    timestamp: Date.now(),
});

export const createRagEventData = (params: {
    queryType?: string;
    documentCount?: number;
    retrievalTime?: number;
    contextSize?: number;
    success?: boolean;
}): RagEventData => ({
    queryType: params.queryType,
    documentCount: params.documentCount,
    retrievalTime: params.retrievalTime,
    contextSize: params.contextSize,
    success: params.success,
    timestamp: Date.now(),
});

export const createToolEventData = (params: {
    toolName: string;
    executionTime?: number;
    success?: boolean;
    errorType?: string;
    inputSize?: number;
    outputSize?: number;
}): ToolEventData => ({
    toolName: params.toolName,
    executionTime: params.executionTime,
    success: params.success,
    errorType: params.errorType,
    inputSize: params.inputSize,
    outputSize: params.outputSize,
    timestamp: Date.now(),
});

export const createPerformanceEventData = (params: {
    duration: number;
    endpoint?: string;
    resourceType?: string;
    success?: boolean;
    errorCode?: string;
}): PerformanceEventData => ({
    duration: params.duration,
    endpoint: params.endpoint,
    resourceType: params.resourceType,
    success: params.success,
    errorCode: params.errorCode,
    timestamp: Date.now(),
});

export const createSecurityEventData = (params: {
    eventType: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    blocked?: boolean;
    userAgent?: string;
}): SecurityEventData => ({
    eventType: params.eventType,
    severity: params.severity,
    blocked: params.blocked,
    userAgent: params.userAgent,
    timestamp: Date.now(),
});

export { ANALYTICS_EVENTS };

// Type-safe event tracking functions
export const trackChatEvent = (eventName: string, data: ChatEventData) => {
    AnalyticsUtils.logEvent(eventName, data);
};

export const trackUserJourney = (eventName: string, data: UserJourneyEvent) => {
    AnalyticsUtils.logEvent(eventName, data);
};

export const trackFeatureUsage = (eventName: string, data: FeatureEventData) => {
    AnalyticsUtils.logEvent(eventName, data);
};

export const trackSubscriptionEvent = (eventName: string, data: SubscriptionEventData) => {
    AnalyticsUtils.logEvent(eventName, data);
};
