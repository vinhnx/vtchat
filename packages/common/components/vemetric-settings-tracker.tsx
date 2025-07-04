'use client';

import { SETTINGS_ACTIONS } from '@repo/shared/constants';
import { useSession } from '@repo/shared/lib/auth-client';
import { log } from '@repo/shared/logger';
import { useTheme } from 'next-themes';
import { useEffect, useRef } from 'react';
import { useVemetric } from '../hooks/use-vemetric';
import { ANALYTICS_EVENTS } from '../utils/analytics';

/**
 * Component that tracks settings and preference changes
 */
export function VemetricSettingsTracker() {
    const { trackEvent, updateUser, isEnabled } = useVemetric();
    const { data: session } = useSession();
    const { theme, systemTheme } = useTheme();

    // Refs to track previous values
    const prevTheme = useRef<string | undefined>();
    const hasTrackedInitialTheme = useRef(false);

    // Track theme changes
    useEffect(() => {
        if (!(isEnabled && session)) return;

        const currentTheme = theme === 'system' ? systemTheme : theme;

        // Track initial theme only once
        if (!hasTrackedInitialTheme.current && currentTheme) {
            try {
                updateUser({
                    themePreference: currentTheme as 'light' | 'dark' | 'system',
                });
                hasTrackedInitialTheme.current = true;
                prevTheme.current = currentTheme;
            } catch (error) {
                log.error({ error }, 'Failed to update user theme preference');
            }
            return;
        }

        // Track theme changes
        if (prevTheme.current && prevTheme.current !== currentTheme && currentTheme) {
            try {
                trackEvent(ANALYTICS_EVENTS.THEME_CHANGED, {
                    newTheme: currentTheme,
                    previousTheme: prevTheme.current,
                    timestamp: Date.now(),
                });

                updateUser({
                    themePreference: currentTheme as 'light' | 'dark' | 'system',
                });

                log.debug(
                    {
                        previousTheme: prevTheme.current,
                        newTheme: currentTheme,
                    },
                    'Theme change tracked'
                );
            } catch (error) {
                log.error(
                    { error, prevTheme: prevTheme.current, currentTheme },
                    'Failed to track theme change'
                );
            }
        }

        prevTheme.current = currentTheme;
    }, [theme, systemTheme, trackEvent, updateUser, isEnabled, session]);

    return null; // This component doesn't render anything
}

/**
 * Hook to track settings-related user actions
 */
export function useVemetricSettingsTracking() {
    const { trackEvent, updateUser, isEnabled } = useVemetric();
    const { data: session } = useSession();

    const trackSettingsOpened = async (section?: string) => {
        if (!(isEnabled && session)) return;

        try {
            await trackEvent(ANALYTICS_EVENTS.SETTINGS_CHANGED, {
                action: SETTINGS_ACTIONS.SETTINGS_OPENED,
                section,
                timestamp: Date.now(),
            });
        } catch (error) {
            log.error({ error }, 'Failed to track settings opened');
        }
    };

    const trackSettingChanged = async (params: {
        setting: string;
        newValue: string | boolean | number;
        previousValue?: string | boolean | number;
        category?: string;
    }) => {
        if (!(isEnabled && session)) return;

        try {
            await trackEvent(ANALYTICS_EVENTS.SETTINGS_CHANGED, {
                setting: params.setting,
                newValue: params.newValue.toString(),
                previousValue: params.previousValue?.toString(),
                category: params.category,
                timestamp: Date.now(),
            });

            // Update user properties for specific settings
            if (params.setting === 'customInstructions') {
                updateUser({
                    // Don't store the actual instructions for privacy
                    // Just track if they have custom instructions
                });
            }
        } catch (error) {
            log.error({ error }, 'Failed to track setting change');
        }
    };

    const trackApiKeyAdded = async (provider: string) => {
        if (!(isEnabled && session)) return;

        try {
            await trackEvent('ApiKeyAdded', {
                provider,
                timestamp: Date.now(),
            });
        } catch (error) {
            log.error({ error }, 'Failed to track API key addition');
        }
    };

    const trackApiKeyRemoved = async (provider: string) => {
        if (!(isEnabled && session)) return;

        try {
            await trackEvent('ApiKeyRemoved', {
                provider,
                timestamp: Date.now(),
            });
        } catch (error) {
            log.error({ error }, 'Failed to track API key removal');
        }
    };

    const trackExportAction = async (exportType: 'conversation' | 'thread' | 'all_data') => {
        if (!(isEnabled && session)) return;

        try {
            await trackEvent(ANALYTICS_EVENTS.CONVERSATION_EXPORTED, {
                exportType,
                timestamp: Date.now(),
            });
        } catch (error) {
            log.error({ error }, 'Failed to track export action');
        }
    };

    const trackSearchPerformed = async (params: {
        query: string;
        resultCount?: number;
        context?: string;
    }) => {
        if (!(isEnabled && session)) return;

        try {
            // Sanitize search query - don't store actual query content for privacy
            await trackEvent(ANALYTICS_EVENTS.SEARCH_PERFORMED, {
                queryLength: params.query.length,
                resultCount: params.resultCount,
                context: params.context,
                timestamp: Date.now(),
            });
        } catch (error) {
            log.error({ error }, 'Failed to track search');
        }
    };

    const trackHelpAccessed = async (section: string, article?: string) => {
        if (!(isEnabled && session)) return;

        try {
            await trackEvent(ANALYTICS_EVENTS.HELP_ACCESSED, {
                section,
                article,
                timestamp: Date.now(),
            });
        } catch (error) {
            log.error({ error }, 'Failed to track help access');
        }
    };

    const trackExternalLinkClicked = async (url: string, context?: string) => {
        if (!(isEnabled && session)) return;

        try {
            // Extract domain for privacy (don't store full URLs)
            const domain = new URL(url).hostname;

            await trackEvent(ANALYTICS_EVENTS.EXTERNAL_LINK_CLICKED, {
                domain,
                context,
                timestamp: Date.now(),
            });
        } catch (error) {
            log.error({ error }, 'Failed to track external link click');
        }
    };

    const trackErrorEncountered = async (params: {
        errorType: string;
        errorCode?: string | number;
        context?: string;
        recoverable?: boolean;
    }) => {
        if (!(isEnabled && session)) return;

        try {
            await trackEvent(ANALYTICS_EVENTS.ERROR_ENCOUNTERED, {
                errorType: params.errorType,
                errorCode: params.errorCode?.toString(),
                context: params.context,
                recoverable: params.recoverable,
                timestamp: Date.now(),
            });
        } catch (error) {
            log.error({ error }, 'Failed to track error encounter');
        }
    };

    return {
        trackSettingsOpened,
        trackSettingChanged,
        trackApiKeyAdded,
        trackApiKeyRemoved,
        trackExportAction,
        trackSearchPerformed,
        trackHelpAccessed,
        trackExternalLinkClicked,
        trackErrorEncountered,
        isEnabled,
    };
}
