import {
    ANALYTICS_EVENTS,
    type ChatEventData,
    type DocumentEventData,
    type FeatureEventData,
    type FileEventData,
    type PaymentEventData,
    type PerformanceEventData,
    type RagEventData,
    type SecurityEventData,
    type SubscriptionEventData,
    type ToolEventData,
    type UserJourneyEvent,
    type UserProperties,
} from "@repo/shared/types/analytics";
import type { PlanSlug } from "@repo/shared/types/subscription";

// Generic event data type for analytics
type EventData = Record<string, string | number | boolean | undefined>;

/**
 * Utility functions for analytics tracking
 * Analytics are currently disabled - all functions are no-ops
 */
export class AnalyticsUtils {
    private static isEnabled(): boolean {
        return false; // Analytics disabled
    }

    private static sanitizeData(_data: EventData): EventData {
        // Analytics disabled - return empty object
        return {};
    }

    /**
     * Create chat event data with proper sanitization
     * Analytics disabled - returns minimal structure for type compatibility
     */
    static createChatEventData(_params: {
        messageId?: string;
        modelName?: string;
        messageLength?: number;
        threadId?: string;
        responseTime?: number;
        hasAttachments?: boolean;
        toolsUsed?: string[];
    }): ChatEventData {
        // Analytics disabled - return minimal structure
        return {};
    }

    /**
     * Create subscription event data
     * Analytics disabled - returns minimal structure for type compatibility
     */
    static createSubscriptionEventData(params: {
        tier: PlanSlug;
        plan?: string;
        price?: number;
        currency?: string;
    }): SubscriptionEventData {
        // Analytics disabled - return minimal structure
        return { tier: params.tier };
    }

    /**
     * Create file event data (no PII)
     * Analytics disabled - returns minimal structure for type compatibility
     */
    static createFileEventData(_params: {
        fileType?: string;
        fileSize?: number;
        fileName?: string;
    }): FileEventData {
        // Analytics disabled - return minimal structure
        return {};
    }

    /**
     * Create feature usage event data
     * Analytics disabled - returns minimal structure for type compatibility
     */
    static createFeatureEventData(params: {
        featureName: string;
        context?: string;
        value?: number;
    }): FeatureEventData {
        // Analytics disabled - return minimal structure
        return { featureName: params.featureName };
    }

    /**
     * Create user journey event data
     * Analytics disabled - returns minimal structure for type compatibility
     */
    static createUserJourneyEventData(params: {
        step: string;
        value?: number;
        category?: string;
    }): UserJourneyEvent {
        // Analytics disabled - return minimal structure
        return { step: params.step };
    }

    /**
     * Create user properties without PII
     * Analytics disabled - returns minimal structure for type compatibility
     */
    static createUserProperties(params: {
        subscriptionTier: PlanSlug;
        accountAge?: number;
        messageCount?: number;
        preferredModel?: string;
        themePreference?: "light" | "dark" | "system";
        timezone?: string;
        locale?: string;
        deviceType?: "desktop" | "mobile" | "tablet";
        browserName?: string;
        referralSource?: string;
        featureFlags?: string[];
    }): UserProperties {
        // Analytics disabled - return minimal structure
        return { subscriptionTier: params.subscriptionTier };
    }

    /**
     * Log analytics events for debugging
     * Analytics disabled - no-op function
     */
    static logEvent(_eventName: string, _data?: EventData): void {
        // Analytics disabled - no-op
        return;
    }

    /**
     * Generate performance timing data
     * Analytics disabled - returns minimal structure for type compatibility
     */
    static createPerformanceData(_startTime: number): EventData {
        // Analytics disabled - return minimal structure
        return {};
    }

    /**
     * Get device and browser information (non-PII)
     * Analytics disabled - returns minimal structure for type compatibility
     */
    static getDeviceInfo(): Partial<UserProperties> {
        // Analytics disabled - return minimal structure
        return {};
    }

    /**
     * Create a timer for performance tracking
     * Analytics disabled - returns no-op timer
     */
    static createTimer() {
        return {
            end: () => AnalyticsUtils.createPerformanceData(0),
        };
    }
}

// Export commonly used event names for easy access
export { ANALYTICS_EVENTS };

// Helper functions for event data creation - all disabled, return minimal structures
export const createPaymentEventData = (params: {
    tier: string;
    amount?: number;
    currency?: string;
    paymentMethod?: string;
    processingTime?: number;
}): PaymentEventData => ({
    tier: params.tier,
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
    timestamp: Date.now(),
});

export const createRagEventData = (_params: {
    queryType?: string;
    documentCount?: number;
    retrievalTime?: number;
    contextSize?: number;
    success?: boolean;
}): RagEventData => ({
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
    timestamp: Date.now(),
});

export const createPerformanceEventData = (_params: {
    duration: number;
    endpoint?: string;
    resourceType?: string;
    success?: boolean;
    errorCode?: string;
}): PerformanceEventData => ({
    timestamp: Date.now(),
});

export const createSecurityEventData = (params: {
    eventType: string;
    severity?: "low" | "medium" | "high" | "critical";
    blocked?: boolean;
    userAgent?: string;
}): SecurityEventData => ({
    eventType: params.eventType,
    timestamp: Date.now(),
});

// Type-safe event tracking functions - all no-ops
export const trackChatEvent = (_eventName: string, _data: ChatEventData) => {
    // Analytics disabled - no-op
};

export const trackUserJourney = (_eventName: string, _data: UserJourneyEvent) => {
    // Analytics disabled - no-op
};

export const trackFeatureUsage = (_eventName: string, _data: FeatureEventData) => {
    // Analytics disabled - no-op
};

export const trackSubscriptionEvent = (_eventName: string, _data: SubscriptionEventData) => {
    // Analytics disabled - no-op
};
