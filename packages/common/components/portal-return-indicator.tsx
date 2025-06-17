'use client';

import { LOADING_MESSAGES } from '@repo/shared/constants';
import { Card } from '@repo/ui';
import { Check, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface PortalReturnIndicatorProps {
    isVisible: boolean;
    onComplete?: () => void;
}

/**
 * Component that shows a loading indicator when user returns from Creem portal
 * and subscription status is being refreshed
 */
export function PortalReturnIndicator({ isVisible, onComplete }: PortalReturnIndicatorProps) {
    const [stage, setStage] = useState<'loading' | 'success'>('loading');

    useEffect(() => {
        if (isVisible) {
            setStage('loading');

            // After 2 seconds, show success and auto-hide
            const timer = setTimeout(() => {
                setStage('success');

                // Hide after showing success for 1 second
                const hideTimer = setTimeout(() => {
                    onComplete?.();
                }, 1000);

                return () => clearTimeout(hideTimer);
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [isVisible, onComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    className="fixed right-4 top-4 z-50"
                >
                    <Card className="flex items-center gap-3 p-4 shadow-lg">
                        {stage === 'loading' ? (
                            <>
                                <Loader2 size={20} className="animate-spin text-blue-500"  />
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">
                                        {LOADING_MESSAGES.SYNCING_SUBSCRIPTION}
                                    </span>
                                    <span className="text-muted-foreground text-xs">
                                        {LOADING_MESSAGES.UPDATING_STATUS}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <>
                                <Check size={20} className="text-green-500"  />
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">
                                        {LOADING_MESSAGES.SUBSCRIPTION_UPDATED}
                                    </span>
                                    <span className="text-muted-foreground text-xs">
                                        {LOADING_MESSAGES.ACCOUNT_IN_SYNC}
                                    </span>
                                </div>
                            </>
                        )}
                    </Card>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
