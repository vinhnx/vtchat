'use client';

import { FEATURE_STATES, TOOL_FEATURES } from '@repo/shared/constants';
import { useSession } from '@repo/shared/lib/auth-client';
import { log } from '@repo/shared/logger';
import { useEffect, useRef } from 'react';
import { useVemetric } from '../hooks/use-vemetric';
import { useChatStore } from '../store/chat.store';
import { ANALYTICS_EVENTS, AnalyticsUtils } from '../utils/analytics';

/**
 * Component that tracks chat-related analytics events
 * Should be included once in the chat layout/app
 */
export function VemetricChatTracker() {
    const { trackEvent, isEnabled } = useVemetric();
    const { data: session } = useSession();

    // Store selectors
    const chatMode = useChatStore((state) => state.chatMode);
    const useWebSearch = useChatStore((state) => state.useWebSearch);
    const useMathCalculator = useChatStore((state) => state.useMathCalculator);
    const useCharts = useChatStore((state) => state.useCharts);
    const currentThreadId = useChatStore((state) => state.currentThreadId);

    // Refs to track previous values
    const prevChatMode = useRef(chatMode);
    const prevUseWebSearch = useRef(useWebSearch);
    const prevUseMathCalculator = useRef(useMathCalculator);
    const prevUseCharts = useRef(useCharts);
    const prevThreadId = useRef(currentThreadId);

    // Track model selection changes
    useEffect(() => {
        if (!(isEnabled && session)) return;

        if (prevChatMode.current !== chatMode) {
            // Only track if this isn't the initial load
            if (prevChatMode.current !== undefined) {
                trackEvent(ANALYTICS_EVENTS.MODEL_SELECTED, {
                    modelName: chatMode,
                    previousModel: prevChatMode.current,
                    userId: session.user?.id?.substring(0, 8), // Truncated for privacy
                });
            }
            prevChatMode.current = chatMode;
        }
    }, [chatMode, trackEvent, isEnabled, session]);

    // Track feature toggles
    useEffect(() => {
        if (!(isEnabled && session)) return;

        if (prevUseWebSearch.current !== useWebSearch) {
            if (prevUseWebSearch.current !== undefined) {
                trackEvent(
                    ANALYTICS_EVENTS.TOOL_USED,
                    AnalyticsUtils.createFeatureEventData({
                        featureName: TOOL_FEATURES.WEB_SEARCH,
                        context: useWebSearch ? FEATURE_STATES.ENABLED : FEATURE_STATES.DISABLED,
                    })
                );
            }
            prevUseWebSearch.current = useWebSearch;
        }
    }, [useWebSearch, trackEvent, isEnabled, session]);

    useEffect(() => {
        if (!(isEnabled && session)) return;

        if (prevUseMathCalculator.current !== useMathCalculator) {
            if (prevUseMathCalculator.current !== undefined) {
                trackEvent(
                    ANALYTICS_EVENTS.TOOL_USED,
                    AnalyticsUtils.createFeatureEventData({
                        featureName: TOOL_FEATURES.MATH_CALCULATOR,
                        context: useMathCalculator
                            ? FEATURE_STATES.ENABLED
                            : FEATURE_STATES.DISABLED,
                    })
                );
            }
            prevUseMathCalculator.current = useMathCalculator;
        }
    }, [useMathCalculator, trackEvent, isEnabled, session]);

    useEffect(() => {
        if (!(isEnabled && session)) return;

        if (prevUseCharts.current !== useCharts) {
            if (prevUseCharts.current !== undefined) {
                trackEvent(
                    ANALYTICS_EVENTS.TOOL_USED,
                    AnalyticsUtils.createFeatureEventData({
                        featureName: TOOL_FEATURES.CHARTS,
                        context: useCharts ? FEATURE_STATES.ENABLED : FEATURE_STATES.DISABLED,
                    })
                );
            }
            prevUseCharts.current = useCharts;
        }
    }, [useCharts, trackEvent, isEnabled, session]);

    // Track thread creation
    useEffect(() => {
        if (!(isEnabled && session)) return;

        if (prevThreadId.current !== currentThreadId) {
            if (currentThreadId && prevThreadId.current !== undefined) {
                trackEvent(ANALYTICS_EVENTS.THREAD_CREATED, {
                    threadId: currentThreadId?.toString().substring(0, 8),
                    modelName: chatMode,
                    hasWebSearch: useWebSearch,
                    hasMathCalculator: useMathCalculator,
                    hasCharts: useCharts,
                });
            }
            prevThreadId.current = currentThreadId;
        }
    }, [
        currentThreadId,
        trackEvent,
        isEnabled,
        session,
        chatMode,
        useWebSearch,
        useMathCalculator,
        useCharts,
    ]);

    return null; // This component doesn't render anything
}

/**
 * Hook to track message sending events
 * Use this in components that handle message sending
 */
export function useVemetricMessageTracking() {
    const { trackEvent, trackPerformance, isEnabled, createTimer } = useVemetric();
    const { data: session } = useSession();

    const trackMessageSent = async (params: {
        messageLength: number;
        modelName: string;
        hasAttachments?: boolean;
        toolsUsed?: string[];
        threadId?: string | number;
    }) => {
        if (!(isEnabled && session)) return;

        try {
            const eventData = AnalyticsUtils.createChatEventData({
                messageLength: params.messageLength,
                modelName: params.modelName,
                hasAttachments: params.hasAttachments,
                toolsUsed: params.toolsUsed,
                threadId: params.threadId?.toString(),
            });

            await trackEvent(ANALYTICS_EVENTS.MESSAGE_SENT, eventData);

            log.debug(
                {
                    event: ANALYTICS_EVENTS.MESSAGE_SENT,
                    modelName: params.modelName,
                    messageLength: params.messageLength,
                },
                'Message sent event tracked'
            );
        } catch (error) {
            log.error({ error }, 'Failed to track message sent event');
        }
    };

    const trackResponseReceived = async (params: {
        responseTime: number;
        modelName: string;
        responseLength?: number;
        threadId?: string | number;
        wasSuccessful: boolean;
    }) => {
        if (!(isEnabled && session)) return;

        try {
            const eventData = AnalyticsUtils.createChatEventData({
                responseTime: params.responseTime,
                modelName: params.modelName,
                messageLength: params.responseLength,
                threadId: params.threadId?.toString(),
            });

            await trackEvent(ANALYTICS_EVENTS.RESPONSE_RECEIVED, {
                ...eventData,
                wasSuccessful: params.wasSuccessful,
            });
        } catch (error) {
            log.error({ error }, 'Failed to track response received event');
        }
    };

    const trackChatStarted = async (params: {
        modelName: string;
        isNewThread: boolean;
        threadId?: string | number;
    }) => {
        if (!(isEnabled && session)) return;

        try {
            await trackEvent(ANALYTICS_EVENTS.CHAT_STARTED, {
                modelName: params.modelName,
                isNewThread: params.isNewThread,
                threadId: params.threadId?.toString().substring(0, 8),
            });
        } catch (error) {
            log.error({ error }, 'Failed to track chat started event');
        }
    };

    const trackFirstMessage = async (params: {
        modelName: string;
        messageLength: number;
        timeSinceSignup?: number; // In days
    }) => {
        if (!(isEnabled && session)) return;

        try {
            await trackEvent(ANALYTICS_EVENTS.FIRST_MESSAGE_SENT, {
                modelName: params.modelName,
                messageLength: params.messageLength,
                timeSinceSignup: params.timeSinceSignup,
            });
        } catch (error) {
            log.error({ error }, 'Failed to track first message event');
        }
    };

    return {
        trackMessageSent,
        trackResponseReceived,
        trackChatStarted,
        trackFirstMessage,
        createTimer,
        trackPerformance,
        isEnabled,
    };
}

/**
 * Hook to track user journey events
 * Use this for onboarding and milestone tracking
 */
export function useVemetricUserJourney() {
    const { trackEvent, isEnabled } = useVemetric();
    const { data: session } = useSession();

    const trackOnboardingStep = async (step: string, value?: number) => {
        if (!(isEnabled && session)) return;

        try {
            await trackEvent(
                ANALYTICS_EVENTS.ONBOARDING_STARTED,
                AnalyticsUtils.createUserJourneyEventData({
                    step,
                    value,
                    category: 'onboarding',
                })
            );
        } catch (error) {
            log.error({ error, step }, 'Failed to track onboarding step');
        }
    };

    const trackFeatureDiscovery = async (featureName: string, context?: string) => {
        if (!(isEnabled && session)) return;

        try {
            await trackEvent(
                ANALYTICS_EVENTS.FEATURE_DISCOVERED,
                AnalyticsUtils.createFeatureEventData({
                    featureName,
                    context,
                })
            );
        } catch (error) {
            log.error({ error, featureName }, 'Failed to track feature discovery');
        }
    };

    const trackHelpAccessed = async (section: string) => {
        if (!(isEnabled && session)) return;

        try {
            await trackEvent(ANALYTICS_EVENTS.HELP_ACCESSED, {
                section,
                timestamp: Date.now(),
            });
        } catch (error) {
            log.error({ error, section }, 'Failed to track help accessed');
        }
    };

    return {
        trackOnboardingStep,
        trackFeatureDiscovery,
        trackHelpAccessed,
        isEnabled,
    };
}
