'use client';

import { useSession } from '@repo/shared/lib/auth-client';
import { FeatureSlug, PlanSlug } from '@repo/shared/types/subscription';
import React from 'react';

export interface GatedFeatureAlertProps {
    requiredFeature?: FeatureSlug;
    requiredPlan?: PlanSlug;
    message?: string;
    title?: string;
    onGatedClick?: () => void;
    upgradeUrl?: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
    showAlert?: boolean;
}

export const GatedFeatureAlert: React.FC<GatedFeatureAlertProps> = ({
    requiredFeature,
    requiredPlan,
    message,
    title,
    onGatedClick,
    upgradeUrl,
    children,
    fallback,
    showAlert,
}) => {
    void requiredFeature;
    void requiredPlan;
    void message;
    void title;
    void onGatedClick;
    void upgradeUrl;
    void fallback;
    void showAlert;
    useSession();

    return <>{children}</>;
};

export const useFeatureGate = () => {
    return { hasAccess: true };
};
