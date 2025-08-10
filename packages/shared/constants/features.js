/**
 * Feature and tool constants for consistent usage across the application
 */
// Tool feature names (used in chat features, analytics, etc.)
export var TOOL_FEATURES = {
    WEB_SEARCH: "webSearch",
    MATH_CALCULATOR: "mathCalculator",
    CHARTS: "charts",
};
// Feature toggle states
export var FEATURE_STATES = {
    ENABLED: "enabled",
    DISABLED: "disabled",
};
// Settings actions
export var SETTINGS_ACTIONS = {
    SETTINGS_OPENED: "settings_opened",
    MANAGE_SUBSCRIPTION_ACCESSED: "manage_subscription_accessed",
};
// Analytics events that were hardcoded but couldn't be added to main ANALYTICS_EVENTS due to redaction
export var ADDITIONAL_ANALYTICS_EVENTS = {
    API_KEY_ADDED: "ApiKeyAdded",
    API_KEY_REMOVED: "ApiKeyRemoved",
};
// Payment event types
export var PAYMENT_EVENT_TYPES = {
    PAYMENT_STARTED: "payment_started",
    PAYMENT_COMPLETED: "payment_completed",
    PAYMENT_FAILED: "payment_failed",
};
// User journey categories
export var USER_JOURNEY_CATEGORIES = {
    ONBOARDING: "onboarding",
};
// Currency constants
export var CURRENCIES = {
    USD: "USD",
    EUR: "EUR",
    GBP: "GBP",
};
// Payment service constants
export var PAYMENT_SERVICES = {
    CREEM: "creem",
    STRIPE: "stripe",
    PAYPAL: "paypal",
};
// Subscription source constants
export var SUBSCRIPTION_SOURCES = {
    CREEM: "creem",
    NONE: "none",
};
