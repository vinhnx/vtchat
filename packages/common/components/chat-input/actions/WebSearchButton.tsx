'use client';

import { useWebSearch as useWebSearchHook } from '@repo/common/hooks';
import { Globe } from 'lucide-react';
import { FeatureToggleButton } from './FeatureToggleButton';

export function WebSearchButton() {
    const { webSearchType } = useWebSearchHook();

    const getTooltip = (enabled: boolean) => {
        if (!enabled) return 'Native Web Search';

        switch (webSearchType) {
            case 'native':
                return 'Native Web Search - by Gemini';
            case 'openai':
                return 'Native Web Search - by OpenAI';
            case 'unsupported':
                return 'Native Web Search - by Gemini (models only)';
            default:
                return 'Native Web Search - by Gemini';
        }
    };

    const getLabel = () => {
        switch (webSearchType) {
            case 'native':
                return 'Web Search (Native)';
            case 'unsupported':
                return 'N/A';
            default:
                return 'Web Search';
        }
    };

    return (
        <FeatureToggleButton
            enabledSelector={(state) => state.useWebSearch}
            activeKey='webSearch'
            icon={<Globe />}
            label={getLabel()}
            colour='blue'
            tooltip={getTooltip}
            featureName='web search'
            logPrefix='🌐'
            loginDescription='Please log in to use web search functionality.'
        />
    );
}
