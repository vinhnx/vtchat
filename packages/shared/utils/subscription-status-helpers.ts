/**
 * Subscription Status Helper Functions
 * Provides utilities for handling different subscription statuses and user messaging
 */

import { SubscriptionStatusEnum } from "@repo/shared/types/subscription-status";

export interface SubscriptionStatusInfo {
    hasAccess: boolean;
    userMessage: string;
    urgency: "none" | "low" | "medium" | "high";
    actionRequired: boolean;
    actionText?: string;
    isGracePeriod?: boolean;
}

/**
 * Get user-friendly information about subscription status
 */
export function getSubscriptionStatusInfo(
    status: SubscriptionStatusEnum,
    currentPeriodEnd?: Date | string,
): SubscriptionStatusInfo {
    const periodEnd = currentPeriodEnd ? new Date(currentPeriodEnd) : null;
    const now = new Date();
    const isExpired = periodEnd && now > periodEnd;
    const daysUntilExpiry = periodEnd
        ? Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null;

    switch (status) {
        case SubscriptionStatusEnum.ACTIVE:
            return {
                hasAccess: true,
                userMessage: "Your VT+ subscription is active.",
                urgency: "none",
                actionRequired: false,
            };

        case SubscriptionStatusEnum.TRIALING:
            const trialMessage =
                daysUntilExpiry && daysUntilExpiry > 0
                    ? `Your VT+ trial has ${daysUntilExpiry} days remaining.`
                    : "Your VT+ trial is active.";

            return {
                hasAccess: true,
                userMessage: trialMessage,
                urgency: daysUntilExpiry && daysUntilExpiry <= 3 ? "medium" : "low",
                actionRequired: daysUntilExpiry && daysUntilExpiry <= 7,
                actionText: "Upgrade to VT+",
            };

        case SubscriptionStatusEnum.CANCELED:
        case SubscriptionStatusEnum.CANCELLED:
            if (isExpired) {
                return {
                    hasAccess: false,
                    userMessage: "Your VT+ subscription has ended. Upgrade to restore access.",
                    urgency: "high",
                    actionRequired: true,
                    actionText: "Reactivate VT+",
                };
            }

            const cancelMessage =
                daysUntilExpiry && daysUntilExpiry > 0
                    ? `Your VT+ subscription is canceled but you have access for ${daysUntilExpiry} more days.`
                    : "Your VT+ subscription is canceled but you retain access until your period ends.";

            return {
                hasAccess: true,
                userMessage: cancelMessage,
                urgency: daysUntilExpiry && daysUntilExpiry <= 7 ? "medium" : "low",
                actionRequired: true,
                actionText: "Reactivate VT+",
                isGracePeriod: true,
            };

        case SubscriptionStatusEnum.PAST_DUE:
            if (isExpired) {
                return {
                    hasAccess: false,
                    userMessage:
                        "Your VT+ subscription payment is overdue and access has been suspended.",
                    urgency: "high",
                    actionRequired: true,
                    actionText: "Update Payment",
                };
            }

            return {
                hasAccess: true,
                userMessage:
                    "Your VT+ payment is overdue. Please update your payment method to avoid service interruption.",
                urgency: "high",
                actionRequired: true,
                actionText: "Update Payment",
                isGracePeriod: true,
            };

        case SubscriptionStatusEnum.EXPIRED:
            return {
                hasAccess: false,
                userMessage: "Your VT+ subscription has expired. Renew to restore access.",
                urgency: "high",
                actionRequired: true,
                actionText: "Renew VT+",
            };

        case SubscriptionStatusEnum.INCOMPLETE:
            return {
                hasAccess: false,
                userMessage:
                    "Your VT+ subscription setup is incomplete. Please complete your payment.",
                urgency: "high",
                actionRequired: true,
                actionText: "Complete Setup",
            };

        case SubscriptionStatusEnum.INACTIVE:
            return {
                hasAccess: false,
                userMessage:
                    "Your VT+ subscription is inactive. Contact support if you believe this is an error.",
                urgency: "medium",
                actionRequired: true,
                actionText: "Contact Support",
            };

        case SubscriptionStatusEnum.NONE:
        default:
            return {
                hasAccess: false,
                userMessage: "Upgrade to VT+ for exclusive features.",
                urgency: "none",
                actionRequired: false,
                actionText: "Upgrade to VT+",
            };
    }
}

/**
 * Check if a subscription status provides access to VT+ features
 */
export function hasSubscriptionAccess(
    status: SubscriptionStatusEnum,
    currentPeriodEnd?: Date | string,
): boolean {
    const info = getSubscriptionStatusInfo(status, currentPeriodEnd);
    return info.hasAccess;
}

/**
 * Get the appropriate CSS class for status urgency
 */
export function getStatusUrgencyClass(urgency: SubscriptionStatusInfo["urgency"]): string {
    switch (urgency) {
        case "high":
            return "text-red-600 bg-red-50 border-red-200";
        case "medium":
            return "text-orange-600 bg-orange-50 border-orange-200";
        case "low":
            return "text-yellow-600 bg-yellow-50 border-yellow-200";
        default:
            return "text-green-600 bg-green-50 border-green-200";
    }
}

/**
 * Get appropriate badge text for subscription status
 */
export function getStatusBadgeText(status: SubscriptionStatusEnum): string {
    switch (status) {
        case SubscriptionStatusEnum.ACTIVE:
            return "Active";
        case SubscriptionStatusEnum.TRIALING:
            return "Trial";
        case SubscriptionStatusEnum.CANCELED:
        case SubscriptionStatusEnum.CANCELLED:
            return "Canceled";
        case SubscriptionStatusEnum.PAST_DUE:
            return "Payment Due";
        case SubscriptionStatusEnum.EXPIRED:
            return "Expired";
        case SubscriptionStatusEnum.INCOMPLETE:
            return "Incomplete";
        case SubscriptionStatusEnum.INACTIVE:
            return "Inactive";
        case SubscriptionStatusEnum.NONE:
        default:
            return "Free";
    }
}

/**
 * Check if status indicates subscription is in a grace period
 */
export function isGracePeriodStatus(
    status: SubscriptionStatusEnum,
    currentPeriodEnd?: Date | string,
): boolean {
    const info = getSubscriptionStatusInfo(status, currentPeriodEnd);
    return info.isGracePeriod || false;
}

/**
 * Get time remaining until subscription expires (in milliseconds)
 */
export function getTimeUntilExpiry(currentPeriodEnd?: Date | string): number | null {
    if (!currentPeriodEnd) return null;

    const periodEnd = new Date(currentPeriodEnd);
    const now = new Date();
    const timeRemaining = periodEnd.getTime() - now.getTime();

    return timeRemaining > 0 ? timeRemaining : 0;
}

/**
 * Format time remaining in a human-readable way
 */
export function formatTimeRemaining(currentPeriodEnd?: Date | string): string | null {
    const timeRemaining = getTimeUntilExpiry(currentPeriodEnd);
    if (timeRemaining === null) return null;

    if (timeRemaining <= 0) return "Expired";

    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
        return `${days} day${days !== 1 ? "s" : ""} remaining`;
    } else if (hours > 0) {
        return `${hours} hour${hours !== 1 ? "s" : ""} remaining`;
    } else {
        return "Less than 1 hour remaining";
    }
}
