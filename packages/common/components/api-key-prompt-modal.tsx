'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@repo/ui';
import { Button } from '@repo/ui';
import { Input } from '@repo/ui';
import { Label } from '@repo/ui';
import { ExternalLink, Key } from 'lucide-react';
import { useApiKeysStore, ApiKeys } from '../store/api-keys.store';
import { ChatMode } from '@repo/shared/config';

interface ApiKeyPromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    chatMode: ChatMode;
    onComplete?: () => void;
}

const getRequiredApiKeyForMode = (chatMode: ChatMode): keyof ApiKeys | null => {
    switch (chatMode) {
        case ChatMode.O4_Mini:
        case ChatMode.GPT_4o_Mini:
        case ChatMode.GPT_4o:
        case ChatMode.GPT_4_1_Mini:
        case ChatMode.GPT_4_1_Nano:
        case ChatMode.GPT_4_1:
            return 'OPENAI_API_KEY';
        case ChatMode.Pro:
        case ChatMode.GEMINI_2_0_FLASH:
        case ChatMode.GEMINI_2_5_PRO:
        case ChatMode.GEMINI_2_0_FLASH_LITE:
        case ChatMode.GEMINI_2_5_FLASH_PREVIEW:
        case ChatMode.GEMINI_2_5_PRO_PREVIEW:
            return 'GEMINI_API_KEY';
        case ChatMode.CLAUDE_4_SONNET:
        case ChatMode.CLAUDE_4_OPUS:
            return 'ANTHROPIC_API_KEY';
        case ChatMode.DEEPSEEK_R1:
            return 'FIREWORKS_API_KEY';
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
            description: 'Get your API key from OpenAI Platform'
        },
        ANTHROPIC_API_KEY: {
            name: 'Anthropic',
            url: 'https://console.anthropic.com/settings/keys',
            placeholder: 'sk-ant-...',
            description: 'Get your API key from Anthropic Console'
        },
        GEMINI_API_KEY: {
            name: 'Google Gemini',
            url: 'https://ai.google.dev/api',
            placeholder: 'AIza...',
            description: 'Get your API key from Google AI Studio'
        },
        FIREWORKS_API_KEY: {
            name: 'Fireworks',
            url: 'https://fireworks.ai/api-keys',
            placeholder: 'fw-...',
            description: 'Get your API key from Fireworks AI'
        },
        JINA_API_KEY: {
            name: 'Jina',
            url: 'https://jina.ai/api',
            placeholder: 'jina-...',
            description: 'Get your API key from Jina AI'
        },
        OPENROUTER_API_KEY: {
            name: 'OpenRouter',
            url: 'https://openrouter.ai/keys',
            placeholder: 'sk-or-...',
            description: 'Get your API key from OpenRouter'
        },
        TOGETHER_API_KEY: {
            name: 'Together',
            url: 'https://api.together.xyz/settings/api-keys',
            placeholder: 'together-...',
            description: 'Get your API key from Together AI'
        }
    };
    
    return info[provider];
};

export const ApiKeyPromptModal = ({ isOpen, onClose, chatMode, onComplete }: ApiKeyPromptModalProps) => {
    const requiredProvider = getRequiredApiKeyForMode(chatMode);
    const setApiKey = useApiKeysStore(state => state.setKey);
    
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
            console.error('Error saving API key:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setApiKeyValue('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5" />
                        API Key Required
                    </DialogTitle>
                    <DialogDescription>
                        To use {chatMode} mode, you need to provide your {providerInfo.name} API key.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="api-key">
                            {providerInfo.name} API Key
                        </Label>
                        <Input
                            id="api-key"
                            type="password"
                            placeholder={providerInfo.placeholder}
                            value={apiKeyValue}
                            onChange={(e) => setApiKeyValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSave();
                                }
                            }}
                            autoFocus
                        />
                        <p className="text-sm text-muted-foreground">
                            {providerInfo.description}
                        </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(providerInfo.url, '_blank')}
                            className="flex items-center gap-1"
                        >
                            <ExternalLink className="h-3 w-3" />
                            Get API Key
                        </Button>
                        
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleSave} 
                                disabled={!apiKeyValue.trim() || isLoading}
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
