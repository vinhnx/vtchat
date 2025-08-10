/**
 * UI-related constants for the VT application
 * Contains button text, tooltips, and other UI string constants
 */
export declare const BUTTON_TEXT: {
    readonly MANAGE_SUBSCRIPTION: "Subscription Portal";
    readonly MANAGE_BILLING: "Manage Billing";
    readonly UPGRADE_TO_PLUS: "Upgrade to VT+";
    readonly LOADING: "Loading...";
    readonly OPENING_PORTAL: "Opening Portal...";
};
export declare const TOOLTIP_TEXT: {
    readonly MANAGE_SUBSCRIPTION_NEW_TAB: "Manage subscription (opens in new tab)";
    readonly MANAGE_BILLING_NEW_TAB: "Manage billing (opens in new tab)";
    readonly UPGRADE_TO_PLUS: "Upgrade to VT+";
};
export declare const LOADING_MESSAGES: {
    readonly FETCHING_PORTAL_URL: "Getting portal URL...";
    readonly OPENING_PORTAL: "Opening portal...";
    readonly SYNCING_SUBSCRIPTION: "Syncing subscription...";
    readonly UPDATING_STATUS: "Updating your account status";
    readonly SUBSCRIPTION_UPDATED: "Subscription updated!";
    readonly ACCOUNT_IN_SYNC: "Your account is now in sync";
};
export type ButtonTextType = (typeof BUTTON_TEXT)[keyof typeof BUTTON_TEXT];
export type TooltipTextType = (typeof TOOLTIP_TEXT)[keyof typeof TOOLTIP_TEXT];
export type LoadingMessageType = (typeof LOADING_MESSAGES)[keyof typeof LOADING_MESSAGES];
//# sourceMappingURL=ui.d.ts.map