# Vemetric Implementation Examples

This document provides practical examples of how to implement Vemetric analytics tracking in VT Chat components.

## Table of Contents

1. [Chat Message Tracking](#chat-message-tracking)
2. [Subscription Upgrade Tracking](#subscription-upgrade-tracking)
3. [Feature Gate Tracking](#feature-gate-tracking)
4. [Settings Change Tracking](#settings-change-tracking)
5. [Error Tracking](#error-tracking)
6. [Performance Tracking](#performance-tracking)

## Chat Message Tracking

### Message Send Component

```tsx
// packages/common/components/chat-input/enhanced-send-button.tsx
'use client';

import { useVemetricMessageTracking } from '../vemetric-chat-tracker';
import { useChatStore } from '@repo/common/store';
import { Button } from '@repo/ui';

export function EnhancedSendButton({
    onSend,
    disabled,
    messageText,
}: {
    onSend: () => Promise<void>;
    disabled: boolean;
    messageText: string;
}) {
    const { trackMessageSent, createTimer } = useVemetricMessageTracking();
    const chatMode = useChatStore(state => state.chatMode);
    const useWebSearch = useChatStore(state => state.useWebSearch);
    const useMathCalculator = useChatStore(state => state.useMathCalculator);

    const handleSend = async () => {
        if (!messageText.trim()) return;

        const timer = createTimer();

        try {
            // Send the message
            await onSend();

            // Track analytics after successful send
            const toolsUsed = [];
            if (useWebSearch) toolsUsed.push('webSearch');
            if (useMathCalculator) toolsUsed.push('mathCalculator');

            await trackMessageSent({
                messageLength: messageText.length,
                modelName: chatMode,
                toolsUsed: toolsUsed.length > 0 ? toolsUsed : undefined,
            });

            // Track performance
            timer.end('MessageSendTime', {
                modelName: chatMode,
                success: true,
            });
        } catch (error) {
            // Track performance even on failure
            timer.end('MessageSendTime', {
                modelName: chatMode,
                success: false,
            });
            throw error;
        }
    };

    return (
        <Button onClick={handleSend} disabled={disabled || !messageText.trim()}>
            Send
        </Button>
    );
}
```

## Subscription Upgrade Tracking

### Upgrade Button with Analytics

```tsx
// components/subscription/upgrade-button.tsx
'use client';

import { useVemetricSubscriptionTracking } from '@repo/common/components/vemetric-subscription-tracker';
import { useVemetricSettingsTracking } from '@repo/common/components/vemetric-settings-tracker';
import { Button } from '@repo/ui';
import { useRouter } from 'next/navigation';

export function UpgradeButton({
    context = 'general',
    feature,
    className,
}: {
    context?: string;
    feature?: string;
    className?: string;
}) {
    const { trackUpgradeInitiated, trackFeatureGateEncountered } =
        useVemetricSubscriptionTracking();
    const { trackExternalLinkClicked } = useVemetricSettingsTracking();
    const router = useRouter();

    const handleUpgrade = async () => {
        try {
            // Track the upgrade initiation
            await trackUpgradeInitiated(context);

            // Track feature gate if specific feature triggered this
            if (feature) {
                await trackFeatureGateEncountered({
                    featureName: feature,
                    requiredTier: 'VT_PLUS',
                    context,
                });
            }

            // Track external link click (if going to payment processor)
            await trackExternalLinkClicked('https://payment.vtchat.io', 'upgrade_button');

            // Navigate to upgrade page
            router.push('/plus');
        } catch (error) {
            console.error('Failed to track upgrade action:', error);
            // Still navigate even if analytics fails
            router.push('/plus');
        }
    };

    return (
        <Button onClick={handleUpgrade} className={className} variant="default">
            Upgrade to VT+
        </Button>
    );
}
```

### Usage in Gated Feature Alert

```tsx
// components/gated-feature-alert.tsx
import { UpgradeButton } from './subscription/upgrade-button';

export function GatedFeatureAlert({
    featureName,
    message,
    children,
}: {
    featureName: string;
    message: string;
    children: React.ReactNode;
}) {
    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Upgrade Required</DialogTitle>
                    <DialogDescription>{message}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <UpgradeButton context="feature_gate" feature={featureName} />
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
```

## Feature Gate Tracking

### Model Selection with Gating

```tsx
// components/chat/model-selector.tsx
'use client';

import { useVemetricSubscriptionTracking } from '@repo/common/components/vemetric-subscription-tracker';
import { useVemetric } from '@repo/common/hooks/use-vemetric';
import { ANALYTICS_EVENTS } from '@repo/common/utils/analytics';

export function ModelSelector({
    models,
    selectedModel,
    onModelSelect,
}: {
    models: Model[];
    selectedModel: string;
    onModelSelect: (model: string) => void;
}) {
    const { trackEvent } = useVemetric();
    const { trackFeatureGateEncountered } = useVemetricSubscriptionTracking();

    const handleModelSelect = async (model: Model) => {
        // Check if model requires premium access
        if (model.requiresPremium && !userHasPremium) {
            // Track feature gate encounter
            await trackFeatureGateEncountered({
                featureName: model.id,
                requiredTier: 'VT_PLUS',
                context: 'model_selection',
            });

            // Show upgrade modal instead of selecting
            showUpgradeModal();
            return;
        }

        // Track successful model selection
        await trackEvent(ANALYTICS_EVENTS.MODEL_SELECTED, {
            modelName: model.id,
            previousModel: selectedModel,
            context: 'dropdown_selection',
        });

        onModelSelect(model.id);
    };

    return (
        <Select value={selectedModel} onValueChange={handleModelSelect}>
            {models.map(model => (
                <SelectItem
                    key={model.id}
                    value={model.id}
                    disabled={model.requiresPremium && !userHasPremium}
                >
                    {model.name}
                    {model.requiresPremium && (
                        <Badge className="vt-plus-glass border-[#D99A4E]/30 text-[#D99A4E]">
                            VT+
                        </Badge>
                    )}
                </SelectItem>
            ))}
        </Select>
    );
}
```

## Settings Change Tracking

### Theme Selector with Analytics

```tsx
// components/settings/theme-selector.tsx
'use client';

import { useTheme } from 'next-themes';
import { useVemetricSettingsTracking } from '@repo/common/components/vemetric-settings-tracker';
import { useEffect, useRef } from 'react';

export function ThemeSelector() {
    const { theme, setTheme } = useTheme();
    const { trackSettingChanged } = useVemetricSettingsTracking();
    const prevTheme = useRef(theme);

    const handleThemeChange = async (newTheme: string) => {
        const previousTheme = theme;

        // Change the theme
        setTheme(newTheme);

        // Track the change
        await trackSettingChanged({
            setting: 'theme',
            newValue: newTheme,
            previousValue: previousTheme,
            category: 'appearance',
        });
    };

    return (
        <Select value={theme} onValueChange={handleThemeChange}>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
        </Select>
    );
}
```

### Custom Instructions Tracking

```tsx
// components/settings/custom-instructions.tsx
'use client';

import { useVemetricSettingsTracking } from '@repo/common/components/vemetric-settings-tracker';
import { useState, useEffect } from 'react';
import { Textarea } from '@repo/ui';

export function CustomInstructions({
    initialValue,
    onSave,
}: {
    initialValue: string;
    onSave: (value: string) => void;
}) {
    const [value, setValue] = useState(initialValue);
    const { trackSettingChanged } = useVemetricSettingsTracking();

    const handleSave = async () => {
        const hasInstructions = value.trim().length > 0;
        const hadInstructions = initialValue.trim().length > 0;

        // Save the instructions
        onSave(value);

        // Track the change (without storing actual content)
        await trackSettingChanged({
            setting: 'customInstructions',
            newValue: hasInstructions ? 'enabled' : 'disabled',
            previousValue: hadInstructions ? 'enabled' : 'disabled',
            category: 'chat_behavior',
        });
    };

    return (
        <div>
            <Textarea
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder="Enter custom instructions..."
            />
            <Button onClick={handleSave}>Save Instructions</Button>
        </div>
    );
}
```

## Error Tracking

### API Error Handler with Analytics

```tsx
// utils/api-error-handler.ts
import { useVemetricSettingsTracking } from '@repo/common/components/vemetric-settings-tracker';

export function useApiErrorHandler() {
    const { trackErrorEncountered } = useVemetricSettingsTracking();

    const handleApiError = async (error: Error, context: string) => {
        // Extract error information
        const errorType = error.name || 'UnknownError';
        const errorCode = (error as any).status || (error as any).code;
        const isRecoverable = !errorType.includes('Fatal') && errorCode !== 500;

        // Track the error
        await trackErrorEncountered({
            errorType,
            errorCode,
            context,
            recoverable: isRecoverable,
        });

        // Handle the error appropriately
        if (isRecoverable) {
            showRetryableErrorToast(error.message);
        } else {
            showFatalErrorDialog(error.message);
        }
    };

    return { handleApiError };
}
```

### Usage in API Calls

```tsx
// hooks/use-chat-api.ts
import { useApiErrorHandler } from '../utils/api-error-handler';

export function useChatAPI() {
    const { handleApiError } = useApiErrorHandler();

    const sendMessage = async (message: string) => {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                body: JSON.stringify({ message }),
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            await handleApiError(error as Error, 'chat_api');
            throw error;
        }
    };

    return { sendMessage };
}
```

## Performance Tracking

### File Upload with Performance Monitoring

```tsx
// components/file-upload/upload-button.tsx
'use client';

import { useVemetricMessageTracking } from '../vemetric-chat-tracker';
import { useVemetricSettingsTracking } from '../vemetric-settings-tracker';

export function FileUploadButton({ onUpload }: { onUpload: (file: File) => void }) {
    const { createTimer } = useVemetricMessageTracking();
    const { trackErrorEncountered } = useVemetricSettingsTracking();

    const handleFileUpload = async (file: File) => {
        const uploadTimer = createTimer();

        try {
            // Validate file
            if (file.size > 10 * 1024 * 1024) {
                // 10MB limit
                throw new Error('File too large');
            }

            // Track file upload start
            const processingTimer = createTimer();

            // Process the file
            await processFile(file);

            // Track successful upload
            uploadTimer.end('FileUploadTime', {
                fileType: file.type,
                fileSize: file.size,
                success: true,
            });

            processingTimer.end('FileProcessingTime', {
                fileType: file.type,
                success: true,
            });

            onUpload(file);
        } catch (error) {
            // Track failed upload
            uploadTimer.end('FileUploadTime', {
                fileType: file.type,
                fileSize: file.size,
                success: false,
            });

            // Track the error
            await trackErrorEncountered({
                errorType: 'FileUploadError',
                context: 'file_upload_button',
                recoverable: true,
            });

            throw error;
        }
    };

    return (
        <input
            type="file"
            onChange={e => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
            }}
        />
    );
}
```

### Page Load Performance

```tsx
// components/performance/page-tracker.tsx
'use client';

import { useEffect } from 'react';
import { useVemetric } from '@repo/common/hooks/use-vemetric';

export function PagePerformanceTracker({ pageName }: { pageName: string }) {
    const { trackPerformance } = useVemetric();

    useEffect(() => {
        // Track page load performance
        const startTime = performance.now();

        const trackPageLoad = () => {
            trackPerformance('PageLoadTime', startTime, {
                pageName,
                navigationTiming: performance.getEntriesByType('navigation')[0],
            });
        };

        // Track when page is fully loaded
        if (document.readyState === 'complete') {
            trackPageLoad();
        } else {
            window.addEventListener('load', trackPageLoad);
            return () => window.removeEventListener('load', trackPageLoad);
        }
    }, [pageName, trackPerformance]);

    return null;
}
```

## Best Practices from Examples

1. **Always wrap analytics in try-catch** - Don't let tracking break functionality
2. **Track before and after state** - Provides context for changes
3. **Use meaningful context strings** - Helps with data analysis
4. **Track both success and failure cases** - Important for debugging
5. **Sanitize sensitive data** - Use the built-in utilities
6. **Performance tracking** - Use timers for long operations
7. **Feature gate tracking** - Track when users hit limitations
8. **Error context** - Include operation context in error tracking

These examples demonstrate real-world usage patterns that maintain user privacy while providing valuable analytics insights.
