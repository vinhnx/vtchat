'use client';
import { useChatStore } from '@repo/common/store';
import { useSession } from '@repo/shared/lib/auth-client';
import { Alert, AlertDescription } from '@repo/ui';
import { Button } from '@repo/ui/src/components/button';
import { AlertCircle, Key, Trash, Settings, Info } from 'lucide-react';

import { Badge, Dialog, DialogContent, Input, cn, TypographyH2, TypographyH3, TypographyMuted } from '@repo/ui';

import { useChatEditor } from '@repo/common/hooks';
import { useState, useEffect, useRef } from 'react';
import { SETTING_TABS, useAppStore } from '../store';
import { ApiKeys, useApiKeysStore } from '../store/api-keys.store';
import { ChatEditor } from './chat-input';

import { LoginRequiredDialog } from './login-required-dialog';
import { ModeToggle } from './mode-toggle';
import { PlusSettings } from './plus-settings';
import { UsageCreditsSettings } from './usage-credits-settings';
import { UserProfileSettings } from './user-profile-settings';

export const SettingsModal = () => {
    const isSettingsOpen = useAppStore(state => state.isSettingsOpen);
    const setIsSettingsOpen = useAppStore(state => state.setIsSettingsOpen);
    const settingTab = useAppStore(state => state.settingTab);
    const setSettingTab = useAppStore(state => state.setSettingTab);
    const { data: session } = useSession();
    const isSignedIn = !!session;
    const scrollRef = useRef<HTMLDivElement>(null);
    const panelContentRef = useRef<HTMLDivElement>(null);

    // Default to first panel if none selected
    useEffect(() => {
        if (isSettingsOpen && !settingTab) {
            setSettingTab(SETTING_TABS.PROFILE);
        }
    }, [isSettingsOpen, settingTab, setSettingTab]);

    // Auto-scroll to top when settings modal opens
    useEffect(() => {
        if (isSettingsOpen && scrollRef.current) {
            scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [isSettingsOpen]);

    // Scroll to top of panel content when panel changes
    useEffect(() => {
        if (panelContentRef.current) {
            panelContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [settingTab]);

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
            title: 'Profile',
            description: 'Manage your account details',
            key: SETTING_TABS.PROFILE,
            component: <UserProfileSettings />,
        },
        {
            title: 'Preferences',
            description: 'Customize your VT experience',
            key: SETTING_TABS.PERSONALIZATION,
            component: <PersonalizationSettings onClose={() => setIsSettingsOpen(false)} />,
        },
        {
            title: 'Subscription',
            description: 'Manage your plan and usage',
            key: SETTING_TABS.USAGE_CREDITS,
            component: <UsageCreditsSettings onClose={() => setIsSettingsOpen(false)} />,
        },
        {
            title: 'VT+ Features',
            description: 'Premium AI capabilities and reasoning',
            key: SETTING_TABS.PLUS,
            component: <PlusSettings />,
        },
        {
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
                <div ref={scrollRef} className="no-scrollbar relative max-w-full overflow-y-auto overflow-x-hidden">
                    {/* Header */}
                    <div className="border-border bg-background/95 sticky top-0 z-10 backdrop-blur-sm">
                        <div className="flex items-center justify-between px-6 py-4">
                            <div>
                                <TypographyH2 className="text-xl font-semibold">Settings</TypographyH2>
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
                                            'flex w-full items-start rounded-lg p-3 text-left transition-colors',
                                            settingTab === setting.key
                                                ? 'bg-background text-foreground shadow-sm'
                                                : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
                                        )}
                                    >
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
                        <div className="flex-1 p-6 bg-background" ref={panelContentRef} style={{ overflowY: 'auto', maxHeight: '700px' }}>
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
        <div className="space-y-6">
            {/* Header */}
            <div>
                <TypographyH3>
                    API Keys
                </TypographyH3>
                <TypographyMuted>Manage your AI provider API keys securely</TypographyMuted>
            </div>

            {/* Security Info Section */}
            <div className="border border-border rounded-lg">
                <div className="border-b border-border p-6">
                    <TypographyH3 className="text-lg font-semibold">
                        Secure Local Storage
                    </TypographyH3>
                    <p className="text-sm text-muted-foreground">
                        Your API keys are protected and never leave your device
                    </p>
                </div>
                <div className="p-6">
                    <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                                <Key className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-medium text-foreground">Privacy First</div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                    API keys are stored locally in your browser and never sent to our servers. They're used only for direct requests to AI providers.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* API Keys Management */}
            <div className="border border-border rounded-lg">
                <div className="border-b border-border p-6">
                    <TypographyH3 className="text-lg font-semibold flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Configure Providers
                    </TypographyH3>
                    <p className="text-sm text-muted-foreground">
                        Add API keys for the AI providers you want to use
                    </p>
                </div>
                <div className="p-6 space-y-4">
                    {apiKeyList.map(apiKey => (
                        <div key={apiKey.key} className="rounded-lg border border-border/50 bg-muted/20 p-4 space-y-3">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="text-sm font-medium text-foreground">{apiKey.name}</div>
                                        {apiKey.value && (
                                            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 text-xs">
                                                Configured
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="text-xs text-muted-foreground mb-2">
                                        {apiKey.description}
                                    </div>
                                    <a
                                        href={apiKey.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 underline-offset-2 hover:underline"
                                    >
                                        Get API key →
                                    </a>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {isEditing === apiKey.key ? (
                                    <div className="space-y-3">
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
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setIsEditing(null)}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm">
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
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEdit(apiKey.key)}
                                        >
                                            {apiKey.value ? 'Update' : 'Add Key'}
                                        </Button>
                                        {apiKey.value && (
                                            <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                            setApiKey(apiKey.key, '');
                                            }}
                                            className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 dark:border-red-800 dark:hover:border-red-700"
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
            </div>

            {/* Help Section */}
            <div className="border border-border rounded-lg">
                <div className="border-b border-border p-6">
                    <TypographyH3 className="text-lg font-semibold flex items-center gap-2">
                        <Info className="h-5 w-5 text-blue-500" />
                        Quick Guide
                    </TypographyH3>
                    <p className="text-sm text-muted-foreground">
                        Everything you need to know about API key management
                    </p>
                </div>
                <div className="p-6">
                    <div className="space-y-3">
                        {[
                            "API keys are stored securely in your browser's local storage",
                            "You only need to configure keys for the AI providers you want to use",
                            "Keys are never shared with VT servers - they go directly to AI providers",
                            "You can update or remove keys at any time"
                        ].map((tip, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                                    <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                                </div>
                                <div className="text-sm text-muted-foreground">{tip}</div>
                            </div>
                        ))}
                    </div>
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
        <div className="space-y-6">
            {/* Header */}
            <div>
                <TypographyH3>Preferences</TypographyH3>
                <TypographyMuted>Customize your VTChat experience and interface</TypographyMuted>
            </div>

            {/* Theme Preferences Section */}
            <div className="border border-border rounded-lg">
                <div className="border-b border-border p-6">
                    <TypographyH3 className="text-lg font-semibold">
                        Visual Theme
                    </TypographyH3>
                    <p className="text-sm text-muted-foreground">
                        Choose how you want VT to look. Your preference will be saved and applied across all your devices.
                    </p>
                </div>
                <div className="p-6">
                    <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="text-sm font-medium text-foreground">Appearance</div>
                                <div className="text-xs text-muted-foreground">Light, dark, or match your system setting</div>
                            </div>
                            <ModeToggle onClose={onClose} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Interface Preferences Section */}
            <div className="border border-border rounded-lg">
                <div className="border-b border-border p-6">
                    <TypographyH3 className="text-lg font-semibold">
                        Interface Preferences
                    </TypographyH3>
                    <p className="text-sm text-muted-foreground">
                        Customize your chat interface to match your workflow and preferences.
                    </p>
                </div>
                <div className="p-6">
                    <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="text-sm font-medium text-foreground">Example Prompts</div>
                                <div className="text-xs text-muted-foreground">Show suggested prompts on the home screen to help you get started</div>
                            </div>
                            <Button
                                variant={showExamplePrompts ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setShowExamplePrompts(!showExamplePrompts)}
                                className="min-w-[60px]"
                            >
                                {showExamplePrompts ? 'On' : 'Off'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Instructions Section */}
            <div className="border border-border rounded-lg">
                <div className="border-b border-border p-6">
                    <TypographyH3 className="text-lg font-semibold">
                        Custom Instructions
                    </TypographyH3>
                    <p className="text-sm text-muted-foreground">
                        Add personalized instructions that will be applied to every conversation. This helps the AI understand your preferences and communication style.
                    </p>
                    <div className="text-muted-foreground flex items-center gap-1 text-xs mt-2">
                        <span>
                            Character limit: {editor?.storage?.characterCount?.characters() || 0}/{MAX_CHAR_LIMIT}
                        </span>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div className="rounded-lg border border-border p-4">
                        <ChatEditor editor={editor} />
                    </div>
                    <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
                        <div className="space-y-2">
                            <div className="text-sm font-medium text-foreground">Pro Tips</div>
                            <div className="text-xs text-muted-foreground">
                                Be specific about your preferences. Examples: "I'm a software developer working with React", "Always provide code examples when explaining concepts", or "I prefer step-by-step explanations".
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
