// VT+ Feature Code Constants - centralized definition for reuse
export const VTPLUS_FEATURE_CODES = {
    DEEP_RESEARCH: 'DR',
    PRO_SEARCH: 'PS',
} as const;

export enum VtPlusFeature {
    DEEP_RESEARCH = 'DR',
    PRO_SEARCH = 'PS',
}

// Quota Window Constants
export const QUOTA_WINDOW = {
    DAILY: 'daily',
    MONTHLY: 'monthly',
} as const;

export type QuotaWindow = (typeof QUOTA_WINDOW)[keyof typeof QUOTA_WINDOW];

export interface QuotaConfig {
    limit: number;
    window: QuotaWindow;
}

/**
 * @deprecated Use getQuotaConfig() from quota-config.service.ts instead
 * This is kept for backward compatibility but will be removed in future versions
 */
export const VT_PLUS_LIMITS: Record<VtPlusFeature, QuotaConfig> = {
    [VtPlusFeature.DEEP_RESEARCH]: {
        limit: parseInt(process.env.VTPLUS_DAILY_LIMIT_DR ?? '25', 10),
        window: QUOTA_WINDOW.DAILY,
    },
    [VtPlusFeature.PRO_SEARCH]: {
        limit: parseInt(process.env.VTPLUS_DAILY_LIMIT_PS ?? '50', 10),
        window: QUOTA_WINDOW.DAILY,
    },
};

/**
 * @deprecated Legacy monthly limits for backward compatibility - DO NOT USE
 * Use VT_PLUS_LIMITS instead which includes window configuration
 */
export const VT_PLUS_MONTHLY_LIMITS: Record<VtPlusFeature, number> = {
    [VtPlusFeature.DEEP_RESEARCH]: parseInt(process.env.VTPLUS_LIMIT_DR ?? '500', 10),
    [VtPlusFeature.PRO_SEARCH]: parseInt(process.env.VTPLUS_LIMIT_PS ?? '800', 10),
};

export class QuotaExceededError extends Error {
    constructor(
        public readonly feature: VtPlusFeature,
        public readonly limit: number,
        public readonly used: number,
    ) {
        super(`VT+ quota exceeded for ${feature}. Used: ${used}/${limit}`);
        this.name = 'QuotaExceededError';
    }
}
