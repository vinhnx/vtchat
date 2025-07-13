/**
 * Plus User Default Settings Utility
 *
 * Provides default settings configuration for VT+ subscribers
 * Based on Context7 patterns for feature-based defaults
 */

import { THINKING_MODE } from "../constants/thinking-mode";
import { FeatureSlug, PlanSlug } from "../types/subscription";
import { hasVTPlusAccessByPlan } from "./access-control";

/**
 * Default thinking mode settings for plus users
 */
export const PLUS_THINKING_MODE_DEFAULTS = {
    enabled: true, // Enable Thinking Mode by default for plus users
    budget: THINKING_MODE.DEFAULT_BUDGET, // Use default budget
    includeThoughts: true, // Show Thought Process by default for plus users
    claude4InterleavedThinking: true, // Enable Claude 4 interleaved thinking for plus users
} as const;

/**
 * Default Gemini explicit caching settings for plus users
 */
export const PLUS_GEMINI_CACHING_DEFAULTS = {
    enabled: true, // Enable Explicit Caching by default for plus users
    ttlSeconds: 3600, // Cache Duration: 1 hour (3600 seconds)
    maxCaches: 1, // Max Cached Conversations: 1
} as const;

/**
 * Base user default settings (for non-plus users)
 */
export const BASE_THINKING_MODE_DEFAULTS = {
    enabled: true, // Enable Thinking Mode by default for all logged-in users
    budget: THINKING_MODE.DEFAULT_BUDGET,
    includeThoughts: true,
    claude4InterleavedThinking: false, // Disable Claude 4 interleaved thinking for base users
} as const;

export const BASE_GEMINI_CACHING_DEFAULTS = {
    enabled: true, // Enable Gemini Explicit Caching by default for all logged-in users
    ttlSeconds: 3600,
    maxCaches: 10, // Higher limit for base users than plus users
} as const;

/**
 * Feature-based default settings configuration
 */
export interface PlusDefaultSettings {
    thinkingMode: {
        enabled: boolean;
        budget: number;
        includeThoughts: boolean;
        claude4InterleavedThinking: boolean;
    };
    geminiCaching: {
        enabled: boolean;
        ttlSeconds: number;
        maxCaches: number;
    };
}

/**
 * Get default settings based on user's subscription plan
 */
export function getDefaultSettingsForPlan(plan: PlanSlug): PlusDefaultSettings {
    const isPlusUser = hasVTPlusAccessByPlan(plan);

    return {
        thinkingMode: isPlusUser ? PLUS_THINKING_MODE_DEFAULTS : BASE_THINKING_MODE_DEFAULTS,
        geminiCaching: isPlusUser ? PLUS_GEMINI_CACHING_DEFAULTS : BASE_GEMINI_CACHING_DEFAULTS,
    };
}

/**
 * Get default settings based on feature access
 */
export function getDefaultSettingsForFeatures(hasFeatures: FeatureSlug[]): PlusDefaultSettings {
    const hasThinkingMode = hasFeatures.includes(FeatureSlug.THINKING_MODE);
    const hasGeminiCaching = hasFeatures.includes(FeatureSlug.GEMINI_EXPLICIT_CACHING);

    return {
        thinkingMode: hasThinkingMode ? PLUS_THINKING_MODE_DEFAULTS : BASE_THINKING_MODE_DEFAULTS,
        geminiCaching: hasGeminiCaching
            ? PLUS_GEMINI_CACHING_DEFAULTS
            : BASE_GEMINI_CACHING_DEFAULTS,
    };
}

/**
 * Check if current settings should be updated to plus defaults
 * This helps when a user upgrades from base to plus
 */
export function shouldApplyPlusDefaults(
    currentSettings: PlusDefaultSettings,
    newPlan: PlanSlug,
    previousPlan?: PlanSlug,
): boolean {
    // Apply plus defaults when upgrading from base to plus
    const upgradingToPlus = previousPlan === PlanSlug.VT_BASE && newPlan === PlanSlug.VT_PLUS;

    // Or when plus user has disabled settings (allow re-enabling)
    const isPlusWithDisabledFeatures =
        newPlan === PlanSlug.VT_PLUS &&
        !(currentSettings.thinkingMode.enabled && currentSettings.geminiCaching.enabled);

    return upgradingToPlus || isPlusWithDisabledFeatures;
}

/**
 * Merge current settings with plus defaults, preserving user customizations
 */
export function mergeWithPlusDefaults(
    currentSettings: PlusDefaultSettings,
    plan: PlanSlug,
    preserveUserChanges = true,
): PlusDefaultSettings {
    const defaultSettings = getDefaultSettingsForPlan(plan);

    if (!preserveUserChanges) {
        return defaultSettings;
    }

    // For plus users, enable features but preserve custom budgets/ttl if set
    if (hasVTPlusAccessByPlan(plan)) {
        return {
            thinkingMode: {
                enabled: defaultSettings.thinkingMode.enabled, // Always enable for plus
                budget: currentSettings.thinkingMode.budget || defaultSettings.thinkingMode.budget,
                includeThoughts: defaultSettings.thinkingMode.includeThoughts, // Always enable for plus
                claude4InterleavedThinking: defaultSettings.thinkingMode.claude4InterleavedThinking, // Always enable for plus
            },
            geminiCaching: {
                enabled: defaultSettings.geminiCaching.enabled, // Always enable for plus
                ttlSeconds:
                    currentSettings.geminiCaching.ttlSeconds ||
                    defaultSettings.geminiCaching.ttlSeconds,
                maxCaches: defaultSettings.geminiCaching.maxCaches, // Use plus default (1)
            },
        };
    }

    return currentSettings;
}
