'use client';

import { log } from '@repo/shared/lib/logger';
import { useEffect } from 'react';

interface ExecutionContextInfo {
    type?: string;
}

interface MessageScriptInfo {
    executionContext?: ExecutionContextInfo;
}

interface DelayedMessageEntry extends PerformanceEntry {
    blockedDuration?: number;
    serialization?: number;
    deserialization?: number;
    taskCount?: number;
    scriptTaskCount?: number;
    messageType?: string;
    receiver?: MessageScriptInfo;
    invoker?: MessageScriptInfo;
}

const DELAY_THRESHOLD_MS = 50;
const SERIALIZATION_THRESHOLD_MS = 5;

const supportsDelayedMessage = typeof PerformanceObserver !== 'undefined'
    && Array.isArray(PerformanceObserver.supportedEntryTypes)
    && PerformanceObserver.supportedEntryTypes.includes('delayed-message');

export function DelayedMessageMonitor() {
    useEffect(() => {
        if (!supportsDelayedMessage || process.env.NODE_ENV === 'production') return;

        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                const messageEntry = entry as DelayedMessageEntry;

                const blockedDuration = messageEntry.blockedDuration ?? 0;
                const serializationDuration = (messageEntry.serialization ?? 0)
                    + (messageEntry.deserialization ?? 0);

                if (
                    blockedDuration < DELAY_THRESHOLD_MS
                    && serializationDuration < SERIALIZATION_THRESHOLD_MS
                ) {
                    return;
                }

                log.info(
                    {
                        blockedDuration,
                        serializationDuration,
                        taskCount: messageEntry.taskCount,
                        scriptTaskCount: messageEntry.scriptTaskCount,
                        messageType: messageEntry.messageType,
                        senderContext: messageEntry.invoker?.executionContext?.type,
                        receiverContext: messageEntry.receiver?.executionContext?.type,
                    },
                    'Delayed message detected',
                );
            });
        });

        observer.observe({ type: 'delayed-message', buffered: true });

        return () => observer.disconnect();
    }, []);

    return null;
}
