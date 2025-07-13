/**
 * Plus Defaults Provider
 *
 * Automatically applies plus user default settings when subscription status changes
 * Should be placed inside SubscriptionProvider in the component tree
 */

"use client";

import { usePlusDefaults } from "../hooks/use-plus-defaults";

interface PlusDefaultsProviderProps {
    children: React.ReactNode;
}

export function PlusDefaultsProvider({ children }: PlusDefaultsProviderProps) {
    // This hook handles all the logic for applying plus defaults
    usePlusDefaults();

    // This provider doesn't render anything special, just manages side effects
    return <>{children}</>;
}
