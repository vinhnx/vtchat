import { Alert, AlertDescription, Button } from '@repo/ui';
import { AlertCircle, ArrowRight, Settings, Sparkles } from 'lucide-react';
import { SETTING_TABS, useAppStore } from '../store';

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
        window.open('/plus', '_blank');
    };

    // Check if this is a rate limit error
    const isRateLimitError =
        error.toLowerCase().includes('rate limit') ||
        error.toLowerCase().includes('daily limit') ||
        error.toLowerCase().includes('per minute');

    if (!isRateLimitError) {
        return (
            <Alert variant="destructive" className={className}>
                <AlertDescription>
                    <AlertCircle className="mt-0.5 size-3.5" />
                    {error}
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <Alert variant="destructive" className={className}>
            <AlertDescription>
                <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                    <div className="flex-1">
                        <p className="mb-3">{error}</p>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleOpenUsageSettings}
                                className="h-8 text-xs"
                            >
                                <Settings className="mr-1 h-3 w-3" />
                                View Usage
                            </Button>
                            <Button
                                className="group gap-2"
                                onClick={() => (window.location.href = '/plus')}
                            >
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
