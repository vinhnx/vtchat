export const SubscriptionStatusEnum = {
    ACTIVE: "active",
    INACTIVE: "inactive",
    EXPIRED: "expired",
    CANCELED: "canceled",
    CANCELLED: "cancelled", // Alternative spelling
    INCOMPLETE: "incomplete",
    PAST_DUE: "past_due",
    TRIALING: "trialing",
    NONE: "none",
} as const;

export type SubscriptionStatusEnum =
    (typeof SubscriptionStatusEnum)[keyof typeof SubscriptionStatusEnum];
