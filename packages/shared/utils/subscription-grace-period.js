/**
 * Centralized subscription grace period logic
 * Used consistently across all subscription access checks
 */
import { SubscriptionStatusEnum } from "../types/subscription-status";
/**
 * Determines if a subscription status grants access, considering grace periods
 *
 * @param subscription - Subscription with status and period end
 * @returns true if the subscription grants access to features
 */
export function hasSubscriptionAccess(subscription) {
    var status = subscription.status, currentPeriodEnd = subscription.currentPeriodEnd;
    var now = new Date();
    var periodEnd = currentPeriodEnd ? new Date(currentPeriodEnd) : null;
    var notExpired = !periodEnd || now <= periodEnd;
    switch (status) {
        case SubscriptionStatusEnum.ACTIVE:
        case SubscriptionStatusEnum.TRIALING:
            // Active and trialing subscriptions always have access (unless expired)
            return notExpired;
        case SubscriptionStatusEnum.CANCELED:
        case SubscriptionStatusEnum.CANCELLED:
            // Canceled users retain access until period end
            return notExpired;
        case SubscriptionStatusEnum.PAST_DUE:
            // Past due users have grace period until period end
            return notExpired;
        default:
            // No access for expired, inactive, incomplete, or no subscription
            return false;
    }
}
/**
 * Determines if a subscription status is considered "active" for billing purposes
 * This is different from access - canceled users have access but aren't "active"
 *
 * @param status - Subscription status
 * @returns true if the subscription is active for billing
 */
export function isSubscriptionActive(status) {
    switch (status) {
        case SubscriptionStatusEnum.ACTIVE:
        case SubscriptionStatusEnum.TRIALING:
        case SubscriptionStatusEnum.PAST_DUE:
            return true;
        default:
            return false;
    }
}
/**
 * Gets the effective access status for UI display
 * Maps various subscription statuses to user-friendly access states
 *
 * @param subscription - Subscription with status and period end
 * @returns simplified status for UI purposes
 */
export function getEffectiveAccessStatus(subscription) {
    if (hasSubscriptionAccess(subscription)) {
        // If user has access, show the most relevant status
        switch (subscription.status) {
            case SubscriptionStatusEnum.TRIALING:
                return SubscriptionStatusEnum.TRIALING;
            case SubscriptionStatusEnum.CANCELED:
            case SubscriptionStatusEnum.CANCELLED:
                return SubscriptionStatusEnum.CANCELED; // Normalize to single spelling
            case SubscriptionStatusEnum.PAST_DUE:
                return SubscriptionStatusEnum.PAST_DUE;
            default:
                return SubscriptionStatusEnum.ACTIVE;
        }
    }
    else {
        // No access - show appropriate inactive status
        switch (subscription.status) {
            case SubscriptionStatusEnum.EXPIRED:
                return SubscriptionStatusEnum.EXPIRED;
            case SubscriptionStatusEnum.INCOMPLETE:
                return SubscriptionStatusEnum.INCOMPLETE;
            case SubscriptionStatusEnum.INACTIVE:
                return SubscriptionStatusEnum.INACTIVE;
            case SubscriptionStatusEnum.NONE:
                return SubscriptionStatusEnum.NONE;
            default:
                return SubscriptionStatusEnum.EXPIRED; // Default for expired access
        }
    }
}
