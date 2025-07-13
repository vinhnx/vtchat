// VT+ Feature Code Constants - centralized definition for reuse
export const VTPLUS_FEATURE_CODES = {
    DEEP_RESEARCH: 'DR',
    PRO_SEARCH: 'PS',
    RAG: 'RAG',
} as const;

export enum VtPlusFeature {
    DEEP_RESEARCH = 'DR',
    PRO_SEARCH = 'PS',
    RAG = 'RAG',
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

/** VT+ limits with daily/monthly window configuration */
export const VT_PLUS_LIMITS: Record<VtPlusFeature, QuotaConfig> = {
    [VtPlusFeature.DEEP_RESEARCH]: {
        limit: parseInt(process.env.VTPLUS_DAILY_LIMIT_DR ?? '5', 10),
        window: QUOTA_WINDOW.DAILY,
    },
    [VtPlusFeature.PRO_SEARCH]: {
        limit: parseInt(process.env.VTPLUS_DAILY_LIMIT_PS ?? '10', 10),
        window: QUOTA_WINDOW.DAILY,
    },
    [VtPlusFeature.RAG]: {
        limit: parseInt(process.env.VTPLUS_MONTHLY_LIMIT_RAG ?? '2000', 10),
        window: QUOTA_WINDOW.MONTHLY,
    },
};

/**
 * @deprecated Legacy monthly limits for backward compatibility - DO NOT USE
 * Use VT_PLUS_LIMITS instead which includes window configuration
 */
export const VT_PLUS_MONTHLY_LIMITS: Record<VtPlusFeature, number> = {
    [VtPlusFeature.DEEP_RESEARCH]: parseInt(process.env.VTPLUS_LIMIT_DR ?? '500', 10),
    [VtPlusFeature.PRO_SEARCH]: parseInt(process.env.VTPLUS_LIMIT_PS ?? '800', 10),
    [VtPlusFeature.RAG]: parseInt(process.env.VTPLUS_LIMIT_RAG ?? '2000', 10),
};

export class QuotaExceededError extends Error {
    constructor(
        public readonly feature: VtPlusFeature,
        public readonly limit: number,
        public readonly used: number
    ) {
        super(`VT+ quota exceeded for ${feature}. Used: ${used}/${limit}`);
        this.name = 'QuotaExceededError';
    }
}
