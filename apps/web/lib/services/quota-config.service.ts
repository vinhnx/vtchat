import { db } from "@/lib/database";
import { quotaConfigs } from "@/lib/database/schema";
import { QUOTA_WINDOW, VtPlusFeature, type QuotaConfig } from "@repo/common/config/vtPlusLimits";
import { log } from "@repo/shared/lib/logger";
import type { PlanSlug } from "@repo/shared/types/subscription";
import { and, eq } from "drizzle-orm";

// In-memory cache for quota configurations
const quotaConfigCache: Map<string, QuotaConfig> = new Map();
let cacheLastUpdated: Date | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Generate cache key for feature + plan combination
 */
function getCacheKey(feature: VtPlusFeature, plan: PlanSlug): string {
    return `${feature}:${plan}`;
}

/**
 * Check if cache is still valid
 */
function isCacheValid(): boolean {
    if (!cacheLastUpdated) return false;
    return Date.now() - cacheLastUpdated.getTime() < CACHE_TTL_MS;
}

/**
 * Fetch quota configurations from database
 */
async function fetchQuotaConfigsFromDB() {
    try {
        const configs = await db.select().from(quotaConfigs).where(eq(quotaConfigs.isActive, true));

        return configs;
    } catch (error) {
        log.error({ error }, "[QuotaConfigService] Failed to fetch quota configs from database");
        throw error;
    }
}

/**
 * Load quota configurations into cache
 */
async function loadQuotaConfigs(): Promise<void> {
    try {
        const configs = await fetchQuotaConfigsFromDB();

        // Clear existing cache
        quotaConfigCache.clear();

        // Populate cache with database values
        for (const config of configs) {
            const feature = config.feature as VtPlusFeature;
            const plan = config.plan as PlanSlug;
            const cacheKey = getCacheKey(feature, plan);

            quotaConfigCache.set(cacheKey, {
                limit: config.quotaLimit,
                window: config.quotaWindow as (typeof QUOTA_WINDOW)[keyof typeof QUOTA_WINDOW],
            });
        }

        cacheLastUpdated = new Date();
        log.info(
            { configCount: configs.length },
            "[QuotaConfigService] Quota configs loaded into cache",
        );
    } catch (error) {
        log.error({ error }, "[QuotaConfigService] Failed to load quota configs");
        throw error;
    }
}

/**
 * Get quota configuration for a specific feature and plan
 */
export async function getQuotaConfig(feature: VtPlusFeature, plan: PlanSlug): Promise<QuotaConfig> {
    // Refresh cache if needed
    if (!isCacheValid()) {
        await loadQuotaConfigs();
    }

    const cacheKey = getCacheKey(feature, plan);
    const config = quotaConfigCache.get(cacheKey);

    if (!config) {
        // Fallback to default values if not found in database
        log.warn({ feature, plan }, "[QuotaConfigService] No quota config found, using defaults");
        return {
            limit: 0, // Default to 0 for safety
            window: QUOTA_WINDOW.DAILY,
        };
    }

    return config;
}

/**
 * Get all quota configurations for a specific plan
 */
export async function getQuotaConfigsForPlan(
    plan: PlanSlug,
): Promise<Record<VtPlusFeature, QuotaConfig>> {
    // Refresh cache if needed
    if (!isCacheValid()) {
        await loadQuotaConfigs();
    }

    const result: Record<VtPlusFeature, QuotaConfig> = {} as Record<VtPlusFeature, QuotaConfig>;

    // Get configs for all features
    for (const feature of Object.values(VtPlusFeature)) {
        const cacheKey = getCacheKey(feature, plan);
        const config = quotaConfigCache.get(cacheKey);

        if (config) {
            result[feature] = config;
        } else {
            // Fallback to default
            result[feature] = {
                limit: 0,
                window: QUOTA_WINDOW.DAILY,
            };
        }
    }

    return result;
}

/**
 * Update quota configuration in database
 */
export async function updateQuotaConfig(
    feature: VtPlusFeature,
    plan: PlanSlug,
    config: Partial<QuotaConfig>,
): Promise<void> {
    try {
        await db
            .update(quotaConfigs)
            .set({
                quotaLimit: config.limit,
                quotaWindow: config.window,
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(quotaConfigs.feature, feature),
                    eq(quotaConfigs.plan, plan),
                    eq(quotaConfigs.isActive, true),
                ),
            );

        // Invalidate cache to force refresh
        cacheLastUpdated = null;

        log.info({ feature, plan, config }, "[QuotaConfigService] Quota config updated");
    } catch (error) {
        log.error(
            { error, feature, plan, config },
            "[QuotaConfigService] Failed to update quota config",
        );
        throw error;
    }
}

/**
 * Create new quota configuration
 */
export async function createQuotaConfig(
    feature: VtPlusFeature,
    plan: PlanSlug,
    config: QuotaConfig,
): Promise<void> {
    try {
        await db
            .insert(quotaConfigs)
            .values({
                feature,
                plan,
                quotaLimit: config.limit,
                quotaWindow: config.window,
            })
            .onConflictDoUpdate({
                target: [quotaConfigs.feature, quotaConfigs.plan],
                set: {
                    quotaLimit: config.limit,
                    quotaWindow: config.window,
                    updatedAt: new Date(),
                },
            });

        // Invalidate cache to force refresh
        cacheLastUpdated = null;

        log.info({ feature, plan, config }, "[QuotaConfigService] Quota config created/updated");
    } catch (error) {
        log.error(
            { error, feature, plan, config },
            "[QuotaConfigService] Failed to create quota config",
        );
        throw error;
    }
}

/**
 * Force refresh of quota configuration cache
 */
export async function refreshQuotaConfigCache(): Promise<void> {
    cacheLastUpdated = null;
    await loadQuotaConfigs();
}

/**
 * Get cache statistics for debugging
 */
export function getQuotaConfigCacheStats() {
    return {
        cacheSize: quotaConfigCache.size,
        lastUpdated: cacheLastUpdated,
        isValid: isCacheValid(),
        ttlMs: CACHE_TTL_MS,
    };
}
