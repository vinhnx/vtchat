"use client";

import type { ErrorContext } from "@repo/ai/services/error-messages";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui";
import { AlertCircle, ExternalLink, Settings } from "lucide-react";
import { useState } from "react";

export interface ErrorDisplayProps {
    title: string;
    message: string;
    action?: string;
    helpUrl?: string;
    upgradeUrl?: string;
    settingsAction?: string;
    onRetry?: () => void;
    onOpenSettings?: () => void;
    className?: string;
}

/**
 * Enhanced error display component that can work with the centralized error service
 */
export interface EnhancedErrorDisplayProps {
    error: Error | string;
    context?: ErrorContext;
    onRetry?: () => void;
    onOpenSettings?: () => void;
    className?: string;
    fallbackProps?: Partial<ErrorDisplayProps>;
}

export const ErrorDisplay = ({
    title,
    message,
    action,
    helpUrl,
    upgradeUrl,
    settingsAction,
    onRetry,
    onOpenSettings,
    className = "",
}: ErrorDisplayProps) => {
    const [isRetrying, setIsRetrying] = useState(false);

    const handleRetry = async () => {
        if (!onRetry) return;

        setIsRetrying(true);
        try {
            await onRetry();
        } finally {
            setIsRetrying(false);
        }
    };

    const handleOpenSettings = () => {
        if (onOpenSettings) {
            onOpenSettings();
        } else if (settingsAction === "open_api_keys") {
            // Default behavior to open settings
            window.location.href = "/settings?tab=api-keys";
        }
    };

    const formatActionText = (actionText: string) => {
        // Split action text by newlines and render as list items
        const steps = actionText.split("\n").filter((step) => step.trim());

        if (steps.length <= 1) {
            return <p className="text-muted-foreground text-sm">{actionText}</p>;
        }

        return (
            <ol className="text-muted-foreground list-inside list-decimal space-y-1 text-sm">
                {steps.map((step, index) => (
                    <li key={index} className="pl-2">
                        {step.replace(/^\d+\.\s*/, "")}
                    </li>
                ))}
            </ol>
        );
    };

    return (
        <Card className={`border-destructive/20 ${className}`}>
            <CardHeader className="pb-3">
                <CardTitle className="text-destructive flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    {title}
                </CardTitle>
                <CardDescription className="text-base">{message}</CardDescription>
            </CardHeader>

            {action && (
                <CardContent className="pt-0">
                    <div className="space-y-4">
                        <div className="bg-muted/50 rounded-lg p-3">
                            <h4 className="mb-2 text-sm font-medium">How to fix this:</h4>
                            {formatActionText(action)}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {helpUrl && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(helpUrl, "_blank")}
                                    className="flex items-center gap-1"
                                >
                                    <ExternalLink className="h-3 w-3" />
                                    Get API Key
                                </Button>
                            )}

                            {(settingsAction || onOpenSettings) && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleOpenSettings}
                                    className="flex items-center gap-1"
                                >
                                    <Settings className="h-3 w-3" />
                                    Open Settings
                                </Button>
                            )}

                            {upgradeUrl && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(upgradeUrl, "_blank")}
                                    className="flex items-center gap-1"
                                >
                                    Upgrade to VT+
                                </Button>
                            )}

                            {onRetry && (
                                <Button size="sm" onClick={handleRetry} disabled={isRetrying}>
                                    {isRetrying ? "Retrying..." : "Try Again"}
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            )}
        </Card>
    );
};

/**
 * Enhanced error display that uses the centralized error message service
 */
export const EnhancedErrorDisplay = ({
    error,
    context = {},
    onRetry,
    onOpenSettings,
    className = "",
    fallbackProps = {},
}: EnhancedErrorDisplayProps) => {
    const [errorMessage, setErrorMessage] = useState<ErrorMessage | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const generateErrorMessage = async () => {
            try {
                const { generateErrorMessage: centralizedGenerator } = await import(
                    "@repo/ai/services/error-messages"
                );
                const result = centralizedGenerator(error, context);
                setErrorMessage(result);
            } catch (_serviceError) {
                // Fallback to basic error display
                const errorText = typeof error === "string" ? error : error.message;
                setErrorMessage({
                    title: fallbackProps.title || "Error",
                    message: fallbackProps.message || errorText || "An unexpected error occurred",
                    action: fallbackProps.action,
                    helpUrl: fallbackProps.helpUrl,
                    upgradeUrl: fallbackProps.upgradeUrl,
                    settingsAction: fallbackProps.settingsAction,
                });
            } finally {
                setIsLoading(false);
            }
        };

        generateErrorMessage();
    }, [error, context, fallbackProps]);

    if (isLoading) {
        return (
            <Card className={`border-orange-200 bg-orange-50 ${className}`}>
                <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                        <AlertCircle className="h-5 w-5 animate-pulse text-orange-600" />
                        <span className="text-orange-800">Loading error details...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!errorMessage) {
        return null;
    }

    return (
        <ErrorDisplay
            {...errorMessage}
            onRetry={onRetry}
            onOpenSettings={onOpenSettings}
            className={className}
        />
    );
};

// Specific error display for API key issues
export const ApiKeyErrorDisplay = ({
    provider,
    isVtPlus = false,
    onRetry,
    onOpenSettings,
    className,
}: {
    provider: string;
    isVtPlus?: boolean;
    onRetry?: () => void;
    onOpenSettings?: () => void;
    className?: string;
}) => {
    const providerDisplayNames: Record<string, string> = {
        openai: "OpenAI",
        anthropic: "Anthropic Claude",
        google: "Google Gemini",
        xai: "xAI Grok",
        fireworks: "Fireworks AI",
        openrouter: "OpenRouter",
        together: "Together AI",
        lmstudio: "LM Studio",
        ollama: "Ollama",
    };

    const providerUrls: Record<string, string> = {
        openai: "https://platform.openai.com/api-keys",
        anthropic: "https://console.anthropic.com/",
        google: "https://ai.google.dev/api",
        xai: "https://x.ai/api",
        fireworks: "https://app.fireworks.ai/",
        openrouter: "https://openrouter.ai/keys",
        together: "https://api.together.xyz/",
        lmstudio: "https://lmstudio.ai/docs/local-server",
        ollama: "https://ollama.ai/download",
    };

    const providerName = providerDisplayNames[provider] || provider;
    const helpUrl = providerUrls[provider];

    const message = isVtPlus
        ? `Your VT+ subscription includes server-funded usage, but you can add your own ${providerName} API key for unlimited access and faster responses.`
        : `To use ${providerName} models, you need to provide your own API key. This is free to obtain and gives you direct access to ${providerName}'s latest models.`;

    const action =
        provider === "lmstudio"
            ? "1. Start LM Studio → Local Server tab → Start Server\n2. Add server URL in Settings → API Keys → LM Studio\n3. Default URL: http://localhost:1234"
            : provider === "ollama"
              ? "1. Install Ollama from ollama.ai\n2. Run 'ollama serve' in terminal\n3. Add server URL in Settings → API Keys → Ollama\n4. Default URL: http://127.0.0.1:11434"
              : `1. Visit ${providerName}'s website to get your free API key\n2. Copy the API key\n3. Add it in Settings → API Keys → ${providerName}\n4. Start chatting with ${providerName} models`;

    return (
        <ErrorDisplay
            title={`${providerName} API Key Required`}
            message={message}
            action={action}
            helpUrl={helpUrl}
            settingsAction="open_api_keys"
            provider={provider}
            onRetry={onRetry}
            onOpenSettings={onOpenSettings}
            className={className}
        />
    );
};
