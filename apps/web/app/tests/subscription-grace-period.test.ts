import { SubscriptionStatusEnum } from "@repo/shared/types/subscription-status";
import {
    getEffectiveAccessStatus,
    hasSubscriptionAccess,
} from "@repo/shared/utils/subscription-grace-period";
import { describe, expect, it } from "vitest";

describe("Subscription Grace Period Logic", () => {
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

    describe("hasSubscriptionAccess", () => {
        it("should grant access for active subscriptions until period end", () => {
            expect(
                hasSubscriptionAccess({
                    status: SubscriptionStatusEnum.ACTIVE,
                    currentPeriodEnd: futureDate,
                }),
            ).toBe(true);
        });

        it("should deny access for expired active subscriptions", () => {
            expect(
                hasSubscriptionAccess({
                    status: SubscriptionStatusEnum.ACTIVE,
                    currentPeriodEnd: pastDate,
                }),
            ).toBe(false);
        });

        it("should grant access for canceled subscriptions until period end", () => {
            expect(
                hasSubscriptionAccess({
                    status: SubscriptionStatusEnum.CANCELED,
                    currentPeriodEnd: futureDate,
                }),
            ).toBe(true);
        });

        it("should deny access for canceled subscriptions after period end", () => {
            expect(
                hasSubscriptionAccess({
                    status: SubscriptionStatusEnum.CANCELED,
                    currentPeriodEnd: pastDate,
                }),
            ).toBe(false);
        });

        it("should grant access for past_due subscriptions until period end", () => {
            expect(
                hasSubscriptionAccess({
                    status: SubscriptionStatusEnum.PAST_DUE,
                    currentPeriodEnd: futureDate,
                }),
            ).toBe(true);
        });

        it("should deny access for past_due subscriptions after period end", () => {
            expect(
                hasSubscriptionAccess({
                    status: SubscriptionStatusEnum.PAST_DUE,
                    currentPeriodEnd: pastDate,
                }),
            ).toBe(false);
        });

        it("should grant access for trialing subscriptions until period end", () => {
            expect(
                hasSubscriptionAccess({
                    status: SubscriptionStatusEnum.TRIALING,
                    currentPeriodEnd: futureDate,
                }),
            ).toBe(true);
        });

        it("should deny access for expired subscriptions", () => {
            expect(
                hasSubscriptionAccess({
                    status: SubscriptionStatusEnum.EXPIRED,
                    currentPeriodEnd: futureDate,
                }),
            ).toBe(false);
        });

        it("should deny access for inactive subscriptions", () => {
            expect(
                hasSubscriptionAccess({
                    status: SubscriptionStatusEnum.INACTIVE,
                    currentPeriodEnd: futureDate,
                }),
            ).toBe(false);
        });
    });

    describe("getEffectiveAccessStatus", () => {
        it("should return active for active subscriptions with access", () => {
            expect(
                getEffectiveAccessStatus({
                    status: SubscriptionStatusEnum.ACTIVE,
                    currentPeriodEnd: futureDate,
                }),
            ).toBe(SubscriptionStatusEnum.ACTIVE);
        });

        it("should return canceled for canceled subscriptions with access", () => {
            expect(
                getEffectiveAccessStatus({
                    status: SubscriptionStatusEnum.CANCELED,
                    currentPeriodEnd: futureDate,
                }),
            ).toBe(SubscriptionStatusEnum.CANCELED);
        });

        it("should return expired for subscriptions without access", () => {
            expect(
                getEffectiveAccessStatus({
                    status: SubscriptionStatusEnum.ACTIVE,
                    currentPeriodEnd: pastDate,
                }),
            ).toBe(SubscriptionStatusEnum.EXPIRED);
        });

        it("should return expired for canceled subscriptions without access", () => {
            expect(
                getEffectiveAccessStatus({
                    status: SubscriptionStatusEnum.CANCELED,
                    currentPeriodEnd: pastDate,
                }),
            ).toBe(SubscriptionStatusEnum.EXPIRED);
        });
    });
});
