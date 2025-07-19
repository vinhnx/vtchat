/**
 * UI-related constants for the VT application
 * Contains button text, tooltips, and other UI string constants
 */

export const BUTTON_TEXT = {
    MANAGE_SUBSCRIPTION: 'Subscription Portal',
    MANAGE_BILLING: 'Manage Billing',
    UPGRADE_TO_PLUS: 'Upgrade to VT+',
    LOADING: 'Loading...',
    OPENING_PORTAL: 'Opening Portal...',
} as const;

export const TOOLTIP_TEXT = {
    MANAGE_SUBSCRIPTION_NEW_TAB: 'Manage subscription (opens in new tab)',
    MANAGE_BILLING_NEW_TAB: 'Manage billing (opens in new tab)',
    UPGRADE_TO_PLUS: 'Upgrade to VT+',
} as const;

export const LOADING_MESSAGES = {
    FETCHING_PORTAL_URL: 'Getting portal URL...',
    OPENING_PORTAL: 'Opening portal...',
    SYNCING_SUBSCRIPTION: 'Syncing subscription...',
    UPDATING_STATUS: 'Updating your account status',
    SUBSCRIPTION_UPDATED: 'Subscription updated!',
    ACCOUNT_IN_SYNC: 'Your account is now in sync',
} as const;

export type ButtonTextType = (typeof BUTTON_TEXT)[keyof typeof BUTTON_TEXT];
export type TooltipTextType = (typeof TOOLTIP_TEXT)[keyof typeof TOOLTIP_TEXT];
export type LoadingMessageType = (typeof LOADING_MESSAGES)[keyof typeof LOADING_MESSAGES];
