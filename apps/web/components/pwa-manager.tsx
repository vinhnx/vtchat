"use client";

import { log } from "@repo/shared/lib/logger";
import { Button } from "@repo/ui";
import { Download, Smartphone, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { swManager } from "../lib/service-worker-manager";

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: "accepted" | "dismissed";
        platform: string;
    }>;
    prompt(): Promise<void>;
}

export function PWAManager() {
    const pathname = usePathname();
    const [isSupported, setIsSupported] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);
    const [bannerDismissed, setBannerDismissed] = useState(false);
    const [showBanner, setShowBanner] = useState(false);

    // Only show PWA banner on homepage
    const isHomepage = pathname === "/";

    useEffect(() => {
        // Check if PWA is supported
        setIsSupported(typeof window !== "undefined" && "serviceWorker" in navigator);

        // Check if already installed
        setIsInstalled(window.matchMedia("(display-mode: standalone)").matches);

        // Check if iOS
        const isIOSDevice =
            /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(isIOSDevice);

        // Register service worker using our manager (production only)
        if (process.env.NODE_ENV === "production" && swManager) {
            swManager.register().catch((error) => {
                log.error({ error }, "Service Worker registration failed");
            });
        }

        // Listen for beforeinstallprompt event (Chrome/Edge)
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        // Listen for app installed event
        const handleAppInstalled = () => {
            setIsInstalled(true);
            setDeferredPrompt(null);
            setShowIOSInstructions(false);
        };

        window.addEventListener("appinstalled", handleAppInstalled);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
            window.removeEventListener("appinstalled", handleAppInstalled);
        };
    }, []);

    // Auto-dismiss banner after 4 seconds and handle banner visibility
    useEffect(() => {
        if (
            isSupported &&
            !isInstalled &&
            (deferredPrompt || isIOS) &&
            isHomepage &&
            !bannerDismissed
        ) {
            // Show banner immediately
            setShowBanner(true);

            // Auto-dismiss after 4 seconds
            const timer = setTimeout(() => {
                setShowBanner(false);
                setBannerDismissed(true);
            }, 4000);

            return () => clearTimeout(timer);
        } else {
            setShowBanner(false);
        }
    }, [isSupported, isInstalled, deferredPrompt, isIOS, isHomepage, bannerDismissed]);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            // Chrome/Edge install prompt
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === "accepted") {
                setDeferredPrompt(null);
                setShowBanner(false);
                setBannerDismissed(true);
            }
        } else if (isIOS && !isInstalled) {
            // Show iOS instructions
            setShowIOSInstructions(true);
        }
    };

    const handleCloseBanner = () => {
        setShowBanner(false);
        setBannerDismissed(true);
        setShowIOSInstructions(false);
    };

    // Don't show if not supported, already installed, no install prompt available, or not on homepage
    if (!isSupported || isInstalled || (!deferredPrompt && !isIOS) || !isHomepage) {
        return null;
    }

    return (
        <>
            {/* Install Banner */}
            {showBanner && (
                <div className="pwa-install-banner fixed bottom-0 left-0 right-0 z-[90] bg-background border-t border-border p-3 pb-safe-area-inset-bottom shadow-[0_-2px_10px_rgba(0,0,0,0.1)] md:hidden">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <Smartphone className="h-6 w-6 flex-shrink-0 text-primary" />
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">Install VT App</span>
                                <span className="text-xs text-muted-foreground">
                                    Get a better experience, offline access.
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCloseBanner}
                                className="flex-shrink-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                            <Button
                                onClick={handleInstallClick}
                                size="sm"
                                className="flex-shrink-0"
                            >
                                <Download className="h-4 w-4 mr-1" />
                                Install
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* iOS Instructions Modal */}
            {showIOSInstructions && (
                <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-background max-w-sm rounded-lg p-6 shadow-xl border border-border">
                        <div className="mb-4 flex items-center justify-between">
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
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    1
                                </div>
                                <p className="text-sm">
                                    Tap the <strong>Share</strong> button{" "}
                                    <span className="inline-block text-primary">⎋</span> at the
                                    bottom
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    2
                                </div>
                                <p className="text-sm">
                                    Select <strong>"Add to Home Screen"</strong>{" "}
                                    <span className="inline-block text-primary">➕</span>
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    3
                                </div>
                                <p className="text-sm">
                                    Tap <strong>"Add"</strong> to install VT on your home screen
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center gap-2 rounded-lg bg-muted p-3">
                            <Smartphone className="h-5 w-5 text-primary" />
                            <p className="text-xs text-muted-foreground">
                                Once installed, VT will work like a native app with offline support!
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
