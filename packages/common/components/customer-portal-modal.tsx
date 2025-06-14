'use client';

import { Button } from '@repo/ui';
import { IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

interface CustomerPortalModalProps {
    isOpen: boolean;
    onClose: () => void;
    portalUrl: string;
}

export function CustomerPortalModal({ isOpen, onClose, portalUrl }: CustomerPortalModalProps) {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
        }
    }, [isOpen, portalUrl]);

    const handleIframeLoad = () => {
        setIsLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative h-[90vh] w-[95vw] max-w-6xl rounded-lg bg-white shadow-2xl dark:bg-gray-900">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Manage Subscription
                    </h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-8 w-8"
                    >
                        <IconX size={18} />
                        <span className="sr-only">Close</span>
                    </Button>
                </div>

                {/* Content */}
                <div className="relative h-[calc(90vh-64px)]">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                            <div className="flex flex-col items-center gap-3">
                                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Loading billing portal...
                                </p>
                            </div>
                        </div>
                    )}
                    
                    <iframe
                        src={portalUrl}
                        className="h-full w-full rounded-b-lg"
                        onLoad={handleIframeLoad}
                        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                        referrerPolicy="strict-origin-when-cross-origin"
                        title="Subscription Management Portal"
                    />
                </div>
            </div>
        </div>
    );
}
