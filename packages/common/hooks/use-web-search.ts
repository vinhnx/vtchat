import { getModelFromChatMode, supportsNativeWebSearch } from '@repo/ai/models';
import { useMemo } from 'react';
import { useChatStore } from '../store';

export const useWebSearch = () => {
    const chatMode = useChatStore(state => state.chatMode);
    const useWebSearch = useChatStore(state => state.useWebSearch);
    const setUseWebSearch = useChatStore(state => state.setUseWebSearch);

    const currentModel = useMemo(() => getModelFromChatMode(chatMode), [chatMode]);
    
    const supportsNativeSearch = useMemo(() => 
        supportsNativeWebSearch(currentModel), 
        [currentModel]
    );

    const webSearchType = useMemo(() => {
        if (!useWebSearch) return 'none';
        if (supportsNativeSearch) return 'native';
        return 'unsupported';
    }, [useWebSearch, supportsNativeSearch]);

    return {
        useWebSearch,
        setUseWebSearch,
        webSearchType,
        supportsNativeSearch,
        currentModel,
    };
};

export type WebSearchType = 'none' | 'native' | 'unsupported';
