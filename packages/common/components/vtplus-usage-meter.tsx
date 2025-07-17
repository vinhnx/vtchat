"use client";

import type { QUOTA_WINDOW } from "../src/config/vtPlusLimits";

interface VtPlusUsageData {
    deepResearch: {
        used: number;
        limit: number;
        feature: string;
        window: (typeof QUOTA_WINDOW)[keyof typeof QUOTA_WINDOW];
        percentage: number;
        resetAt: string;
    };
    proSearch: {
        used: number;
        limit: number;
        feature: string;
        window: (typeof QUOTA_WINDOW)[keyof typeof QUOTA_WINDOW];
        percentage: number;
        resetAt: string;
    };
    rag: {
        used: number;
        limit: number;
        feature: string;
        window: (typeof QUOTA_WINDOW)[keyof typeof QUOTA_WINDOW];
        percentage: number;
        resetAt: string;
    };
    resetAt: string; // Legacy field for backward compatibility
    currentPeriod: string;
}

interface VtPlusUsageMeterProps {
    userId?: string;
}

export function VtPlusUsageMeter({ userId }: VtPlusUsageMeterProps) {
    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h3 className="text-lg font-medium">VT+ Usage</h3>
                <p className="text-sm text-muted-foreground">
                    Track your VT+ feature usage and quota limits.
                </p>
            </div>
            <div className="text-sm text-muted-foreground">
                VT+ Usage component loaded successfully. User ID: {userId || "Not provided"}
            </div>
        </div>
    );
}
