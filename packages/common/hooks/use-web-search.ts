'use client';

import {
    getModelFromChatMode,
    supportsNativeWebSearch,
    supportsOpenAIWebSearch,
} from '@repo/ai/models';
import { useMemo } from 'react';
import { useAppStore, useChatStore } from '../store';

export const useWebSearch = () => {
    const chatMode = useChatStore((state) => state.chatMode);
    const useWebSearch = useAppStore((state) => state.useWebSearch);
    const setUseWebSearch = useAppStore((state) => state.setUseWebSearch);

    const currentModel = useMemo(() => getModelFromChatMode(chatMode), [chatMode]);

    const supportsNativeSearch = useMemo(
        () => supportsNativeWebSearch(currentModel),
        [currentModel],
    );

    const supportsOpenAISearch = useMemo(
        () => supportsOpenAIWebSearch(currentModel),
        [currentModel],
    );

    const webSearchType = useMemo(() => {
        if (!useWebSearch) return 'none';
        if (supportsNativeSearch) return 'native';
        if (supportsOpenAISearch) return 'openai';
        return 'unsupported';
    }, [useWebSearch, supportsNativeSearch, supportsOpenAISearch]);

    return {
        useWebSearch,
        setUseWebSearch,
        webSearchType,
        supportsNativeSearch,
        supportsOpenAISearch,
        currentModel,
    };
};

export type WebSearchType = 'none' | 'native' | 'openai' | 'unsupported';
