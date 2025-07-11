import { ChatMode, ChatModeConfig } from '@repo/shared/config';
import { FeatureSlug, PlanSlug } from '@repo/shared/types/subscription';
import { cn } from '@repo/ui';

/**
 * Determines if a chat mode is premium based on its configuration
 */
export function isPremiumMode(mode: ChatMode): boolean {
    const config = ChatModeConfig[mode];

    // Premium modes are those that require VT+ subscription or have premium features
    const hasPremiumFeatures =
        config.requiredFeature === FeatureSlug.DEEP_RESEARCH ||
        config.requiredFeature === FeatureSlug.PRO_SEARCH;

    const hasPremiumPlan = config.requiredPlan === PlanSlug.VT_PLUS;

    // Advanced modes (Deep Research, Pro Search) are always premium
    const isAdvancedMode = mode === ChatMode.Deep || mode === ChatMode.Pro;

    // Models with reasoning capabilities or that require API keys are premium
    const reasoningModels = [
        ChatMode.O3,
        ChatMode.O3_Mini,
        ChatMode.O4_Mini,
        ChatMode.CLAUDE_4_SONNET,
        ChatMode.CLAUDE_4_OPUS,
        ChatMode.GEMINI_2_5_PRO,
        ChatMode.GEMINI_2_5_FLASH,
        ChatMode.DEEPSEEK_R1,
        ChatMode.GPT_4o,
        ChatMode.GPT_4_1,
        ChatMode.GROK_3,
    ];

    const isReasoningModel = reasoningModels.includes(mode);

    // Free models are NOT premium
    const freeModels = [
        ChatMode.GEMINI_2_5_FLASH_LITE, // Free model
        ChatMode.LMSTUDIO_LLAMA_3_8B, // Local models
        ChatMode.LMSTUDIO_QWEN_7B,
        ChatMode.LMSTUDIO_GEMMA_7B,
        ChatMode.LMSTUDIO_GEMMA_3_1B,
    ];

    const isFreeModel = freeModels.includes(mode);

    return (
        (hasPremiumFeatures || hasPremiumPlan || isAdvancedMode || isReasoningModel) && !isFreeModel
    );
}

/**
 * Returns premium styling classes for buttons
 */
export function getPremiumButtonClasses(isPremium: boolean): string {
    if (isPremium) {
        return cn(
            'transition-all duration-300',
            // Premium mode - Custom hover background with #BFB38F
            'border-amber-200/50 bg-amber-50/50 hover:shadow-lg hover:shadow-amber-200/30',
            'hover:bg-[#BFB38F]',
            'dark:border-amber-800/30 dark:bg-amber-950/30 dark:hover:bg-amber-900/50'
        );
    }
    return cn('transition-all duration-300', 'hover:border-muted-foreground/50');
}

/**
 * Returns premium styling classes for dropdown items
 */
export function getPremiumDropdownClasses(isPremium: boolean): string {
    if (isPremium) {
        return cn(
            'transition-all duration-300',
            // Premium mode - Custom hover background with #BFB38F, no border selection
            'bg-amber-50/50 hover:bg-[#BFB38F] data-[highlighted]:bg-[#BFB38F]',
            'dark:bg-amber-950/30 dark:hover:bg-amber-900/50',
            'dark:data-[highlighted]:bg-amber-900/50'
        );
    }
    return cn('transition-all duration-300', 'hover:bg-muted/50 data-[highlighted]:bg-muted/50');
}
