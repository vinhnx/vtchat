import { log } from '@repo/shared/logger';
import { isEligibleForQuotaConsumption } from '@repo/shared/utils/access-control';
import { generateText, streamText } from 'ai';
import type { VtPlusFeature } from '../config/vtPlusLimits';
import { consumeQuota } from './vtplusRateLimiter';

export interface QuotaOptions {
    user: { id: string; planSlug?: string; };
    feature: VtPlusFeature;
    amount?: number; // default 1
    isByokKey: boolean;
}

export function isUsingByokKeys(byokKeys?: Record<string, string>): boolean {
    return !!byokKeys && Object.keys(byokKeys).length > 0;
}

/**
 * Wrapper for streamText that enforces VT+ quotas for server-funded models
 */
export async function streamTextWithQuota(
    params: Parameters<typeof streamText>[0],
    options: QuotaOptions,
) {
    const { user, feature, amount = 1, isByokKey } = options;

    // Use unified access control to check quota eligibility
    if (isEligibleForQuotaConsumption(user, isByokKey)) {
        log.info(
            {
                userId: user.id,
                feature,
                amount,
            },
            'Consuming VT+ quota for streamText',
        );

        await consumeQuota({
            userId: user.id,
            feature,
            amount,
        });
    }

    return streamText(params);
}

/**
 * Wrapper for generateText that enforces VT+ quotas for server-funded models
 */
export async function generateTextWithQuota(
    params: Parameters<typeof generateText>[0],
    options: QuotaOptions,
) {
    const { user, feature, amount = 1, isByokKey } = options;

    // Use unified access control to check quota eligibility
    if (isEligibleForQuotaConsumption(user, isByokKey)) {
        log.info(
            {
                userId: user.id,
                feature,
                amount,
            },
            'Consuming VT+ quota for generateText',
        );

        await consumeQuota({
            userId: user.id,
            feature,
            amount,
        });
    }

    return generateText(params);
}
