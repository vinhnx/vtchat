'use client';
import { useMcpToolsStore } from '@repo/common/store';
import { useSession } from '@repo/shared/lib/auth-client';
import { Alert, AlertDescription, DialogFooter } from '@repo/ui';
import { Button } from '@repo/ui/src/components/button';
import { IconAlertCircle, IconKey, IconSettings2, IconTrash, IconCreditCard } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

import { Badge, Dialog, DialogContent, Input } from '@repo/ui';

import { useChatEditor } from '@repo/common/hooks';
import { useState } from 'react';
import { ApiKeys, useApiKeysStore } from '../store/api-keys.store';
import { SETTING_TABS, useAppStore } from '../store/app.store';
import { useChatStore } from '../store/chat.store';
import { ChatEditor } from './chat-input';
import { BYOKIcon, ToolIcon } from './icons';
import { LoginRequiredDialog } from './login-required-dialog';
import { ModeToggle } from './mode-toggle';
import { UsageCreditsSettings } from './usage-credits-settings';

export const SettingsModal = () => {
    const isSettingOpen = useAppStore(state => state.isSettingsOpen);
    const setIsSettingOpen = useAppStore(state => state.setIsSettingsOpen);
    const settingTab = useAppStore(state => state.settingTab);
    const setSettingTab = useAppStore(state => state.setSettingTab);
    const { data: session } = useSession();
    const router = useRouter();
    const isSignedIn = !!session;

    // If not signed in, show login prompt instead of settings
    if (!isSignedIn) {
        const KeyIcon = ({ size, className }: { size?: number; className?: string }) => (
            <IconKey size={size} className={className} />
        );

        return (
            <LoginRequiredDialog
                isOpen={isSettingOpen}
                onClose={() => setIsSettingOpen(false)}
                title="Login Required"
                description="Please sign in to access settings and manage your API keys."
                icon={KeyIcon}
            />
        );
    }

    const settingMenu = [
        {
            icon: <IconSettings2 size={16} strokeWidth={2} className="text-muted-foreground" />,
            title: 'Customize',
            key: SETTING_TABS.PERSONALIZATION,
            component: <PersonalizationSettings onClose={() => setIsSettingOpen(false)} />,
        },
        {
            icon: <IconCreditCard size={16} strokeWidth={2} className="text-muted-foreground" />,
            title: 'Plan',
            key: SETTING_TABS.USAGE_CREDITS,
            component: <UsageCreditsSettings onClose={() => setIsSettingOpen(false)} />,
        },
        {
            icon: <IconKey size={16} strokeWidth={2} className="text-muted-foreground" />,
            title: 'API Keys',
            key: SETTING_TABS.API_KEYS,
            component: <ApiKeySettings />,
        },
        // {
        //     title: 'MCP Tools',
        //     key: SETTING_TABS.MCP_TOOLS,
        //     component: <MCPSettings />,
        // },
    ];

    return (
        <Dialog open={isSettingOpen} onOpenChange={() => setIsSettingOpen(false)}>
            <DialogContent
                ariaTitle="Settings"
                className="h-full max-h-[600px] !max-w-[760px] overflow-x-hidden rounded-xl p-0"
            >
                <div className="no-scrollbar relative max-w-full overflow-y-auto overflow-x-hidden">
                    <h3 className="border-border mx-5 border-b py-4 text-lg font-bold">Settings</h3>
                    <div className="flex flex-row gap-6 p-4">
                        <div className="flex w-[160px] shrink-0 flex-col gap-1">
                            {settingMenu.map(setting => (
                                <Button
                                    key={setting.key}
                                    rounded="full"
                                    className="justify-start"
                                    variant={settingTab === setting.key ? 'secondary' : 'ghost'}
                                    onClick={() => setSettingTab(setting.key)}
                                >
                                    {setting.icon}
                                    {setting.title}
                                </Button>
                            ))}
                        </div>
                        <div className="flex flex-1 flex-col overflow-hidden px-4">
                            {settingMenu.find(setting => setting.key === settingTab)?.component}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export const MCPSettings = () => {
    const [isAddToolDialogOpen, setIsAddToolDialogOpen] = useState(false);
    const { mcpConfig, addMcpConfig, removeMcpConfig, updateSelectedMCP, selectedMCP } =
        useMcpToolsStore();

    return (
        <div className="flex w-full flex-col gap-6 overflow-x-hidden">
            <div className="flex flex-col">
                <h2 className="flex items-center gap-1 text-base font-medium">MCP Tools</h2>
                <p className="text-muted-foreground text-xs">
                    Connect your MCP tools. This will only work with your own API keys.
                </p>
            </div>
            <div className="flex flex-col gap-2">
                <p className="text-muted-foreground text-xs font-medium">
                    Connected Tools{' '}
                    <Badge
                        variant="secondary"
                        className="text-brand inline-flex items-center gap-1 rounded-full bg-transparent"
                    >
                        <span className="bg-brand inline-block size-2 rounded-full"></span>
                        {mcpConfig && Object.keys(mcpConfig).length} Connected
                    </Badge>
                </p>
                {mcpConfig &&
                    Object.keys(mcpConfig).length > 0 &&
                    Object.keys(mcpConfig).map(key => (
                        <div
                            key={key}
                            className="bg-secondary divide-border border-border flex h-12 w-full flex-1 flex-row items-center gap-2 divide-x-2 rounded-lg border px-2.5 py-2"
                        >
                            <div className="flex w-full flex-row items-center gap-2">
                                <ToolIcon /> <Badge>{key}</Badge>
                                <p className="text-muted-foreground line-clamp-1 flex-1 text-sm">
                                    {mcpConfig[key]}
                                </p>
                                <Button
                                    size="xs"
                                    variant="ghost"
                                    tooltip="Delete Tool"
                                    onClick={() => {
                                        removeMcpConfig(key);
                                    }}
                                >
                                    <IconTrash
                                        size={14}
                                        strokeWidth={2}
                                        className="text-muted-foreground"
                                    />
                                </Button>
                            </div>
                        </div>
                    ))}

                <Button
                    size="sm"
                    rounded="full"
                    className="mt-2 self-start"
                    onClick={() => setIsAddToolDialogOpen(true)}
                >
                    Add Tool
                </Button>
            </div>

            <div className="mt-6 border-t border-dashed pt-6">
                <p className="text-muted-foreground text-xs">Learn more about MCP:</p>
                <div className="mt-2 flex flex-col gap-2 text-sm">
                    <a
                        href="https://mcp.composio.dev"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary inline-flex items-center hover:underline"
                    >
                        Browse Composio MCP Directory →
                    </a>
                    <a
                        href="https://www.anthropic.com/news/model-context-protocol"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary inline-flex items-center hover:underline"
                    >
                        Read MCP Documentation →
                    </a>
                </div>
            </div>

            <AddToolDialog
                isOpen={isAddToolDialogOpen}
                onOpenChange={setIsAddToolDialogOpen}
                onAddTool={addMcpConfig}
            />
        </div>
    );
};

type AddToolDialogProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onAddTool: (tool: Record<string, string>) => void;
};

const AddToolDialog = ({ isOpen, onOpenChange, onAddTool }: AddToolDialogProps) => {
    const [mcpToolName, setMcpToolName] = useState('');
    const [mcpToolUrl, setMcpToolUrl] = useState('');
    const [error, setError] = useState('');
    const { mcpConfig } = useMcpToolsStore();

    const handleAddTool = () => {
        // Validate inputs
        if (!mcpToolName.trim()) {
            setError('Tool name is required');
            return;
        }

        if (!mcpToolUrl.trim()) {
            setError('Tool URL is required');
            return;
        }

        // Check for duplicate names
        if (mcpConfig && mcpConfig[mcpToolName]) {
            setError('A tool with this name already exists');
            return;
        }

        // Clear error if any
        setError('');

        // Add the tool
        onAddTool({
            [mcpToolName]: mcpToolUrl,
        });

        // Reset form and close dialog
        setMcpToolName('');
        setMcpToolUrl('');
        onOpenChange(false);
    };

    // Reset error when dialog opens/closes
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setError('');
            setMcpToolName('');
            setMcpToolUrl('');
        }
        onOpenChange(open);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent ariaTitle="Add MCP Tool" className="!max-w-md">
                <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-bold">Add New MCP Tool</h3>

                    {error && (
                        <Alert variant="destructive">
                            <IconAlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Tool Name</label>
                        <Input
                            placeholder="Tool Name"
                            value={mcpToolName}
                            onChange={e => {
                                const key = e.target.value?.trim().toLowerCase().replace(/ /g, '-');
                                setMcpToolName(key);
                                // Clear error when user types
                                if (error) setError('');
                            }}
                        />
                        <p className="text-muted-foreground text-xs">
                            Will be automatically converted to lowercase with hyphens
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Tool Server URL</label>
                        <Input
                            placeholder="https://your-mcp-server.com"
                            value={mcpToolUrl}
                            onChange={e => {
                                setMcpToolUrl(e.target.value);
                                // Clear error when user types
                                if (error) setError('');
                            }}
                        />
                        <p className="text-muted-foreground text-xs">
                            Example: https://your-mcp-server.com
                        </p>
                    </div>
                </div>
                <DialogFooter className="border-border mt-4 border-t pt-4">
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="bordered"
                            rounded={'full'}
                            onClick={() => handleOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleAddTool} rounded="full">
                            Add Tool
                        </Button>
                    </div>
                </DialogFooter>
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
    ];

    const validateApiKey = (apiKey: string, provider: string): string | null => {
        if (!apiKey.trim()) {
            return 'API key is required';
        }

        // Basic format validation
        const validations: Record<string, RegExp> = {
            OpenAI: /^sk-[a-zA-Z0-9]{32,}$/,
            Anthropic: /^sk-ant-[a-zA-Z0-9\-_]{32,}$/,
            'Google Gemini': /^AIza[a-zA-Z0-9\-_]{35}$/,
            OpenRouter: /^sk-or-[a-zA-Z0-9\-_]{32,}$/,
            'Together AI': /^tok-[a-zA-Z0-9]{32,}$/,
            'Fireworks AI': /^fw-[a-zA-Z0-9]{32,}$/,
        };

        const pattern = validations[provider];
        if (pattern && !pattern.test(apiKey)) {
            return `Invalid ${provider} API key format`;
        }

        return null;
    };

    const handleSave = (keyName: keyof ApiKeys, value: string, provider: string) => {
        const error = validateApiKey(value, provider);
        if (error) {
            setValidationErrors(prev => ({ ...prev, [keyName]: error }));
            return;
        }

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
                    <IconKey size={20} className="text-blue-500" />
                    API Key Management
                    <BYOKIcon />
                </h2>
                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-full bg-blue-100 p-1 dark:bg-blue-900/40">
                            <IconKey size={14} className="text-blue-600 dark:text-blue-400" />
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
                                            <IconAlertCircle className="h-4 w-4" />
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
                                            <IconTrash size={14} />
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
                        • API keys are never shared with VTChat servers - they go directly to the AI
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
                        Choose how you want VTChat to look. Your preference will be saved and
                        applied across all your devices.
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
