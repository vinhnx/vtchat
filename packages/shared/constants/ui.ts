/**
 * UI-related constants for the VTChat application
 * Contains button text, tooltips, and other UI string constants
 */

export const BUTTON_TEXT = {
    MANAGE_SUBSCRIPTION: 'Manage Subscription',
    MANAGE_BILLING: 'Manage Billing',
    UPGRADE_TO_PLUS: 'Upgrade to Plus',
    LOADING: 'Loading...',
} as const;

export const TOOLTIP_TEXT = {
    MANAGE_SUBSCRIPTION_NEW_TAB: 'Manage subscription (opens in new tab)',
    MANAGE_BILLING_NEW_TAB: 'Manage billing (opens in new tab)',
    UPGRADE_TO_PLUS: 'Upgrade to Plus',
} as const;

export type ButtonTextType = (typeof BUTTON_TEXT)[keyof typeof BUTTON_TEXT];
export type TooltipTextType = (typeof TOOLTIP_TEXT)[keyof typeof TOOLTIP_TEXT];
