import { describe, expect, test } from 'vitest';

import { SubscriptionStatusEnum } from '../../../../packages/shared/types/subscription-status';
import {
    getEffectiveAccessStatus,
    hasSubscriptionAccess,
} from '../../../../packages/shared/utils/subscription-grace-period';

describe('subscription grace period access', () => {
    test('canceled with future period_end retains access', () => {
        const inFuture = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        expect(
            hasSubscriptionAccess({
                status: SubscriptionStatusEnum.CANCELED,
                currentPeriodEnd: inFuture,
            }),
        ).toBe(true);
        expect(
            getEffectiveAccessStatus({
                status: SubscriptionStatusEnum.CANCELED,
                currentPeriodEnd: inFuture,
            }),
        ).toBe(SubscriptionStatusEnum.CANCELED);
    });

    test('canceled with missing period_end loses access', () => {
        expect(
            hasSubscriptionAccess({
                status: SubscriptionStatusEnum.CANCELED,
                currentPeriodEnd: null,
            }),
        ).toBe(false);
        expect(
            getEffectiveAccessStatus({
                status: SubscriptionStatusEnum.CANCELED,
                currentPeriodEnd: null,
            }),
        ).toBe(SubscriptionStatusEnum.EXPIRED);
    });

    test('active without period_end retains access', () => {
        expect(
            hasSubscriptionAccess({
                status: SubscriptionStatusEnum.ACTIVE,
                currentPeriodEnd: null,
            }),
        ).toBe(true);
        expect(
            getEffectiveAccessStatus({
                status: SubscriptionStatusEnum.ACTIVE,
                currentPeriodEnd: null,
            }),
        ).toBe(SubscriptionStatusEnum.ACTIVE);
    });

    test('past_due requires period_end', () => {
        expect(
            hasSubscriptionAccess({
                status: SubscriptionStatusEnum.PAST_DUE,
                currentPeriodEnd: null,
            }),
        ).toBe(false);
    });
});
