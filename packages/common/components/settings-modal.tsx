'use client';

import { useChatEditor } from '@repo/common/hooks';
import { useVtPlusAccess } from '@repo/common/hooks/use-subscription-access';
import { useSession } from '@repo/shared/lib/auth-client';
import {
    Alert,
    AlertDescription,
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    cn,
    Dialog,
    DialogContent,
    DialogTitle,
    Input,
    TypographyH1,
    TypographyH3,
    TypographyMuted,
} from '@repo/ui';
import { AlertCircle, Info, Key, Settings, Trash, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { SETTING_TABS, useAppStore } from '../store';
import { type ApiKeys, useApiKeysStore } from '../store/api-keys.store';
import { ChatEditor } from './chat-input';

import { CombinedSubscriptionSettings } from './combined-subscription-settings';
import { LoginRequiredDialog } from './login-required-dialog';
import { ModeToggle } from './mode-toggle';
import RateLimitUsageMeter from './rate-limit-usage-meter';
import { UserProfileSettings } from './user-profile-settings';

export const SettingsModal = () => {
    const isSettingsOpen = useAppStore((state) => state.isSettingsOpen);
    const setIsSettingsOpen = useAppStore((state) => state.setIsSettingsOpen);
    const settingTab = useAppStore((state) => state.settingTab);
    const setSettingTab = useAppStore((state) => state.setSettingTab);
    const { data: session } = useSession();
    const isSignedIn = !!session;
    const scrollRef = useRef<HTMLDivElement>(null);
    const panelContentRef = useRef<HTMLDivElement>(null);

    // Default to first panel if none selected
    useEffect(() => {
        if (isSettingsOpen && !settingTab) {
            setSettingTab(SETTING_TABS.USAGE_CREDITS);
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
        return (
            <LoginRequiredDialog
                description="Please sign in to access settings and manage your API keys."
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                title="Login Required"
            />
        );
    }

    const settingMenu = [
        {
            title: 'VT+',
            description: 'Premium features and usage management',
            key: SETTING_TABS.USAGE_CREDITS,
            component: <CombinedSubscriptionSettings onClose={() => setIsSettingsOpen(false)} />,
        },
        {
            title: 'Usage',
            description: 'Track your VT usage and explore upgrade options',
            key: SETTING_TABS.USAGE,
            component: <RateLimitUsageMeter userId={session?.user?.id} />,
        },
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
            title: 'API Keys',
            description: 'Connect your own AI providers',
            key: SETTING_TABS.API_KEYS,
            component: <ApiKeySettings />,
        },
    ];

    return (
        <Dialog onOpenChange={() => setIsSettingsOpen(false)} open={isSettingsOpen}>
            <DialogContent className="mx-1 h-full max-h-[95vh] min-h-[500px] w-[calc(100vw-0.5rem)] !max-w-[1200px] overflow-x-hidden rounded-lg p-0 md:mx-auto md:max-h-[85vh] md:min-h-[700px] md:w-[95vw] md:max-w-[1200px] md:rounded-xl">
                <DialogTitle className="sr-only">Settings</DialogTitle>
                <div
                    className="scrollbar-thin relative w-full overflow-y-auto overflow-x-hidden"
                    ref={scrollRef}
                >
                    {/* Header */}
                    <div className="border-border bg-background/95 sticky top-0 z-10 backdrop-blur-sm">
                        <div className="flex items-center justify-between px-3 py-3 md:px-6 md:py-4">
                            <div>
                                <TypographyH1 className="text-lg font-semibold md:text-xl">
                                    Settings
                                </TypographyH1>
                                <p className="text-muted-foreground text-xs md:text-sm">
                                    Customize your VT experience and manage your account
                                </p>
                            </div>
                            <Button
                                className="md:hidden"
                                onClick={() => setIsSettingsOpen(false)}
                                size="icon-sm"
                                variant="ghost"
                            >
                                <X size={18} strokeWidth={2} />
                            </Button>
                        </div>
                        <div className="border-border border-b" />
                    </div>

                    {/* Content */}
                    <div className="flex flex-col md:flex-row">
                        {/* Sidebar Navigation */}
                        <div className="border-border bg-muted/30 w-full shrink-0 border-b md:min-h-full md:w-[320px] md:border-b-0 md:border-r">
                            {/* Mobile horizontal scroll, desktop vertical nav */}
                            <nav className="flex gap-1 overflow-x-auto p-1 md:flex-col md:gap-0 md:space-y-2 md:overflow-x-visible md:p-4">
                                {settingMenu.map((setting) => (
                                    <button
                                        className={cn(
                                            'md:min-h-auto flex min-h-[44px] w-full items-start whitespace-nowrap rounded-lg p-2 text-left transition-colors md:w-auto md:whitespace-normal md:p-3',
                                            settingTab === setting.key
                                                ? 'bg-background text-foreground shadow-sm'
                                                : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
                                        )}
                                        key={setting.key}
                                        onClick={() => setSettingTab(setting.key)}
                                    >
                                        <div className="flex-1 space-y-0.5">
                                            <div className="text-xs font-medium md:text-base">
                                                {setting.title}
                                            </div>
                                            <div className="text-muted-foreground hidden text-xs md:block">
                                                {setting.description}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Main Content Area */}
                        <div
                            className="scrollbar-thin bg-background flex flex-1 justify-center overflow-y-auto p-3 md:p-8"
                            ref={panelContentRef}
                            style={{
                                minHeight: '500px',
                                maxHeight: 'calc(85vh - 120px)',
                            }}
                        >
                            <div className="w-full min-w-0 max-w-none md:min-w-[700px] lg:min-w-[800px]">
                                {
                                    settingMenu.find((setting) => setting.key === settingTab)
                                        ?.component
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export const ApiKeySettings = () => {
    const apiKeys = useApiKeysStore((state) => state.getAllKeys());
    const setApiKey = useApiKeysStore((state) => state.setKey);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const isVtPlus = useVtPlusAccess();

    const apiKeyList = [
        {
            name: 'OpenAI',
            key: 'OPENAI_API_KEY' as keyof ApiKeys,
            value: apiKeys.OPENAI_API_KEY,
            url: 'https://platform.openai.com/api-keys',
            placeholder: 'sk-...',
        },
        {
            name: 'Anthropic',
            key: 'ANTHROPIC_API_KEY' as keyof ApiKeys,
            value: apiKeys.ANTHROPIC_API_KEY,
            url: 'https://console.anthropic.com/settings/keys',
            placeholder: 'sk-ant-...',
        },
        {
            name: 'Google Gemini',
            key: 'GEMINI_API_KEY' as keyof ApiKeys,
            value: apiKeys.GEMINI_API_KEY,
            url: 'https://ai.google.dev/api',
            placeholder: 'AIza...',
        },
        {
            name: 'OpenRouter',
            key: 'OPENROUTER_API_KEY' as keyof ApiKeys,
            value: apiKeys.OPENROUTER_API_KEY,
            url: 'https://openrouter.ai/settings/keys',
            placeholder: 'sk-or-...',
        },
        {
            name: 'Together AI',
            key: 'TOGETHER_API_KEY' as keyof ApiKeys,
            value: apiKeys.TOGETHER_API_KEY,
            url: 'https://api.together.xyz/settings/api-keys',
            placeholder: 'tok-...',
        },
        {
            name: 'Fireworks AI',
            key: 'FIREWORKS_API_KEY' as keyof ApiKeys,
            value: apiKeys.FIREWORKS_API_KEY,
            url: 'https://app.fireworks.ai/settings/users/api-keys',
            placeholder: 'fw-...',
        },
        {
            name: 'xAI Grok',
            key: 'XAI_API_KEY' as keyof ApiKeys,
            value: apiKeys.XAI_API_KEY,
            url: 'https://x.ai/api',
            placeholder: 'xai-...',
        },
    ];

    const handleSave = (keyName: keyof ApiKeys, value: string, _provider: string) => {
        setValidationErrors((prev) => ({ ...prev, [keyName]: '' }));
        setApiKey(keyName, value);
        setIsEditing(null);
    };

    const handleEdit = (keyName: string) => {
        setIsEditing(keyName);
        setValidationErrors((prev) => ({ ...prev, [keyName]: '' }));
    };

    const getMaskedKey = (key: string) => {
        if (!key) return '';
        return '•'.repeat(16) + key.slice(-4);
    };

    return (
        <div className="w-full space-y-4 md:space-y-6">
            {/* Header */}
            <div className="w-full">
                <TypographyH3 className="text-base md:text-lg">API Keys</TypographyH3>
                <TypographyMuted className="text-xs md:text-sm">
                    Manage your AI provider API keys securely
                </TypographyMuted>
            </div>

            {/* Security Info Section */}
            <Card>
                <CardHeader className="pb-3 md:pb-6">
                    <CardTitle className="text-sm font-semibold md:text-lg">
                        Secure Local Storage
                    </CardTitle>
                    <CardDescription className="text-xs md:text-sm">
                        Your API keys are protected and never leave your device
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="border-border/50 bg-muted/20 rounded-lg border p-3 md:p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                                <Key className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1">
                                <div className="text-foreground text-xs font-medium md:text-sm">
                                    Privacy First
                                </div>
                                <div className="text-muted-foreground mt-1 text-xs">
                                    API keys are stored locally in your browser and never sent to
                                    our servers. They're used only for direct requests to AI
                                    providers.
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Free Gemini Flash Lite Message */}
            {!apiKeys.GEMINI_API_KEY && (
                <Card>
                    <CardHeader className="pb-3 md:pb-6">
                        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-blue-600 md:text-lg dark:text-blue-400">
                            <Info className="h-4 w-4 md:h-5 md:w-5" />
                            Free Gemini 2.5 Flash Lite Available
                        </CardTitle>
                        <CardDescription className="text-xs md:text-sm">
                            {isVtPlus
                                ? "You're using free Gemini 2.5 Flash Lite with VT+ enhanced limits"
                                : "You're currently using the free Gemini 2.5 Flash Lite with rate limits"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="border-border/50 rounded-lg border bg-blue-50 p-3 md:p-4 dark:bg-blue-950/20">
                            <div className="space-y-2 md:space-y-3">
                                <div className="text-foreground text-xs md:text-sm">
                                    <strong>Current limits:</strong>{' '}
                                    {isVtPlus
                                        ? '100 requests per day, 10 requests per minute (VT+ enhanced)'
                                        : '20 requests per day, 5 requests per minute'}
                                </div>
                                <div className="text-muted-foreground text-xs md:text-sm">
                                    {isVtPlus
                                        ? 'You have enhanced VT+ limits for free Gemini 2.5 Flash Lite. Add your own Gemini API key below for unlimited usage of all Gemini models.'
                                        : 'Add your own Google Gemini API key below to remove rate limits and unlock unlimited usage of all Gemini models.'}
                                </div>
                                <div className="text-muted-foreground text-xs md:text-sm">
                                    <strong>Pro tip:</strong> With your own API key, you'll have
                                    access to Gemini 2.5 Pro, Gemini 2.0 Flash, and other premium
                                    models without restrictions
                                    {isVtPlus
                                        ? ', plus you already enjoy enhanced limits (5x daily, 2x per-minute) with VT+'
                                        : ''}
                                    .
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* API Keys Management */}
            <Card>
                <CardHeader className="pb-3 md:pb-6">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold md:text-lg">
                        <Settings className="h-4 w-4 md:h-5 md:w-5" />
                        Configure Providers
                    </CardTitle>
                    <CardDescription className="text-xs md:text-sm">
                        Add API keys for the AI providers you want to use
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-0 md:space-y-4">
                    {apiKeyList.map((apiKey) => (
                        <div
                            className="border-border/50 bg-muted/20 space-y-2 rounded-lg border p-3 md:space-y-3 md:p-4"
                            key={apiKey.key}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="mb-1 flex items-center gap-2">
                                        <div className="text-foreground text-xs font-medium md:text-sm">
                                            {apiKey.name}
                                        </div>
                                        {apiKey.value && (
                                            <Badge
                                                className="bg-green-100 text-[10px] text-green-800 md:text-xs dark:bg-green-900/30 dark:text-green-200"
                                                variant="secondary"
                                            >
                                                Configured
                                            </Badge>
                                        )}
                                    </div>

                                    <a
                                        className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-xs underline-offset-2 hover:underline"
                                        href={apiKey.url}
                                        rel="noopener noreferrer"
                                        target="_blank"
                                    >
                                        Get API key →
                                    </a>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {isEditing === apiKey.key ? (
                                    <div className="space-y-3">
                                        <Input
                                            className={
                                                validationErrors[apiKey.key] ? 'border-red-500' : ''
                                            }
                                            onChange={(e) => setApiKey(apiKey.key, e.target.value)}
                                            placeholder={apiKey.placeholder}
                                            value={apiKey.value || ''}
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
                                                onClick={() =>
                                                    handleSave(
                                                        apiKey.key,
                                                        apiKey.value || '',
                                                        apiKey.name
                                                    )
                                                }
                                                size="sm"
                                                variant="default"
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                onClick={() => setIsEditing(null)}
                                                size="sm"
                                                variant="outline"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex w-full items-center gap-3">
                                        <div className="border-border bg-background min-w-0 flex-1 rounded-lg border px-3 py-2 font-mono text-sm">
                                            {apiKey.value ? (
                                                <span className="text-muted-foreground block truncate">
                                                    {getMaskedKey(apiKey.value)}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground italic">
                                                    No API key configured
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex shrink-0 gap-2">
                                            <Button
                                                className="whitespace-nowrap"
                                                onClick={() => handleEdit(apiKey.key)}
                                                size="sm"
                                                variant="outline"
                                            >
                                                {apiKey.value ? 'Update' : 'Add Key'}
                                            </Button>
                                            {apiKey.value && (
                                                <Button
                                                    className="border-red-200 text-red-600 hover:border-red-300 hover:text-red-700 dark:border-red-800 dark:hover:border-red-700"
                                                    onClick={() => {
                                                        setApiKey(apiKey.key, '');
                                                    }}
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                    <Trash size={14} />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Help Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                        <Info className="h-5 w-5 text-blue-500" />
                        Quick Guide
                    </CardTitle>
                    <CardDescription>
                        Everything you need to know about API key management
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[
                            "API keys are stored securely in your browser's local storage",
                            'You only need to configure keys for the AI providers you want to use',
                            'Keys are never shared with VT servers - they go directly to AI providers',
                            'You can update or remove keys at any time',
                        ].map((tip, index) => (
                            <div className="flex items-start gap-3" key={index}>
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                                    <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                                </div>
                                <div className="text-muted-foreground text-sm">{tip}</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

const MAX_CHAR_LIMIT = 6000;

interface PersonalizationSettingsProps {
    onClose?: () => void;
}

export const PersonalizationSettings = ({ onClose }: PersonalizationSettingsProps) => {
    const customInstructions = useAppStore((state) => state.customInstructions);
    const setCustomInstructions = useAppStore((state) => state.setCustomInstructions);
    const showExamplePrompts = useAppStore((state) => state.showExamplePrompts);
    const setShowExamplePrompts = useAppStore((state) => state.setShowExamplePrompts);
    const sidebarPlacement = useAppStore((state) => state.sidebarPlacement);
    const setSidebarPlacement = useAppStore((state) => state.setSidebarPlacement);

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
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="w-full">
                <TypographyH3>Preferences</TypographyH3>
                <TypographyMuted>Customize your VTChat experience and interface</TypographyMuted>
            </div>

            {/* Theme Preferences Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Visual Theme</CardTitle>
                    <CardDescription>
                        Choose how you want VT to look. Your preference will be saved and applied
                        across all your devices.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border-border/50 bg-muted/20 rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="text-foreground text-sm font-medium">
                                    Appearance
                                </div>
                                <div className="text-muted-foreground text-xs">
                                    Light, dark, or match your system setting
                                </div>
                            </div>
                            <ModeToggle onClose={onClose} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Interface Preferences Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Interface Preferences</CardTitle>
                    <CardDescription>
                        Customize your chat interface to match your workflow and preferences.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="border-border/50 bg-muted/20 rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="text-foreground text-sm font-medium">
                                    Sidebar Placement
                                </div>
                                <div className="text-muted-foreground text-xs">
                                    Choose whether to display the sidebar on the left or right side
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    className="min-w-[60px]"
                                    onClick={() => setSidebarPlacement('left')}
                                    size="sm"
                                    variant={sidebarPlacement === 'left' ? 'default' : 'outline'}
                                >
                                    Left
                                </Button>
                                <Button
                                    className="min-w-[60px]"
                                    onClick={() => setSidebarPlacement('right')}
                                    size="sm"
                                    variant={sidebarPlacement === 'right' ? 'default' : 'outline'}
                                >
                                    Right
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="border-border/50 bg-muted/20 rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="text-foreground text-sm font-medium">
                                    Example Prompts
                                </div>
                                <div className="text-muted-foreground text-xs">
                                    Show suggested prompts on the home screen to help you get
                                    started
                                </div>
                            </div>
                            <Button
                                className="min-w-[60px]"
                                onClick={() => setShowExamplePrompts(!showExamplePrompts)}
                                size="sm"
                                variant={showExamplePrompts ? 'default' : 'outline'}
                            >
                                {showExamplePrompts ? 'On' : 'Off'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Custom Instructions Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Custom Instructions</CardTitle>
                    <CardDescription>
                        Add personalized instructions that will be applied to every conversation.
                        This helps the AI understand your preferences and communication style.
                    </CardDescription>
                    <div className="text-muted-foreground mt-2 flex items-center gap-1 text-xs">
                        <span>
                            Character limit: {editor?.storage?.characterCount?.characters() || 0}/
                            {MAX_CHAR_LIMIT}
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="border-border rounded-lg border p-4">
                        <ChatEditor editor={editor} />
                    </div>
                    <div className="border-border/50 bg-muted/20 rounded-lg border p-4">
                        <div className="space-y-2">
                            <div className="text-foreground text-sm font-medium">Pro Tips</div>
                            <div className="text-muted-foreground text-xs">
                                Be specific about your preferences. Examples: "I'm a software
                                developer working with React", "Always provide code examples when
                                explaining concepts", or "I prefer step-by-step explanations".
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
