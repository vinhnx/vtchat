/**
 * Feature and tool constants for consistent usage across the application
 */
export declare const TOOL_FEATURES: {
    readonly WEB_SEARCH: "webSearch";
    readonly MATH_CALCULATOR: "mathCalculator";
    readonly CHARTS: "charts";
};
export declare const FEATURE_STATES: {
    readonly ENABLED: "enabled";
    readonly DISABLED: "disabled";
};
export declare const SETTINGS_ACTIONS: {
    readonly SETTINGS_OPENED: "settings_opened";
    readonly MANAGE_SUBSCRIPTION_ACCESSED: "manage_subscription_accessed";
};
export type ToolFeature = (typeof TOOL_FEATURES)[keyof typeof TOOL_FEATURES];
export type FeatureState = (typeof FEATURE_STATES)[keyof typeof FEATURE_STATES];
export type SettingsAction = (typeof SETTINGS_ACTIONS)[keyof typeof SETTINGS_ACTIONS];
export declare const ADDITIONAL_ANALYTICS_EVENTS: {
    readonly API_KEY_ADDED: "ApiKeyAdded";
    readonly API_KEY_REMOVED: "ApiKeyRemoved";
};
export declare const PAYMENT_EVENT_TYPES: {
    readonly PAYMENT_STARTED: "payment_started";
    readonly PAYMENT_COMPLETED: "payment_completed";
    readonly PAYMENT_FAILED: "payment_failed";
};
export declare const USER_JOURNEY_CATEGORIES: {
    readonly ONBOARDING: "onboarding";
};
export declare const CURRENCIES: {
    readonly USD: "USD";
    readonly EUR: "EUR";
    readonly GBP: "GBP";
};
export declare const PAYMENT_SERVICES: {
    readonly CREEM: "creem";
    readonly STRIPE: "stripe";
    readonly PAYPAL: "paypal";
};
export declare const SUBSCRIPTION_SOURCES: {
    readonly CREEM: "creem";
    readonly NONE: "none";
};
export type PaymentEventType = (typeof PAYMENT_EVENT_TYPES)[keyof typeof PAYMENT_EVENT_TYPES];
export type UserJourneyCategory = (typeof USER_JOURNEY_CATEGORIES)[keyof typeof USER_JOURNEY_CATEGORIES];
export type Currency = (typeof CURRENCIES)[keyof typeof CURRENCIES];
export type PaymentService = (typeof PAYMENT_SERVICES)[keyof typeof PAYMENT_SERVICES];
export type SubscriptionSource = (typeof SUBSCRIPTION_SOURCES)[keyof typeof SUBSCRIPTION_SOURCES];
//# sourceMappingURL=features.d.ts.map