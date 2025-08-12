'use client';

import { ModelEnum } from '@repo/ai/models';
import { useSession } from '@repo/shared/lib/auth-client';
import { useEffect, useState } from 'react';

export interface RateLimitStatus {
    dailyUsed: number;
    minuteUsed: number;
    dailyLimit: number;
    minuteLimit: number;
    remainingDaily: number;
    remainingMinute: number;
    resetTime: {
        daily: Date;
        minute: Date;
    };
}

export function useRateLimit(modelId: ModelEnum) {
    const { data: session } = useSession();
    const [status, setStatus] = useState<RateLimitStatus | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Only fetch for free models and authenticated users
        if (!session?.user?.id || modelId !== ModelEnum.GEMINI_2_5_FLASH_LITE) {
            setStatus(null);
            return;
        }

        const fetchRateLimit = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    `/api/rate-limit/status?model=${encodeURIComponent(modelId)}`,
                );

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json();

                if (data) {
                    // Convert date strings back to Date objects
                    data.resetTime = {
                        daily: new Date(data.resetTime.daily),
                        minute: new Date(data.resetTime.minute),
                    };
                }

                setStatus(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch rate limit status');
                setStatus(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRateLimit();

        // Refresh every minute to update remaining time
        const interval = setInterval(fetchRateLimit, 60_000);

        return () => clearInterval(interval);
    }, [modelId, session?.user?.id]);

    return { status, isLoading, error };
}

export function useRateLimitForChatMode(chatMode: string) {
    // Map chat mode to model - only needed for Gemini 2.5 Flash Lite
    const modelId = chatMode === ChatMode.GEMINI_2_5_FLASH_LITE
        ? ModelEnum.GEMINI_2_5_FLASH_LITE
        : null;

    return useRateLimit(modelId as ModelEnum);
}
