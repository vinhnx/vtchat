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
                    className={cn(
                        'gap-2 transition-all duration-200',
                        isEnabled
                            ? [
                                // Selected state styling
                                'border-muted-foreground/30 border',
                                'bg-gradient-to-r from-blue-50 to-purple-50',
                                'hover:from-blue-100 hover:to-purple-100',
                                'dark:from-blue-950/20 dark:to-purple-950/20',
                                'dark:hover:from-blue-900/30 dark:hover:to-purple-900/30',
                                'shadow-sm',
                            ]
                            : [`${colourClass.bg}`, 'border-0'],
                    )}
                    onClick={handleToggle}
                    size={isEnabled ? 'sm' : 'icon-sm'}
                    tooltip={tooltip(isEnabled)}
                    variant={isEnabled ? 'secondary' : 'ghost'}
                >
                    {React.isValidElement(icon) && typeof icon.type !== 'symbol'
                        ? React.cloneElement(icon as React.ReactElement<{ className?: string; }>, {
                            className: cn(
                                isEnabled
                                    ? 'text-blue-500 transition-all duration-200 opacity-100'
                                    : 'text-muted-foreground opacity-80',
                                (icon as React.ReactElement<{ className?: string; }>).props
                                    .className,
                            ),
                        })
                        : icon}
                    {isEnabled && hasFeatureAccess && (
                        <span className='bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xs font-medium text-transparent dark:from-blue-400 dark:to-purple-400'>
                            {label}
                        </span>
                    )}
                </Button>
            </GatedFeatureAlert>
            <LoginRequiredDialog
                description={loginDescription}
                isOpen={showLoginPrompt}
                onClose={() => setShowLoginPrompt(false)}
                title='Login Required'
            />
        </>
    );
}
