/**
 * Feature and tool constants for consistent usage across the application
 */

// Tool feature names (used in chat features, analytics, etc.)
export const TOOL_FEATURES = {
    WEB_SEARCH: "webSearch",
    MATH_CALCULATOR: "mathCalculator",
    CHARTS: "charts",
} as const;

// Feature toggle states
export const FEATURE_STATES = {
    ENABLED: "enabled",
    DISABLED: "disabled",
} as const;

// Settings actions
export const SETTINGS_ACTIONS = {
    SETTINGS_OPENED: "settings_opened",
    MANAGE_SUBSCRIPTION_ACCESSED: "manage_subscription_accessed",
} as const;

// Export types for better type safety
export type ToolFeature = (typeof TOOL_FEATURES)[keyof typeof TOOL_FEATURES];
export type FeatureState = (typeof FEATURE_STATES)[keyof typeof FEATURE_STATES];
export type SettingsAction = (typeof SETTINGS_ACTIONS)[keyof typeof SETTINGS_ACTIONS];

// Analytics events that were hardcoded but couldn't be added to main ANALYTICS_EVENTS due to redaction
export const ADDITIONAL_ANALYTICS_EVENTS = {
    API_KEY_ADDED: "ApiKeyAdded",
    API_KEY_REMOVED: "ApiKeyRemoved",
} as const;

// Payment event types
export const PAYMENT_EVENT_TYPES = {
    PAYMENT_STARTED: "payment_started",
    PAYMENT_COMPLETED: "payment_completed",
    PAYMENT_FAILED: "payment_failed",
} as const;

// User journey categories
export const USER_JOURNEY_CATEGORIES = {
    ONBOARDING: "onboarding",
} as const;

// Currency constants
export const CURRENCIES = {
    USD: "USD",
    EUR: "EUR",
    GBP: "GBP",
} as const;

// Payment service constants
export const PAYMENT_SERVICES = {
    CREEM: "creem",
    STRIPE: "stripe",
    PAYPAL: "paypal",
} as const;

// Subscription source constants
export const SUBSCRIPTION_SOURCES = {
    CREEM: "creem",
    NONE: "none",
} as const;

// Export types for payment events
export type PaymentEventType = (typeof PAYMENT_EVENT_TYPES)[keyof typeof PAYMENT_EVENT_TYPES];
export type UserJourneyCategory =
    (typeof USER_JOURNEY_CATEGORIES)[keyof typeof USER_JOURNEY_CATEGORIES];
export type Currency = (typeof CURRENCIES)[keyof typeof CURRENCIES];
export type PaymentService = (typeof PAYMENT_SERVICES)[keyof typeof PAYMENT_SERVICES];
export type SubscriptionSource = (typeof SUBSCRIPTION_SOURCES)[keyof typeof SUBSCRIPTION_SOURCES];
