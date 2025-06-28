'use client';

import { ModelEnum, supportsReasoning, getModelFromChatMode } from '@repo/ai/models';
import { GatedFeatureAlert, MotionSkeleton, RateLimitIndicator } from '@repo/common/components';
import { useSubscriptionAccess, useWebSearch as useWebSearchHook } from '@repo/common/hooks';
import { useApiKeysStore, useChatStore, type ApiKeys } from '@repo/common/store';
import { ChatMode, ChatModeConfig } from '@repo/shared/config';
import { useSession } from '@repo/shared/lib/auth-client';
import { FeatureSlug, PlanSlug } from '@repo/shared/types/subscription';
import {
    Button,
    cn,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    Input,
    Kbd,
} from '@repo/ui';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowUp,
    BarChart3,
    Brain,
    Calculator,
    ChevronDown,
    Globe,
    Lock,
    Paperclip,
    Square,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { BYOKIcon } from '../icons';
import { LoginRequiredDialog } from '../login-required-dialog';
import { chatOptions, modelOptions, modelOptionsByProvider } from './chat-config';

export function AttachmentButton() {
    return (
        <Button
            size="icon"
            tooltip="Attachment (coming soon)"
            variant="ghost"
            className="gap-2"
            rounded="full"
            disabled
        >
            <Paperclip size={18} strokeWidth={2} className="text-muted-foreground" />
        </Button>
    );
}

export function ChatModeButton() {
    const chatMode = useChatStore(state => state.chatMode);
    const setChatMode = useChatStore(state => state.setChatMode);
    const [isChatModeOpen, setIsChatModeOpen] = useState(false);
    const { push } = useRouter();
    const [showGateAlert, setShowGateAlert] = useState<{
        feature?: string;
        plan?: string;
        title: string;
        message: string;
    } | null>(null);

    // Use the unified subscription system
    const { hasAccess, isLoaded } = useSubscriptionAccess();

    const selectedOption =
        [...chatOptions, ...modelOptions].find(option => option.value === chatMode) ??
        modelOptions[0];

    const currentModeConfig = ChatModeConfig[chatMode];

    // Check if current mode is gated using the unified system
    const isCurrentModeGated = (() => {
        if (!isLoaded) return false; // Don't show as gated while loading

        if (!currentModeConfig?.requiredFeature && !currentModeConfig?.requiredPlan) {
            return false; // Not gated if no requirements
        }

        let hasRequiredAccess = true;

        if (currentModeConfig.requiredFeature) {
            hasRequiredAccess = hasAccess({
                feature: currentModeConfig.requiredFeature as FeatureSlug,
            });
        }

        if (currentModeConfig.requiredPlan && hasRequiredAccess) {
            hasRequiredAccess = hasAccess({ plan: currentModeConfig.requiredPlan as PlanSlug });
        }

        return !hasRequiredAccess;
    })();

    const handleGatedFeature = (gateInfo: {
        feature?: string;
        plan?: string;
        title: string;
        message: string;
    }) => {
        setShowGateAlert(gateInfo);
        setIsChatModeOpen(false); // Close the dropdown
    };

    return (
        <>
            <DropdownMenu open={isChatModeOpen} onOpenChange={setIsChatModeOpen}>
                <DropdownMenuTrigger asChild>
                    {isCurrentModeGated ? (
                        <Button variant={'secondary'} size="xs" className="opacity-70">
                            {selectedOption?.icon}
                            {selectedOption?.label} (VT+)
                            <ChevronDown size={14} strokeWidth={2} />
                        </Button>
                    ) : (
                        <Button variant={'secondary'} size="xs">
                            {selectedOption?.icon}
                            {selectedOption?.label}
                            <ChevronDown size={14} strokeWidth={2} />
                        </Button>
                    )}
                </DropdownMenuTrigger>
                <ChatModeOptions
                    chatMode={chatMode}
                    setChatMode={setChatMode}
                    onGatedFeature={handleGatedFeature}
                />
            </DropdownMenu>

            {/* Gated Feature Alert Modal */}
            <Dialog open={!!showGateAlert} onOpenChange={open => !open && setShowGateAlert(null)}>
                <DialogContent className="mx-4 max-w-md rounded-xl">
                    <DialogTitle className="sr-only">
                        {showGateAlert?.title || 'Upgrade Required'}
                    </DialogTitle>
                    <div className="flex flex-col items-center gap-4 p-6 text-center">
                        <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/20">
                            <ArrowUp size={24} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">{showGateAlert?.title}</h3>
                            <p className="text-muted-foreground text-sm">
                                {showGateAlert?.message}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outlined" onClick={() => setShowGateAlert(null)}>
                                Cancel
                            </Button>
                            <Button onClick={() => push('/plus')}>Upgrade Now</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

export function WebSearchButton() {
    const useWebSearch = useChatStore(state => state.useWebSearch);
    const { webSearchType } = useWebSearchHook();
    const setActiveButton = useChatStore(state => state.setActiveButton);
    const { data: session } = useSession();
    const isSignedIn = !!session;
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    // Show web search button by default - gating handled at functionality level

    const handleWebSearchToggle = () => {
        if (!isSignedIn) {
            setShowLoginPrompt(true);
            return;
        }
        setActiveButton('webSearch');
    };

    return (
        <>
            <Button
                size={useWebSearch ? 'sm' : 'icon-sm'}
                tooltip={
                    useWebSearch
                        ? webSearchType === 'native'
                            ? 'Native Web Search - by Gemini'
                            : webSearchType === 'openai'
                              ? 'Native Web Search - by OpenAI'
                              : webSearchType === 'unsupported'
                                ? 'Native Web Search - by Gemini (models only)'
                                : 'Native Web Search - by Gemini'
                        : 'Native Web Search'
                }
                variant={useWebSearch ? 'secondary' : 'ghost'}
                className={cn('gap-2', useWebSearch && 'bg-blue-500/10 text-blue-500')}
                onClick={handleWebSearchToggle}
            >
                <Globe
                    size={16}
                    strokeWidth={2}
                    className={cn(useWebSearch ? '!text-blue-500' : 'text-muted-foreground')}
                />
                {useWebSearch && (
                    <p className="text-xs">
                        {webSearchType === 'native'
                            ? 'Web Search (Native)'
                            : webSearchType === 'unsupported'
                              ? 'N/A'
                              : 'Web Search'}
                    </p>
                )}
            </Button>

            {/* Login Required Dialog */}
            <LoginRequiredDialog
                isOpen={showLoginPrompt}
                onClose={() => setShowLoginPrompt(false)}
                title="Login Required"
                description="Please log in to use web search functionality."
            />
        </>
    );
}

export function MathCalculatorButton() {
    const mathCalculatorEnabled = useChatStore(state => state.useMathCalculator);
    const setActiveButton = useChatStore(state => state.setActiveButton);
    const { canAccess } = useSubscriptionAccess();
    const { data: session } = useSession();
    const isSignedIn = !!session;
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    // Check if user has access to math calculator feature
    const hasMathCalculatorAccess = canAccess(FeatureSlug.MATH_CALCULATOR);

    const handleMathCalculatorToggle = () => {
        if (!isSignedIn) {
            setShowLoginPrompt(true);
            return;
        }
        if (!hasMathCalculatorAccess) {
            // Show upgrade dialog if user doesn't have access
            console.log('🧮 Math calculator feature requires VT+ subscription');
            return;
        }
        console.log('🧮 Math calculator button clicked, current state:', mathCalculatorEnabled);
        setActiveButton('mathCalculator');
        console.log('🧮 Math calculator button toggled');
    };

    return (
        <>
            <GatedFeatureAlert
                requiredFeature={FeatureSlug.MATH_CALCULATOR}
                message="Math calculator requires VT+ subscription"
            >
                <Button
                    size={mathCalculatorEnabled ? 'sm' : 'icon-sm'}
                    tooltip={
                        mathCalculatorEnabled ? 'Math Calculator - Enabled' : 'Math Calculator'
                    }
                    variant={mathCalculatorEnabled ? 'secondary' : 'ghost'}
                    className={cn(
                        'gap-2',
                        mathCalculatorEnabled && 'bg-orange-500/10 text-orange-500'
                    )}
                    onClick={handleMathCalculatorToggle}
                    disabled={!hasMathCalculatorAccess}
                >
                    <Calculator
                        size={16}
                        strokeWidth={2}
                        className={cn(
                            mathCalculatorEnabled ? '!text-orange-500' : 'text-muted-foreground',
                            !hasMathCalculatorAccess && 'opacity-50'
                        )}
                    />
                    {mathCalculatorEnabled && hasMathCalculatorAccess && (
                        <p className="text-xs">Calculator</p>
                    )}
                </Button>
            </GatedFeatureAlert>

            {/* Login Required Dialog */}
            <LoginRequiredDialog
                isOpen={showLoginPrompt}
                onClose={() => setShowLoginPrompt(false)}
                title="Login Required"
                description="Please log in to use math calculator functionality."
            />
        </>
    );
}

export function ChartsButton() {
    const useCharts = useChatStore(state => state.useCharts);
    const setActiveButton = useChatStore(state => state.setActiveButton);
    const { canAccess } = useSubscriptionAccess();
    const { data: session } = useSession();
    const isSignedIn = !!session;
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    // Check if user has access to chart visualization feature
    const hasChartAccess = canAccess(FeatureSlug.CHART_VISUALIZATION);

    const handleChartsToggle = () => {
        if (!isSignedIn) {
            setShowLoginPrompt(true);
            return;
        }
        if (!hasChartAccess) {
            // Show upgrade dialog if user doesn't have access
            console.log('📊 Charts feature requires VT+ subscription');
            return;
        }
        console.log('📊 Charts button clicked, current state:', useCharts);
        setActiveButton('charts');
        console.log('📊 Charts button toggled');
    };

    return (
        <>
            <GatedFeatureAlert
                requiredFeature={FeatureSlug.CHART_VISUALIZATION}
                message="Chart visualization requires VT+ subscription"
            >
                <Button
                    size={useCharts ? 'sm' : 'icon-sm'}
                    tooltip={useCharts ? 'Charts & Graphs - Enabled' : 'Charts & Graphs'}
                    variant={useCharts ? 'secondary' : 'ghost'}
                    className={cn('gap-2', useCharts && 'bg-purple-500/10 text-purple-500')}
                    onClick={handleChartsToggle}
                    disabled={!hasChartAccess}
                >
                    <BarChart3
                        size={16}
                        strokeWidth={2}
                        className={cn(
                            useCharts ? '!text-purple-500' : 'text-muted-foreground',
                            !hasChartAccess && 'opacity-50'
                        )}
                    />
                    {useCharts && hasChartAccess && <p className="text-xs">Charts</p>}
                </Button>
            </GatedFeatureAlert>

            {/* Login Required Dialog */}
            <LoginRequiredDialog
                isOpen={showLoginPrompt}
                onClose={() => setShowLoginPrompt(false)}
                title="Login Required"
                description="Please log in to use charts and graphs functionality."
            />
        </>
    );
}

export function NewLineIndicator() {
    const editor = useChatStore(state => state.editor);
    const hasTextInput = !!editor?.getText();

    if (!hasTextInput) return null;

    return (
        <p className="flex flex-row items-center gap-1 text-xs text-gray-500">
            use <Kbd>Shift</Kbd> <Kbd>Enter</Kbd> for new line
        </p>
    );
}

export function GeneratingStatus() {
    return (
        <div className="text-muted-foreground flex flex-row items-center gap-2 px-2 text-xs">
            <MotionSkeleton className="h-3 w-3 rounded-full" />
        </div>
    );
}

// BYOK Setup Modal Component
export function BYOKSetupModal({
    isOpen,
    onClose,
    requiredApiKey,
    modelName,
    onApiKeySaved,
}: {
    isOpen: boolean;
    onClose: () => void;
    requiredApiKey: keyof ApiKeys;
    modelName: string;
    onApiKeySaved: () => void;
}) {
    const setApiKey = useApiKeysStore(state => state.setKey);
    const getAllKeys = useApiKeysStore(state => state.getAllKeys);
    const [apiKeyValue, setApiKeyValue] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const getProviderInfo = (key: keyof ApiKeys) => {
        switch (key) {
            case 'OPENAI_API_KEY':
                return {
                    name: 'OpenAI',
                    url: 'https://platform.openai.com/api-keys',
                    placeholder: 'sk-...',
                };
            case 'ANTHROPIC_API_KEY':
                return {
                    name: 'Anthropic',
                    url: 'https://console.anthropic.com/settings/keys',
                    placeholder: 'sk-ant-...',
                };
            case 'GEMINI_API_KEY':
                return {
                    name: 'Google Gemini',
                    url: 'https://ai.google.dev/api',
                    placeholder: 'AIza...',
                };
            case 'FIREWORKS_API_KEY':
                return {
                    name: 'Fireworks AI',
                    url: 'https://app.fireworks.ai/settings/users/api-keys',
                    placeholder: 'fw-...',
                };
            case 'XAI_API_KEY':
                return {
                    name: 'xAI Grok',
                    url: 'https://x.ai/api',
                    placeholder: 'xai-...',
                };
            case 'OPENROUTER_API_KEY':
                return {
                    name: 'OpenRouter',
                    url: 'https://openrouter.ai/keys',
                    placeholder: 'sk-or-...',
                };
            default:
                return {
                    name: 'API Provider',
                    url: '#',
                    placeholder: 'Enter API key...',
                };
        }
    };

    const provider = getProviderInfo(requiredApiKey);

    const handleSave = async () => {
        if (!apiKeyValue.trim()) return;

        setIsSaving(true);
        try {
            // Save the API key
            setApiKey(requiredApiKey, apiKeyValue.trim());

            // Verify the key was saved by checking storage immediately
            setTimeout(() => {
                const savedKeys = getAllKeys();
                if (savedKeys[requiredApiKey] === apiKeyValue.trim()) {

                } else {
                    console.error(`[BYOK Modal] API key verification failed for ${requiredApiKey}`);
                }
            }, 200);

            setApiKeyValue('');
            onApiKeySaved();
            onClose();
        } catch (error) {
            console.error('Failed to save API key:', error);
            // Show error to user
            alert('Failed to save API key. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        setApiKeyValue('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="mx-4 max-w-md rounded-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BYOKIcon />
                        Setup API Key Required
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 p-6">
                    <div className="space-y-2">
                        <p className="text-muted-foreground text-sm">
                            To use <span className="font-medium">{modelName}</span>, you need to
                            provide your own {provider.name} API key.
                        </p>
                        <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950/20">
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                Your API key is stored locally and never sent to our servers.
                            </p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{provider.name} API Key</label>
                            <Input
                                type="password"
                                placeholder={provider.placeholder}
                                value={apiKeyValue}
                                onChange={e => setApiKeyValue(e.target.value)}
                                className="font-mono"
                            />
                        </div>
                        <a
                            href={provider.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-500 underline-offset-2 hover:text-blue-600 hover:underline"
                        >
                            Get {provider.name} API key →
                        </a>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outlined" onClick={handleClose} className="flex-1">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!apiKeyValue.trim() || isSaving}
                            className="flex-1"
                        >
                            {isSaving ? 'Saving...' : 'Save & Continue'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function ChatModeOptions({
    setChatMode,
    onGatedFeature,
    _isRetry = false,
}: {
    chatMode: ChatMode;
    setChatMode: (chatMode: ChatMode) => void;
    onGatedFeature: (gateInfo: {
        feature?: string;
        plan?: string;
        title: string;
        message: string;
    }) => void;
    _isRetry?: boolean;
}) {
    const { data: session } = useSession();
    const isSignedIn = !!session;
    const hasApiKeyForChatMode = useApiKeysStore(state => state.hasApiKeyForChatMode);
    const apiKeys = useApiKeysStore(state => state.getAllKeys());
    const _isChatPage = usePathname().startsWith('/chat');
    const { push } = useRouter();

    // Login prompt state
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    // BYOK modal state
    const [byokModalOpen, setBYOKModalOpen] = useState(false);
    const [pendingMode, setPendingMode] = useState<{
        mode: ChatMode;
        requiredApiKey: keyof ApiKeys;
        modelName: string;
    } | null>(null);

    // Use the unified subscription system
    const { hasAccess, isLoaded } = useSubscriptionAccess();

    const handleModeSelect = (mode: ChatMode) => {
        const config = ChatModeConfig[mode];
        const option = [...chatOptions, ...modelOptions].find(opt => opt.value === mode);
        const modelOption = modelOptions.find(opt => opt.value === mode);

        // Check if user is signed in for any model selection
        if (!isSignedIn) {
            setShowLoginPrompt(true);
            return;
        }

        // Check auth requirement
        if (config?.isAuthRequired && !isSignedIn) {
            push('/login');
            return;
        }

        // BYOK Check: For both chat options and model options, check if required API key exists
        const requiredApiKey = modelOption?.requiredApiKey || (option as any)?.requiredApiKey;
        if (requiredApiKey) {
            const hasRequiredApiKey = !!apiKeys[requiredApiKey];

            if (!hasRequiredApiKey) {
                // Store the pending mode selection and open BYOK modal
                setPendingMode({
                    mode,
                    requiredApiKey,
                    modelName: option?.label || 'this model',
                });
                setBYOKModalOpen(true);
                return;
            }
        }

        // CRITICAL: Check subscription requirements using the unified system
        // Deep Research and Pro Search MUST be blocked for base users
        if (config?.requiredFeature || config?.requiredPlan) {
            // Wait for subscription status to load
            if (!isLoaded) {
                return; // Don't allow selection while loading
            }

            // CRITICAL: Explicit check for Deep Research and Pro Search
            const isCriticalMode = mode === ChatMode.Deep || mode === ChatMode.Pro;
            
            // BYOK bypass: If user has Gemini API key, allow Deep Research and Pro Search without subscription
            const hasByokGeminiKey = !!apiKeys['GEMINI_API_KEY'];
            const isByokEligibleMode = mode === ChatMode.Deep || mode === ChatMode.Pro;

            if (isByokEligibleMode && hasByokGeminiKey) {
                // Bypass subscription check for BYOK Gemini users ONLY
            } else {
                let hasRequiredAccess = true;

                // Check feature access
                if (config.requiredFeature) {
                    hasRequiredAccess = hasAccess({
                        feature: config.requiredFeature as FeatureSlug,
                    });
                }

                // Check plan access
                if (config.requiredPlan && hasRequiredAccess) {
                    hasRequiredAccess = hasAccess({ plan: config.requiredPlan as PlanSlug });
                }

                // If user doesn't have access, show gated feature dialog
                if (!hasRequiredAccess) {
                    onGatedFeature({
                        feature: config.requiredFeature,
                        plan: config.requiredPlan,
                        title: `${option?.label}`,
                        message: `${option?.label} is a premium feature. Upgrade to VT+ to access advanced AI models and features.`,
                    });
                    return;
                }
            }
        }

        // Otherwise proceed with the mode change
        setChatMode(mode);
    };

    const handleBYOKSaved = () => {
        // After API key is saved, retry the mode selection
        if (pendingMode) {
            setChatMode(pendingMode.mode);
            setPendingMode(null);
        }
    };

    const handleBYOKClose = () => {
        setBYOKModalOpen(false);
        setPendingMode(null);
    };

    // Helper function to check if a mode is gated
    const isModeGated = (mode: ChatMode): boolean => {
        if (!isLoaded) return true; // Show as gated while loading to prevent unauthorized access

        const config = ChatModeConfig[mode];
        if (!config?.requiredFeature && !config?.requiredPlan) {
            return false; // Not gated if no requirements
        }

        // CRITICAL: Explicit check for Deep Research and Pro Search
        if (mode === ChatMode.Deep || mode === ChatMode.Pro) {
            // Check BYOK bypass first for these specific modes
            const hasByokGeminiKey = !!apiKeys['GEMINI_API_KEY'];
            if (hasByokGeminiKey) {
                return false; // Not gated if user has BYOK Gemini key
            }

            // For Deep Research and Pro Search, user MUST have VT+ subscription
            const hasVtPlusAccess = hasAccess({ plan: PlanSlug.VT_PLUS });
            const hasFeatureAccess = mode === ChatMode.Deep 
                ? hasAccess({ feature: FeatureSlug.DEEP_RESEARCH })
                : hasAccess({ feature: FeatureSlug.PRO_SEARCH });
                
            return !(hasVtPlusAccess && hasFeatureAccess);
        }

        // For other modes, use regular logic
        let hasRequiredAccess = true;

        if (config.requiredFeature) {
            hasRequiredAccess = hasAccess({ feature: config.requiredFeature as FeatureSlug });
        }

        if (config.requiredPlan && hasRequiredAccess) {
            hasRequiredAccess = hasAccess({ plan: config.requiredPlan as PlanSlug });
        }

        return !hasRequiredAccess;
    };

    // Handler for dropdown item selection with gating
    const handleDropdownSelect = (mode: ChatMode) => {
        // CRITICAL: Check specifically for Deep Research and Pro Search
        if (mode === ChatMode.Deep || mode === ChatMode.Pro) {
            // Check BYOK bypass first
            const hasByokGeminiKey = !!apiKeys['GEMINI_API_KEY'];
            if (!hasByokGeminiKey) {
                // No BYOK key, check subscription
                const hasVtPlusAccess = hasAccess({ plan: PlanSlug.VT_PLUS });
                const hasFeatureAccess = mode === ChatMode.Deep 
                    ? hasAccess({ feature: FeatureSlug.DEEP_RESEARCH })
                    : hasAccess({ feature: FeatureSlug.PRO_SEARCH });
                
                if (!hasVtPlusAccess || !hasFeatureAccess) {
                    // Block access - show gated feature dialog
                    const option = [...chatOptions, ...Object.values(modelOptionsByProvider).flat()]
                        .find(opt => opt.value === mode);
                    
                    onGatedFeature({
                        feature: mode === ChatMode.Deep ? FeatureSlug.DEEP_RESEARCH : FeatureSlug.PRO_SEARCH,
                        plan: PlanSlug.VT_PLUS,
                        title: `${option?.label}`,
                        message: `${option?.label} is a VT+ exclusive feature. Upgrade to VT+ to access advanced AI research capabilities.`,
                    });
                    return;
                }
            }
        } else {
            // For other modes, use the regular gating check
            const isGated = isModeGated(mode);
            if (isGated) {
                // Show gated feature dialog instead of selecting
                const config = ChatModeConfig[mode];
                const option = [...chatOptions, ...Object.values(modelOptionsByProvider).flat()]
                    .find(opt => opt.value === mode);
                
                onGatedFeature({
                    feature: config.requiredFeature,
                    plan: config.requiredPlan,
                    title: `${option?.label}`,
                    message: `${option?.label} is a premium feature. Upgrade to VT+ to access advanced AI models and features.`,
                });
                return;
            }
        }
        
        // If not gated, proceed with normal selection
        handleModeSelect(mode);
    };

    return (
        <>
            <DropdownMenuContent
                align="start"
                side="bottom"
                className="no-scrollbar max-h-[300px] w-[300px] overflow-y-auto"
            >
                {/* Always show Advanced Mode options regardless of page context */}
                <DropdownMenuGroup>
                    <DropdownMenuLabel>Advanced Mode</DropdownMenuLabel>
                    {chatOptions.map(option => {
                        const isGated = isModeGated(option.value);

                        return (
                            <DropdownMenuItem
                                key={`advanced-${option.value}`}
                                onSelect={() => handleDropdownSelect(option.value)}
                                className="h-auto"
                            >
                                <div className="flex w-full flex-row items-start gap-1.5 px-1.5 py-1.5">
                                    <div className="flex flex-col gap-0 pt-1">{option.icon}</div>
                                    <div className="flex flex-col gap-0">
                                        <p className="m-0 text-sm font-medium">
                                            {option.label}
                                        </p>
                                        {option.description && (
                                            <p className="text-muted-foreground text-xs font-light">
                                                {option.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex-1" />
                                    {supportsReasoning(getModelFromChatMode(option.value)) && (
                                        <Brain size={14} className="text-purple-500" title="Reasoning Model" />
                                    )}
                                </div>
                            </DropdownMenuItem>
                        );
                    })}
                </DropdownMenuGroup>
                <DropdownMenuGroup>
                    <DropdownMenuLabel>Models</DropdownMenuLabel>
                    {Object.entries(modelOptionsByProvider).map(([providerName, options]) => (
                        <div key={providerName}>
                            <DropdownMenuLabel className="text-muted-foreground py-1 pl-2 text-xs font-normal">
                                {providerName}
                            </DropdownMenuLabel>
                            {options.map(option => {
                                const isGated = isModeGated(option.value);
                                const isFreeModel = option.value === ChatMode.GEMINI_2_5_FLASH_LITE;

                                return (
                                    <DropdownMenuItem
                                        key={`model-${option.value}`}
                                        onSelect={() => handleDropdownSelect(option.value)}
                                        className="h-auto pl-4"
                                    >
                                        <div className="flex w-full flex-row items-center gap-2.5 px-1.5 py-1.5">
                                            <div className="flex flex-col gap-0">
                                                <p className="text-sm font-medium">
                                                    {option.label}
                                                </p>
                                                {isFreeModel && (option as any).description && (
                                                    <p className="text-muted-foreground text-xs">
                                                        {(option as any).description}
                                                    </p>
                                                )}
                                                {isFreeModel && isSignedIn && (
                                                    <RateLimitIndicator
                                                        modelId={ModelEnum.GEMINI_2_5_FLASH_LITE}
                                                        compact
                                                        className="mt-1"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-1" />
                                            {isGated && (
                                                <Lock size={14} className="text-muted-foreground" />
                                            )}
                                            {supportsReasoning(option.value) && (
                                                <Brain size={14} className="text-purple-500" title="Reasoning Model" />
                                            )}
                                            {option.icon && (
                                                <div className="flex items-center">
                                                    {option.icon}
                                                    </div>
                                                    )}
                                        </div>
                                    </DropdownMenuItem>
                                );
                            })}
                        </div>
                    ))}
                </DropdownMenuGroup>
            </DropdownMenuContent>

            {/* BYOK Setup Modal */}
            {pendingMode && (
                <BYOKSetupModal
                    isOpen={byokModalOpen}
                    onClose={handleBYOKClose}
                    requiredApiKey={pendingMode.requiredApiKey}
                    modelName={pendingMode.modelName}
                    onApiKeySaved={handleBYOKSaved}
                />
            )}

            {/* Login Required Dialog */}
            <LoginRequiredDialog
                isOpen={showLoginPrompt}
                onClose={() => setShowLoginPrompt(false)}
                title="Login Required"
                description="Please log in to select and use different AI models."
            />
        </>
    );
}

export function SendStopButton({
    isGenerating,
    isChatPage,
    stopGeneration,
    hasTextInput,
    sendMessage,
}: {
    isGenerating: boolean;
    isChatPage: boolean;
    stopGeneration: () => void;
    hasTextInput: boolean;
    sendMessage: () => void;
}) {
    return (
        <div className="flex flex-row items-center gap-2">
            <AnimatePresence mode="wait" initial={false}>
                {isGenerating && !isChatPage ? (
                    <motion.div
                        key="stop-button"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Button
                            size="icon-sm"
                            variant="default"
                            onClick={stopGeneration}
                            tooltip="Stop Generation"
                        >
                            <Square size={14} strokeWidth={2} />
                        </Button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="send-button"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Button
                            size="icon-sm"
                            tooltip="Send Message"
                            variant={hasTextInput ? 'default' : 'secondary'}
                            disabled={!hasTextInput || isGenerating}
                            onClick={() => {
                                sendMessage();
                            }}
                        >
                            <ArrowUp size={16} strokeWidth={2} />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
