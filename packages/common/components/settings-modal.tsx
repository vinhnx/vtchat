'use client';
import { useChatStore } from '@repo/common/store';
import { useSession } from '@repo/shared/lib/auth-client';
import { Alert, AlertDescription } from '@repo/ui';
import { Button } from '@repo/ui/src/components/button';
import { AlertCircle, CreditCard, Crown, Key, Settings2, Trash, Brain } from 'lucide-react';

import { Badge, Dialog, DialogContent, Input, cn } from '@repo/ui';

import { useChatEditor } from '@repo/common/hooks';
import { useState } from 'react';
import { ApiKeys, useApiKeysStore } from '../store/api-keys.store';
import { SETTING_TABS, useAppStore } from '../store';
import { ChatEditor } from './chat-input';
import { BYOKIcon } from './icons';
import { LoginRequiredDialog } from './login-required-dialog';
import { ModeToggle } from './mode-toggle';
import { PlusSettings } from './plus-settings';
import { ReasoningModeSettings } from './reasoning-mode-settings';
import { UsageCreditsSettings } from './usage-credits-settings';

export const SettingsModal = () => {
    const isSettingsOpen = useAppStore(state => state.isSettingsOpen);
    const setIsSettingsOpen = useAppStore(state => state.setIsSettingsOpen);
    const settingTab = useAppStore(state => state.settingTab);
    const setSettingTab = useAppStore(state => state.setSettingTab);
    const { data: session } = useSession();
    const isSignedIn = !!session;

    // If not signed in, show login prompt instead of settings
    if (!isSignedIn) {
        const KeyIcon = ({ size, className }: { size?: number; className?: string }) => (
            <Key size={size} className={className} />
        );

        return (
            <LoginRequiredDialog
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                title="Login Required"
                description="Please sign in to access settings and manage your API keys."
                icon={KeyIcon}
            />
        );
    }

    const settingMenu = [
        {
            icon: <Settings2 size={16} strokeWidth={2} className="text-muted-foreground" />,
            title: 'Preferences',
            description: 'Customize your VT experience',
            key: SETTING_TABS.PERSONALIZATION,
            component: <PersonalizationSettings onClose={() => setIsSettingsOpen(false)} />,
        },
        {
            icon: <CreditCard size={16} strokeWidth={2} className="text-muted-foreground" />,
            title: 'Subscription',
            description: 'Manage your plan and usage',
            key: SETTING_TABS.USAGE_CREDITS,
            component: <UsageCreditsSettings onClose={() => setIsSettingsOpen(false)} />,
        },
        {
            icon: <Crown size={16} strokeWidth={2} className="text-amber-500" />,
            title: 'VT+ Features',
            description: 'Premium AI capabilities',
            key: SETTING_TABS.PLUS,
            component: <PlusSettings />,
        },
        {
            icon: <Brain size={16} strokeWidth={2} className="text-[#D99A4E]" />,
            title: 'Reasoning Mode',
            description: 'AI reasoning and thinking',
            key: SETTING_TABS.REASONING_MODE,
            component: <ReasoningModeSettings />,
        },
        {
            icon: <Key size={16} strokeWidth={2} className="text-muted-foreground" />,
            title: 'API Keys',
            description: 'Connect your own AI providers',
            key: SETTING_TABS.API_KEYS,
            component: <ApiKeySettings />,
        },
    ];

    return (
        <Dialog open={isSettingsOpen} onOpenChange={() => setIsSettingsOpen(false)}>
            <DialogContent
                ariaTitle="Settings"
                className="h-full max-h-[700px] !max-w-[900px] overflow-x-hidden rounded-xl p-0"
            >
                <div className="no-scrollbar relative max-w-full overflow-y-auto overflow-x-hidden">
                    {/* Header */}
                    <div className="border-border bg-background/95 sticky top-0 z-10 backdrop-blur-sm">
                        <div className="flex items-center justify-between px-6 py-4">
                            <div>
                                <h2 className="text-xl font-semibold">Settings</h2>
                                <p className="text-muted-foreground text-sm">
                                    Customize your VT experience and manage your account
                                </p>
                            </div>
                        </div>
                        <div className="border-border border-b" />
                    </div>

                    {/* Content */}
                    <div className="flex flex-row">
                        {/* Sidebar Navigation */}
                        <div className="border-border bg-muted/30 min-h-full w-[280px] shrink-0 border-r">
                            {/* Make sidebar full height */}
                            <nav className="space-y-2 p-4">
                                {settingMenu.map(setting => (
                                    <button
                                        key={setting.key}
                                        onClick={() => setSettingTab(setting.key)}
                                        className={cn(
                                            'flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors',
                                            settingTab === setting.key
                                                ? 'bg-background text-foreground shadow-sm'
                                                : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
                                        )}
                                    >
                                        <div className="mt-0.5 shrink-0">{setting.icon}</div>
                                        <div className="flex-1 space-y-1">
                                            <div className="font-medium">{setting.title}</div>
                                            <div className="text-muted-foreground text-xs">
                                                {setting.description}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1 p-6">
                            <div className="max-w-2xl">
                                {settingMenu.find(setting => setting.key === settingTab)?.component}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export const ApiKeySettings = () => {
    const apiKeys = useApiKeysStore(state => state.getAllKeys());
    const setApiKey = useApiKeysStore(state => state.setKey);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const apiKeyList = [
        {
            name: 'OpenAI',
            key: 'OPENAI_API_KEY' as keyof ApiKeys,
            value: apiKeys.OPENAI_API_KEY,
            url: 'https://platform.openai.com/api-keys',
            description: 'Access advanced models',
            placeholder: 'sk-...',
        },
        {
            name: 'Anthropic',
            key: 'ANTHROPIC_API_KEY' as keyof ApiKeys,
            value: apiKeys.ANTHROPIC_API_KEY,
            url: 'https://console.anthropic.com/settings/keys',
            description: 'Access advanced models',
            placeholder: 'sk-ant-...',
        },
        {
            name: 'Google Gemini',
            key: 'GEMINI_API_KEY' as keyof ApiKeys,
            value: apiKeys.GEMINI_API_KEY,
            url: 'https://ai.google.dev/api',
            description: 'Access advanced models',
            placeholder: 'AIza...',
        },
        {
            name: 'OpenRouter',
            key: 'OPENROUTER_API_KEY' as keyof ApiKeys,
            value: apiKeys.OPENROUTER_API_KEY,
            url: 'https://openrouter.ai/settings/keys',
            description: 'Access advanced models',
            placeholder: 'sk-or-...',
        },
        {
            name: 'Together AI',
            key: 'TOGETHER_API_KEY' as keyof ApiKeys,
            value: apiKeys.TOGETHER_API_KEY,
            url: 'https://api.together.xyz/settings/api-keys',
            description: 'Access advanced models',
            placeholder: 'tok-...',
        },
        {
            name: 'Fireworks AI',
            key: 'FIREWORKS_API_KEY' as keyof ApiKeys,
            value: apiKeys.FIREWORKS_API_KEY,
            url: 'https://app.fireworks.ai/settings/users/api-keys',
            description: 'Fast inference for open-source and proprietary models',
            placeholder: 'fw-...',
        },
        {
            name: 'xAI Grok',
            key: 'XAI_API_KEY' as keyof ApiKeys,
            value: apiKeys.XAI_API_KEY,
            url: 'https://x.ai/api',
            description: 'Access Grok models with real-time knowledge',
            placeholder: 'xai-...',
        },
    ];

    const handleSave = (keyName: keyof ApiKeys, value: string, _provider: string) => {
        setValidationErrors(prev => ({ ...prev, [keyName]: '' }));
        setApiKey(keyName, value);
        setIsEditing(null);
    };

    const handleEdit = (keyName: string) => {
        setIsEditing(keyName);
        setValidationErrors(prev => ({ ...prev, [keyName]: '' }));
    };

    const getMaskedKey = (key: string) => {
        if (!key) return '';
        return '•'.repeat(16) + key.slice(-4);
    };

    return (
        <div className="flex flex-col gap-8">
            {/* Header Section */}
            <div className="flex flex-col gap-3">
                <h2 className="flex items-center gap-2 text-base font-semibold">
                    <Key size={20} className="text-blue-500" />
                    API Key Management
                    <BYOKIcon />
                </h2>
                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-full bg-blue-100 p-1 dark:bg-blue-900/40">
                            <Key size={14} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                Secure Local Storage
                            </p>
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                Your API keys are stored locally in your browser and never sent to
                                our servers. They are only used to make direct requests to the
                                respective AI providers.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* API Keys List */}
            <div className="flex flex-col gap-6">
                {apiKeyList.map(apiKey => (
                    <div key={apiKey.key} className="border-border space-y-3 rounded-lg border p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="mb-1 flex items-center gap-2">
                                    <h3 className="text-sm font-semibold">{apiKey.name}</h3>
                                    {apiKey.value && (
                                        <Badge variant="secondary" className="text-xs">
                                            Configured
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-muted-foreground mb-2 text-xs">
                                    {apiKey.description}
                                </p>
                                <a
                                    href={apiKey.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-blue-500 underline-offset-2 hover:text-blue-600 hover:underline"
                                >
                                    Get API key →
                                </a>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {isEditing === apiKey.key ? (
                                <div className="space-y-2">
                                    <Input
                                        value={apiKey.value || ''}
                                        placeholder={apiKey.placeholder}
                                        onChange={e => setApiKey(apiKey.key, e.target.value)}
                                        className={
                                            validationErrors[apiKey.key] ? 'border-red-500' : ''
                                        }
                                    />
                                    {validationErrors[apiKey.key] && (
                                        <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>
                                                {validationErrors[apiKey.key]}
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                    <div className="flex gap-2">
                                        <Button
                                            variant="default"
                                            size="sm"
                                            onClick={() =>
                                                handleSave(
                                                    apiKey.key,
                                                    apiKey.value || '',
                                                    apiKey.name
                                                )
                                            }
                                        >
                                            Save
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            size="sm"
                                            onClick={() => setIsEditing(null)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <div className="bg-muted/50 flex-1 rounded-md px-3 py-2 font-mono text-sm">
                                        {apiKey.value ? (
                                            <span className="text-muted-foreground">
                                                {getMaskedKey(apiKey.value)}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground italic">
                                                No API key configured
                                            </span>
                                        )}
                                    </div>
                                    <Button
                                        variant="outlined"
                                        size="sm"
                                        onClick={() => handleEdit(apiKey.key)}
                                    >
                                        {apiKey.value ? 'Update' : 'Add Key'}
                                    </Button>
                                    {apiKey.value && (
                                        <Button
                                            variant="outlined"
                                            size="sm"
                                            onClick={() => {
                                                setApiKey(apiKey.key, '');
                                            }}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash size={14} />
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Help Section */}
            <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="mb-2 text-sm font-medium">Need Help?</h4>
                <div className="text-muted-foreground space-y-1 text-xs">
                    <p>• Each API key is stored securely in your browser's local storage</p>
                    <p>• You only need to configure keys for the AI providers you want to use</p>
                    <p>
                        • API keys are never shared with VT servers - they go directly to the AI
                        providers
                    </p>
                    <p>• You can update or remove keys at any time</p>
                </div>
            </div>
        </div>
    );
};

const MAX_CHAR_LIMIT = 6000;

interface PersonalizationSettingsProps {
    onClose?: () => void;
}

export const PersonalizationSettings = ({ onClose }: PersonalizationSettingsProps) => {
    const customInstructions = useChatStore(state => state.customInstructions);
    const setCustomInstructions = useChatStore(state => state.setCustomInstructions);
    const showExamplePrompts = useAppStore(state => state.showExamplePrompts);
    const setShowExamplePrompts = useAppStore(state => state.setShowExamplePrompts);

    const { editor } = useChatEditor({
        charLimit: MAX_CHAR_LIMIT,
        defaultContent: customInstructions,
        placeholder:
            'E.g., "Always respond concisely", "Assume I\'m a beginner", or "Use bullet points for lists"',
        enableEnter: true,
        onUpdate(props) {
            setCustomInstructions(props.editor.getText());
        },
    });

    return (
        <div className="flex flex-col gap-8 pb-3">
            {/* Theme Preferences Section */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <h3 className="text-base font-semibold">Visual Theme</h3>
                    <p className="text-muted-foreground text-sm">
                        Choose how you want VT to look. Your preference will be saved and applied
                        across all your devices.
                    </p>
                </div>
                <div className="bg-muted/30 flex items-center justify-between rounded-lg p-3">
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium">Appearance</span>
                        <span className="text-muted-foreground text-xs">
                            Light, dark, or match your system setting
                        </span>
                    </div>
                    <ModeToggle onClose={onClose} />
                </div>
            </div>

            {/* Interface Preferences Section */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <h3 className="text-base font-semibold">Interface Preferences</h3>
                    <p className="text-muted-foreground text-sm">
                        Customize your chat interface to match your workflow and preferences.
                    </p>
                </div>
                <div className="bg-muted/30 flex items-center justify-between rounded-lg p-3">
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium">Example Prompts</span>
                        <p className="text-muted-foreground text-xs">
                            Show suggested prompts on the home screen to help you get started
                        </p>
                    </div>
                    <Button
                        variant={showExamplePrompts ? 'default' : 'outlined'}
                        size="sm"
                        onClick={() => setShowExamplePrompts(!showExamplePrompts)}
                        className="min-w-[60px]"
                    >
                        {showExamplePrompts ? 'On' : 'Off'}
                    </Button>
                </div>
            </div>

            {/* Custom Instructions Section */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <h3 className="text-base font-semibold">Custom Instructions</h3>
                    <p className="text-muted-foreground text-sm">
                        Add personalized instructions that will be applied to every conversation.
                        This helps the AI understand your preferences, communication style, and
                        specific needs without repeating them in each chat.
                    </p>
                    <div className="text-muted-foreground flex items-center gap-1 text-xs">
                        <span>
                            Character limit: {editor?.storage?.characterCount?.characters() || 0}/
                            {MAX_CHAR_LIMIT}
                        </span>
                    </div>
                </div>
                <div className="shadow-subtle-sm border-border rounded-lg border p-4">
                    <ChatEditor editor={editor} />
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-muted-foreground text-xs">
                        💡 <strong>Tip:</strong> Be specific about your preferences. Examples: "I'm
                        a software developer working with React", "Always provide code examples when
                        explaining concepts", or "I prefer step-by-step explanations".
                    </p>
                </div>
            </div>
        </div>
    );
};
