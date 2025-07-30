import { Alert, AlertDescription, Button } from "@repo/ui";
import { AlertCircle, ArrowRight, Mail, Settings, Sparkles } from "lucide-react";
import { SETTING_TABS, useAppStore } from "../store";

interface RateLimitErrorAlertProps {
    error: string;
    className?: string;
}

export function RateLimitErrorAlert({ error, className }: RateLimitErrorAlertProps) {
    const { setSettingTab, setIsSettingsOpen } = useAppStore();

    const handleOpenUsageSettings = () => {
        setSettingTab(SETTING_TABS.USAGE);
        setIsSettingsOpen(true);
    };

    const handleUpgrade = () => {
        window.open("/pricing", "_blank");
    };

    const handleContactSupport = () => {
        window.open(
            "mailto:hello@vtchat.io.vn?subject=Support Request - Unexpected Error",
            "_blank",
        );
    };

    // Check if this is a rate limit error
    const isRateLimitError =
        error.toLowerCase().includes("rate limit") ||
        error.toLowerCase().includes("daily limit") ||
        error.toLowerCase().includes("per minute") ||
        error.toLowerCase().includes("minute");

    if (!isRateLimitError) {
        // Check if this is a diagnostic message with suggestions
        const hasSuggestions = error.includes("🔧 Try these steps:");

        if (hasSuggestions) {
            const [message, suggestionsSection] = error.split("🔧 Try these steps:");
            const suggestions = suggestionsSection
                .trim()
                .split("\n")
                .filter((s) => s.trim());

            return (
                <Alert className={className}>
                    <AlertDescription>
                        <div className="flex items-start gap-2">
                            <div className="flex-1">
                                <p className="mb-3">{message.trim()}</p>
                                <div className="mb-3">
                                    <p className="mb-2 text-sm font-medium">Try these steps:</p>
                                    <ul className="list-disc space-y-1 pl-4 text-sm">
                                        {suggestions.map((suggestion, index) => (
                                            <li className="text-300" key={index}>
                                                {suggestion.replace(/^\d+\.\s*/, "")}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        className="h-8 text-xs"
                                        onClick={handleOpenUsageSettings}
                                        size="sm"
                                        variant="outline"
                                    >
                                        <Settings className="mr-1 h-3 w-3" />
                                        Open Settings
                                    </Button>
                                    <Button
                                        className="h-8 text-xs"
                                        onClick={() => window.location.reload()}
                                        size="sm"
                                        variant="outline"
                                    >
                                        Refresh Page
                                    </Button>
                                    <Button
                                        className="h-8 text-xs"
                                        onClick={handleContactSupport}
                                        size="sm"
                                        variant="outline"
                                    >
                                        <Mail className="mr-1 h-3 w-3" />
                                        Contact Support
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </AlertDescription>
                </Alert>
            );
        }

        return (
            <Alert className={className}>
                <AlertDescription>
                    <div className="flex items-start gap-2">
                        <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                        <div className="flex-1">
                            <p className="mb-3">{error}</p>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    className="h-8 text-xs"
                                    onClick={() => window.location.reload()}
                                    size="sm"
                                    variant="outline"
                                >
                                    Refresh Page
                                </Button>
                                <Button
                                    className="h-8 text-xs"
                                    onClick={handleContactSupport}
                                    size="sm"
                                    variant="outline"
                                >
                                    <Mail className="mr-1 h-3 w-3" />
                                    Contact Support
                                </Button>
                            </div>
                        </div>
                    </div>
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <Alert className={className}>
            <AlertDescription>
                <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                    <div className="flex-1">
                        <p className="mb-3">{error}</p>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                className="h-8 text-xs"
                                onClick={handleOpenUsageSettings}
                                size="sm"
                                variant="outline"
                            >
                                <Settings className="mr-1 h-3 w-3" />
                                View Usage
                            </Button>
                            <Button className="group gap-2" onClick={handleUpgrade}>
                                <Sparkles className="h-4 w-4" />
                                Upgrade to VT+
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </div>
                    </div>
                </div>
            </AlertDescription>
        </Alert>
    );
}
