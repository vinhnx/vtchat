'use client';

import { useFeatureAccess } from '@repo/common/hooks/use-subscription-access';
import { SETTING_TABS, useAppStore, useChatStore } from '@repo/common/store';
import { FeatureSlug } from '@repo/shared/types/subscription';
import { Badge } from '@repo/ui';
import { motion } from 'framer-motion';
import { Brain, Settings } from 'lucide-react';
import { useMemo } from 'react';

export const ThinkingModeIndicator = () => {
    const thinkingMode = useChatStore((state) => state.thinkingMode);
    const chatMode = useChatStore((state) => state.chatMode);
    const hasThinkingModeAccess = useFeatureAccess(FeatureSlug.THINKING_MODE);
    const setIsSettingsOpen = useAppStore((state) => state.setIsSettingsOpen);
    const setSettingTab = useAppStore((state) => state.setSettingTab);

    // Check if current model supports thinking mode (specific Gemini 2.5 models only)
    const isThinkingCapableModel = useMemo(() => {
        const thinkingModeModels = [
            ChatMode.GEMINI_2_5_FLASH,
            ChatMode.GEMINI_2_5_FLASH_LITE,
            ChatMode.GEMINI_2_5_FLASH_PREVIEW_05_20,
            ChatMode.GEMINI_2_5_PRO_PREVIEW_05_06,
            ChatMode.GEMINI_2_5_PRO_PREVIEW_06_05,
        ];
        return thinkingModeModels.includes(chatMode);
    }, [chatMode]);

    // Only show indicator if:
    // 1. User has access to thinking mode (VT+)
    // 2. Thinking mode is enabled
    // 3. Current model supports thinking mode (Gemini 2.5 Flash, Pro, Flash-Lite)
    if (!(hasThinkingModeAccess && thinkingMode.enabled && isThinkingCapableModel)) {
        return null;
    }

    const handleClick = () => {
        setSettingTab(SETTING_TABS.REASONING_MODE);
        setIsSettingsOpen(true);
    };

    return (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Badge
                className="flex cursor-pointer items-center gap-1 border border-[#D99A4E]/30 bg-gradient-to-r from-[#D99A4E]/10 to-[#BFB38F]/10 text-xs text-[#D99A4E] backdrop-blur-sm transition-all duration-300 hover:border-[#BFB38F]/50 hover:shadow-[0_0_10px_rgba(217,154,78,0.1)] dark:hover:shadow-[0_0_15px_rgba(217,154,78,0.1)]"
                onClick={handleClick}
                variant="secondary"
            >
                <Brain className="animate-pulse" size={12} />
                <span className="font-medium">Reasoning Mode</span>
                <Settings className="text-[#BFB38F]" size={10} />
            </Badge>
        </motion.div>
    );
};
