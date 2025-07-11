'use client';

import { ChatMode } from '@repo/shared/config';
import { log } from '@repo/shared/logger';
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    Input,
    Label,
} from '@repo/ui';
import { ExternalLink, Key } from 'lucide-react';
import { useState } from 'react';
import { type ApiKeys, useApiKeysStore } from '../store/api-keys.store';

interface ApiKeyPromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    chatMode: ChatMode;
    onComplete?: () => void;
}

const getRequiredApiKeyForMode = (chatMode: ChatMode): keyof ApiKeys | null => {
    switch (chatMode) {
        case ChatMode.O3:
        case ChatMode.O3_Mini:
        case ChatMode.O4_Mini:
        case ChatMode.GPT_4o_Mini:
        case ChatMode.GPT_4o:
        case ChatMode.GPT_4_1_Mini:
        case ChatMode.GPT_4_1_Nano:
        case ChatMode.GPT_4_1:
            return 'OPENAI_API_KEY';
        case ChatMode.Pro:
        case ChatMode.GEMINI_2_5_FLASH:
        case ChatMode.GEMINI_2_5_PRO:
            return 'GEMINI_API_KEY';
        case ChatMode.CLAUDE_4_SONNET:
        case ChatMode.CLAUDE_4_OPUS:
            return 'ANTHROPIC_API_KEY';
        case ChatMode.DEEPSEEK_R1:
            return 'FIREWORKS_API_KEY';
        case ChatMode.GROK_3:
        case ChatMode.GROK_3_MINI:
            return 'XAI_API_KEY';
        // OpenRouter models
        case ChatMode.DEEPSEEK_V3_0324:
        case ChatMode.DEEPSEEK_R1_FREE:
        case ChatMode.QWEN3_235B_A22B:
        case ChatMode.QWEN3_32B:
        case ChatMode.MISTRAL_NEMO:
        case ChatMode.QWEN3_14B_FREE:
            return 'OPENROUTER_API_KEY';
        default:
            return null;
    }
};

const getApiKeyInfo = (provider: keyof ApiKeys) => {
    const info = {
        OPENAI_API_KEY: {
            name: 'OpenAI',
            url: 'https://platform.openai.com/api-keys',
            placeholder: 'sk-...',
            description: 'Get your API key from OpenAI Platform',
        },
        ANTHROPIC_API_KEY: {
            name: 'Anthropic',
            url: 'https://console.anthropic.com/settings/keys',
            placeholder: 'sk-ant-...',
            description: 'Get your API key from Anthropic Console',
        },
        GEMINI_API_KEY: {
            name: 'Google Gemini',
            url: 'https://ai.google.dev/api',
            placeholder: 'AIza...',
            description: 'Get your API key from Google AI Studio',
        },
        FIREWORKS_API_KEY: {
            name: 'Fireworks',
            url: 'https://fireworks.ai/api-keys',
            placeholder: 'fw-...',
            description: 'Get your API key from Fireworks AI',
        },
        XAI_API_KEY: {
            name: 'xAI Grok',
            url: 'https://x.ai/api',
            placeholder: 'xai-...',
            description: 'Get your API key from xAI',
        },
        JINA_API_KEY: {
            name: 'Jina',
            url: 'https://jina.ai/api',
            placeholder: 'jina-...',
            description: 'Get your API key from Jina AI',
        },
        OPENROUTER_API_KEY: {
            name: 'OpenRouter',
            url: 'https://openrouter.ai/keys',
            placeholder: 'sk-or-...',
            description: 'Get your API key from OpenRouter',
        },
        TOGETHER_API_KEY: {
            name: 'Together',
            url: 'https://api.together.xyz/settings/api-keys',
            placeholder: 'together-...',
            description: 'Get your API key from Together AI',
        },
    };

    return info[provider];
};

export const ApiKeyPromptModal = ({
    isOpen,
    onClose,
    chatMode,
    onComplete,
}: ApiKeyPromptModalProps) => {
    const requiredProvider = getRequiredApiKeyForMode(chatMode);
    const setApiKey = useApiKeysStore((state) => state.setKey);

    const [apiKeyValue, setApiKeyValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!requiredProvider) {
        return null;
    }

    const providerInfo = getApiKeyInfo(requiredProvider);

    const handleSave = async () => {
        if (!apiKeyValue.trim()) return;

        setIsLoading(true);
        try {
            setApiKey(requiredProvider, apiKeyValue.trim());
            onComplete?.();
            onClose();
            setApiKeyValue('');
        } catch (error) {
            log.error('Error saving API key:', { data: error });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setApiKeyValue('');
        onClose();
    };

    return (
        <Dialog onOpenChange={handleClose} open={isOpen}>
            <DialogContent ariaTitle="API Key Required" className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5" />
                        API Key Required
                    </DialogTitle>
                    <DialogDescription>
                        To use {chatMode} mode, you need to provide your {providerInfo.name} API
                        key.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="api-key">{providerInfo.name} API Key</Label>
                        <Input
                            autoFocus
                            id="api-key"
                            onChange={(e) => setApiKeyValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSave();
                                }
                            }}
                            placeholder={providerInfo.placeholder}
                            type="password"
                            value={apiKeyValue}
                        />
                        <p className="text-muted-foreground text-sm">{providerInfo.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <Button
                            className="flex items-center gap-1"
                            onClick={() => window.open(providerInfo.url, '_blank')}
                            size="sm"
                            variant="outlined"
                        >
                            <ExternalLink className="h-3 w-3" />
                            Get API Key
                        </Button>

                        <div className="flex gap-2">
                            <Button onClick={handleClose} variant="outlined">
                                Cancel
                            </Button>
                            <Button
                                disabled={!apiKeyValue.trim() || isLoading}
                                onClick={handleSave}
                            >
                                {isLoading ? 'Saving...' : 'Save & Continue'}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
