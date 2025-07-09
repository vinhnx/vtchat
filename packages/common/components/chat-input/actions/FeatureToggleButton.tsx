'use client';

import { GatedFeatureAlert } from '@repo/common/components';
import type { FeatureSlug } from '@repo/shared/types/subscription';
import { Button, cn } from '@repo/ui';
import React from 'react';
import { LoginRequiredDialog } from '../../login-required-dialog';
import { COLOUR_CLASSES } from '../config/constants';
import { useFeatureToggle } from '../hooks/useFeatureToggle';

export interface FeatureToggleButtonProps {
    enabledSelector: (state: any) => boolean;
    activeKey: 'webSearch' | 'mathCalculator' | 'charts';
    icon: React.ReactNode;
    label: string;
    colour: 'blue' | 'orange' | 'purple';
    requiredFeature?: FeatureSlug;
    tooltip: (enabled: boolean) => string;
    featureName: string;
    logPrefix: string;
    loginDescription: string;
}

export function FeatureToggleButton({
    enabledSelector,
    activeKey,
    icon,
    label,
    colour,
    requiredFeature,
    tooltip,
    featureName,
    logPrefix,
    loginDescription,
}: FeatureToggleButtonProps) {
    const { isEnabled, hasFeatureAccess, handleToggle, showLoginPrompt, setShowLoginPrompt } =
        useFeatureToggle({
            enabledSelector,
            activeKey,
            requiredFeature,
            featureName,
            logPrefix,
        });

    const colourClass = COLOUR_CLASSES[colour];

    return (
        <>
            <GatedFeatureAlert
                message={`${featureName} requires sign in`}
                requiredFeature={requiredFeature}
            >
                <Button
                    aria-label={isEnabled ? `${label} Enabled` : `Enable ${label}`}
                    className={cn('gap-2', isEnabled && `${colourClass.bg} ${colourClass.text}`)}
                    onClick={handleToggle}
                    size={isEnabled ? 'sm' : 'icon-sm'}
                    tooltip={tooltip(isEnabled)}
                    variant={isEnabled ? 'secondary' : 'ghost'}
                >
                    {React.cloneElement(icon as React.ReactElement, {
                        className: cn(
                            isEnabled ? colourClass.iconText : 'text-muted-foreground',
                            (icon as React.ReactElement).props.className
                        ),
                        size: 16,
                        strokeWidth: 2,
                    })}
                    {isEnabled && hasFeatureAccess && <p className="text-xs">{label}</p>}
                </Button>
            </GatedFeatureAlert>

            <LoginRequiredDialog
                description={loginDescription}
                isOpen={showLoginPrompt}
                onClose={() => setShowLoginPrompt(false)}
                title="Login Required"
            />
        </>
    );
}
