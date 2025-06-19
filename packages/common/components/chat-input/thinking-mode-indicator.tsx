'use client';

import { useFeatureAccess } from '@repo/common/hooks/use-subscription-access';
import { useChatStore } from '@repo/common/store';
import { FeatureSlug } from '@repo/shared/types/subscription';
import { Badge } from '@repo/ui';
import { Brain, Zap } from 'lucide-react';
import { useMemo } from 'react';

export const ThinkingModeIndicator = () => {
    const thinkingMode = useChatStore(state => state.thinkingMode);
    const chatMode = useChatStore(state => state.chatMode);
    const hasThinkingModeAccess = useFeatureAccess(FeatureSlug.THINKING_MODE);

    // Check if current model supports thinking mode (specific Gemini 2.5 models only)
    const isThinkingCapableModel = useMemo(() => {
        const thinkingModeModels = [
            'gemini-2.5-flash',
            'gemini-2.5-flash-lite-preview-06-17',
            'gemini-2.5-flash-preview-05-20',
            'gemini-2.5-pro-preview-05-06',
            'gemini-2.5-pro-preview-06-05',
        ];
        return thinkingModeModels.includes(chatMode);
    }, [chatMode]);

    // Only show indicator if:
    // 1. User has access to thinking mode (VT+)
    // 2. Thinking mode is enabled
    // 3. Current model supports thinking mode (Gemini 2.5 Flash, Pro, Flash-Lite)
    if (!hasThinkingModeAccess || !thinkingMode.enabled || !isThinkingCapableModel) {
        return null;
    }

    return (
        <Badge
            variant="secondary"
            className="flex items-center gap-1 bg-purple-100 text-xs text-purple-700 hover:bg-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/30"
        >
            <Brain size={12} className="animate-pulse" />
            <span>Thinking Mode</span>
            <Zap size={10} className="text-purple-500" />
        </Badge>
    );
};
