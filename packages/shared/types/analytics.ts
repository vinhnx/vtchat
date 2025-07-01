import { PAYMENT_EVENT_TYPES, TOOL_FEATURES } from '../constants';
import { PlanSlug } from './subscription';

export interface VemetricUser {
    identifier: string;
    displayName?: string;
    email?: string;
    subscriptionTier?: PlanSlug;
    allowCookies?: boolean;
    data?: Record<string, any>;
}

export interface VemetricEventData {
    [key: string]: string | number | boolean | undefined;
}

export interface ChatEventData extends VemetricEventData {
    messageId?: string;
    modelName?: string;
    messageLength?: number;
    threadId?: string;
    responseTime?: number;
    hasAttachments?: boolean;
    toolsUsed?: string[];
}

export interface UserJourneyEvent extends VemetricEventData {
    step: string;
    value?: number;
    category?: string;
}

export interface SubscriptionEventData extends VemetricEventData {
    tier: PlanSlug;
    plan?: string;
    price?: number;
    currency?: string;
}

export interface FileEventData extends VemetricEventData {
    fileType?: string;
    fileSize?: number;
    fileName?: string; // No PII, just extension or sanitized name
}

export interface FeatureEventData extends VemetricEventData {
    featureName: string;
    context?: string;
    value?: number;
}

export interface PaymentEventData extends VemetricEventData {
    paymentMethod?: string;
    amount?: number;
    currency?: string;
    tier?: string;
    subscriptionId?: string; // Hashed/anonymized
    errorCode?: string;
    processingTime?: number;
}

export interface DocumentEventData extends VemetricEventData {
    documentType?: string;
    fileSize?: number;
    processingTime?: number;
    errorType?: string;
    pageCount?: number;
    success?: boolean;
}

export interface RagEventData extends VemetricEventData {
    queryType?: string;
    contextSize?: number;
    retrievalTime?: number;
    relevanceScore?: number;
    documentCount?: number;
    success?: boolean;
}

export interface ToolEventData extends VemetricEventData {
    toolName: string;
    executionTime?: number;
    inputSize?: number;
    outputSize?: number;
    success?: boolean;
    errorType?: string;
}

export interface PerformanceEventData extends VemetricEventData {
    duration?: number;
    resourceType?: string;
    errorCode?: string;
    retryCount?: number;
    endpoint?: string; // Domain only, no full path
}

export interface SecurityEventData extends VemetricEventData {
    eventType: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    blocked?: boolean;
    userAgent?: string; // Sanitized
    ipHash?: string; // Hashed IP for privacy
}

// Event name constants to ensure consistency
export const ANALYTICS_EVENTS = {
    // Authentication Events
    USER_SIGNED_IN: 'UserSignedIn',
    USER_SIGNED_OUT: 'UserSignedOut',
    USER_REGISTERED: 'UserRegistered',
    AUTH_METHOD_SELECTED: 'AuthMethodSelected',

    // Chat Events
    MESSAGE_SENT: 'MessageSent',
    CHAT_STARTED: 'ChatStarted',
    MODEL_SELECTED: 'ModelSelected',
    RESPONSE_RECEIVED: 'ResponseReceived',
    CONVERSATION_EXPORTED: 'ConversationExported',
    THREAD_CREATED: 'ThreadCreated',
    THREAD_DELETED: 'ThreadDeleted',

    // Feature Usage
    FILE_UPLOADED: 'FileUploaded',
    TOOL_USED: 'ToolUsed',
    SETTINGS_CHANGED: 'SettingsChanged',
    THEME_CHANGED: 'ThemeChanged',
    PROMPT_BOOST_USED: 'PromptBoostUsed',

    // Subscription Events
    SUBSCRIPTION_CREATED: 'SubscriptionCreated',
    SUBSCRIPTION_CANCELLED: 'SubscriptionCancelled',
    SUBSCRIPTION_RENEWED: 'SubscriptionRenewed',
    PLAN_UPGRADE_INITIATED: 'PlanUpgradeInitiated',
    PLAN_UPGRADE_COMPLETED: 'PlanUpgradeCompleted',

    // User Journey Events
    ONBOARDING_STARTED: 'OnboardingStarted',
    ONBOARDING_COMPLETED: 'OnboardingCompleted',
    FIRST_MESSAGE_SENT: 'FirstMessageSent',
    FEATURE_DISCOVERED: 'FeatureDiscovered',
    HELP_ACCESSED: 'HelpAccessed',

    // Navigation Events
    PAGE_VIEWED: 'PageViewed',
    EXTERNAL_LINK_CLICKED: 'ExternalLinkClicked',
    SEARCH_PERFORMED: 'SearchPerformed',

    // Error Events (no PII)
    ERROR_ENCOUNTERED: 'ErrorEncountered',
    API_ERROR: 'APIError',
    CONNECTION_FAILED: 'ConnectionFailed',

    // Performance Events
    PAGE_LOAD_TIME: 'PageLoadTime',
    API_RESPONSE_TIME: 'APIResponseTime',
    FEATURE_LOAD_TIME: 'FeatureLoadTime',

    // Additional Events (previously hardcoded)
    FEATURE_GATE_ENCOUNTERED: 'FeatureGateEncountered',
    PAYMENT_EVENT: 'PaymentEvent',

    // Critical Payment Operations
    PAYMENT_INITIATED: 'PaymentInitiated',
    PAYMENT_METHOD_SELECTED: 'PaymentMethodSelected',
    PAYMENT_VALIDATION_FAILED: 'PaymentValidationFailed',
    PAYMENT_PROCESSING_ERROR: 'PaymentProcessingError',

    // Document & RAG Operations
    DOCUMENT_UPLOADED: 'DocumentUploaded',
    DOCUMENT_PROCESSED: 'DocumentProcessed',
    DOCUMENT_PROCESSING_FAILED: 'DocumentProcessingFailed',
    RAG_QUERY_EXECUTED: 'RagQueryExecuted',
    RAG_CONTEXT_RETRIEVED: 'RagContextRetrieved',

    // Tool Operations (using constants from features.ts)
    WEB_SEARCH_EXECUTED: 'WebSearchExecuted',
    WEB_SEARCH_FAILED: 'WebSearchFailed',
    MATH_CALCULATION_EXECUTED: 'MathCalculationExecuted',
    CHART_GENERATED: 'ChartGenerated',

    // Performance & Reliability
    RESPONSE_TIMEOUT: 'ResponseTimeout',
    RATE_LIMIT_EXCEEDED: 'RateLimitExceeded',
    QUOTA_EXCEEDED: 'QuotaExceeded',
    SERVICE_UNAVAILABLE: 'ServiceUnavailable',

    // Security Events
    SUSPICIOUS_ACTIVITY: 'SuspiciousActivity',
    SESSION_EXPIRED: 'SessionExpired',

    // Premium Features
    PREMIUM_FEATURE_ACCESSED: 'PremiumFeatureAccessed',
    FEATURE_LIMIT_REACHED: 'FeatureLimitReached',
} as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

// Helper constants and mappings from features.ts
export const TOOL_ANALYTICS_MAPPING = {
    [TOOL_FEATURES.WEB_SEARCH]: ANALYTICS_EVENTS.WEB_SEARCH_EXECUTED,
    [TOOL_FEATURES.MATH_CALCULATOR]: ANALYTICS_EVENTS.MATH_CALCULATION_EXECUTED,
    [TOOL_FEATURES.CHARTS]: ANALYTICS_EVENTS.CHART_GENERATED,
} as const;

export const PAYMENT_ANALYTICS_MAPPING = {
    [PAYMENT_EVENT_TYPES.PAYMENT_STARTED]: ANALYTICS_EVENTS.PAYMENT_INITIATED,
    [PAYMENT_EVENT_TYPES.PAYMENT_COMPLETED]: ANALYTICS_EVENTS.PLAN_UPGRADE_COMPLETED,
    [PAYMENT_EVENT_TYPES.PAYMENT_FAILED]: ANALYTICS_EVENTS.PAYMENT_PROCESSING_ERROR,
} as const;

// User properties for segmentation (no PII)
export interface UserProperties {
    subscriptionTier: PlanSlug;
    accountAge?: number; // Days since registration
    messageCount?: number;
    lastActiveDate?: string;
    preferredModel?: string;
    themePreference?: 'light' | 'dark' | 'system';
    timezone?: string;
    locale?: string;
    deviceType?: 'desktop' | 'mobile' | 'tablet';
    browserName?: string;
    referralSource?: string;
    featureFlags?: string[];
}

// Configuration for the analytics system
export interface VemetricConfig {
    token: string;
    enabled: boolean;
    debug?: boolean;
    host?: string;
    scriptUrl?: string;
    trackPageViews?: boolean;
    trackOutboundLinks?: boolean;
    trackDataAttributes?: boolean;
    maskPaths?: string[];
    allowCookies?: boolean;
}
