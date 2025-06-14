'use client';

import { LOADING_MESSAGES } from '@repo/shared/constants';
import { Card } from '@repo/ui';
import { IconExternalLink, IconLoader2 } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';

interface PortalLoadingIndicatorProps {
    isVisible: boolean;
}

/**
 * Component that shows a loading indicator when fetching portal URL
 */
export function PortalLoadingIndicator({ isVisible }: PortalLoadingIndicatorProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
                >
                    <Card className="flex items-center gap-4 p-6 shadow-xl">
                        <div className="relative">
                            <IconLoader2 size={24} className="animate-spin text-blue-500" />
                            <IconExternalLink
                                size={12}
                                className="text-muted-foreground absolute -right-1 -top-1"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-base font-medium">
                                {LOADING_MESSAGES.FETCHING_PORTAL_URL}
                            </span>
                            <span className="text-muted-foreground text-sm">
                                {LOADING_MESSAGES.OPENING_PORTAL}
                            </span>
                        </div>
                    </Card>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
