'use client';

import { useState } from 'react';
import { useSubscriptionAccess } from '@repo/common/hooks';
import { FeatureSlug, PlanSlug } from '@repo/shared/types/subscription';

interface GateInfo {
    feature?: string;
    plan?: string;
    title: string;
    message: string;
}

export const useSubscriptionGate = () => {
    const [showGateAlert, setShowGateAlert] = useState<GateInfo | null>(null);
    const { hasAccess, canAccess } = useSubscriptionAccess();

    const checkAccess = (params: {
        feature?: FeatureSlug;
        plan?: PlanSlug;
        title: string;
        message: string;
    }) => {
        let hasRequiredAccess = true;

        if (params.feature) {
            hasRequiredAccess = hasAccess({ feature: params.feature });
        }

        if (params.plan && hasRequiredAccess) {
            hasRequiredAccess = hasAccess({ plan: params.plan });
        }

        if (!hasRequiredAccess) {
            setShowGateAlert({
                feature: params.feature,
                plan: params.plan,
                title: params.title,
                message: params.message,
            });
            return false;
        }

        return true;
    };

    const canAccessFeature = (feature: FeatureSlug) => {
        return canAccess(feature);
    };

    return {
        showGateAlert,
        setShowGateAlert,
        checkAccess,
        canAccessFeature,
        hasAccess,
    };
};
