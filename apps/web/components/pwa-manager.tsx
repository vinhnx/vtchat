'use client';

import { useEffect, useState } from 'react';
import { Button } from '@repo/ui';
import { Download, Smartphone, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

export function PWAManager() {
    const [isSupported, setIsSupported] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);

    useEffect(() => {
        // Check if PWA is supported
        setIsSupported('serviceWorker' in navigator);

        // Check if already installed
        setIsInstalled(window.matchMedia('(display-mode: standalone)').matches);

        // Check if iOS
        const isIOSDevice =
            /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(isIOSDevice);

        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js', {
                    scope: '/',
                    updateViaCache: 'none',
                })
                .then((registration) => {
                    console.log('Service Worker registered successfully:', registration);
                })
                .catch((error) => {
                    console.error('Service Worker registration failed:', error);
                });
        }

        // Listen for beforeinstallprompt event (Chrome/Edge)
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Listen for app installed event
        const handleAppInstalled = () => {
            setIsInstalled(true);
            setDeferredPrompt(null);
            setShowIOSInstructions(false);
        };

        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            // Chrome/Edge install prompt
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
            }
        } else if (isIOS && !isInstalled) {
            // Show iOS instructions
            setShowIOSInstructions(true);
        }
    };

    // Don't show if not supported, already installed, or no install prompt available
    if (!isSupported || isInstalled || (!deferredPrompt && !isIOS)) {
        return null;
    }

    return (
        <>
            {/* Install Button */}
            {(deferredPrompt || (isIOS && !isInstalled)) && (
                <Button
                    onClick={handleInstallClick}
                    variant="outline"
                    size="sm"
                    className="fixed bottom-4 right-4 z-50 shadow-lg md:hidden"
                >
                    <Download className="mr-2 h-4 w-4" />
                    Install App
                </Button>
            )}

            {/* iOS Instructions Modal */}
            {showIOSInstructions && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
                    <div className="max-w-sm rounded-lg bg-background p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Install VT</h3>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowIOSInstructions(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                    1
                                </div>
                                <p className="text-sm">
                                    Tap the <strong>Share</strong> button{' '}
                                    <span className="inline-block text-blue-600">⎋</span> at the
                                    bottom
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                    2
                                </div>
                                <p className="text-sm">
                                    Select <strong>"Add to Home Screen"</strong>{' '}
                                    <span className="inline-block text-blue-600">➕</span>
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                    3
                                </div>
                                <p className="text-sm">
                                    Tap <strong>"Add"</strong> to install VT on your home screen
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center gap-2 rounded-lg bg-blue-50 p-3">
                            <Smartphone className="h-5 w-5 text-blue-600" />
                            <p className="text-xs text-blue-800">
                                Once installed, VT will work like a native app with offline support!
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
