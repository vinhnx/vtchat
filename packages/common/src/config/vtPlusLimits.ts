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

export const VT_PLUS_LIMITS: Record<VtPlusFeature, number> = {
    [VtPlusFeature.DEEP_RESEARCH]: Number(process.env.VTPLUS_LIMIT_DR) || 500, // completions / month (~$30-40/month)
    [VtPlusFeature.PRO_SEARCH]: Number(process.env.VTPLUS_LIMIT_PS) || 800, // completions / month (~$40-50/month)
    [VtPlusFeature.RAG]: Number(process.env.VTPLUS_LIMIT_RAG) || 2000, // completions / month (~$80-100/month)
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
