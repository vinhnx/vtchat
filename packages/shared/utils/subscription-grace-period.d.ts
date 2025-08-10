/**
 * Centralized subscription grace period logic
 * Used consistently across all subscription access checks
 */
import { SubscriptionStatusEnum } from "../types/subscription-status";
export interface SubscriptionWithPeriod {
    status: SubscriptionStatusEnum;
    currentPeriodEnd?: string | Date | null;
}
/**
 * Determines if a subscription status grants access, considering grace periods
 *
 * @param subscription - Subscription with status and period end
 * @returns true if the subscription grants access to features
 */
export declare function hasSubscriptionAccess(subscription: SubscriptionWithPeriod): boolean;
/**
 * Determines if a subscription status is considered "active" for billing purposes
 * This is different from access - canceled users have access but aren't "active"
 *
 * @param status - Subscription status
 * @returns true if the subscription is active for billing
 */
export declare function isSubscriptionActive(status: SubscriptionStatusEnum): boolean;
/**
 * Gets the effective access status for UI display
 * Maps various subscription statuses to user-friendly access states
 *
 * @param subscription - Subscription with status and period end
 * @returns simplified status for UI purposes
 */
export declare function getEffectiveAccessStatus(subscription: SubscriptionWithPeriod): SubscriptionStatusEnum;
//# sourceMappingURL=subscription-grace-period.d.ts.map