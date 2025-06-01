'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { useAuth } from '@clerk/nextjs';
import { FeatureSlug } from '@repo/shared/types/subscription';
import { checkSubscriptionAccess } from '@repo/shared/utils/subscription';
import { Alert, Button } from '@repo/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ModeToggleProps {
    onClose?: () => void;
}

export function ModeToggle({ onClose }: ModeToggleProps) {
    const { theme, setTheme } = useTheme();
    const { isLoaded, has } = useAuth();
    const router = useRouter();
    const [showAlert, setShowAlert] = useState(false);

    if (!isLoaded) return null;

    const hasDarkModeFeature = checkSubscriptionAccess(has, { feature: FeatureSlug.DARK_MODE });

    const handleToggle = () => {
        if (!hasDarkModeFeature) {
            setShowAlert(true);
            return;
        }
        setTheme(theme === 'dark' ? 'light' : 'dark');
        if (onClose) onClose();
    };

    const handleUpgrade = () => {
        router.push('/plus');
        if (onClose) onClose();
        setShowAlert(false);
    };

    return (
        <>
            <Button variant="outlined" size="icon" onClick={handleToggle}>
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
            </Button>
            {showAlert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <Alert variant="destructive" className="max-w-md" title="Upgrade Required">
                        <p className="mb-4">
                            Dark mode is a VT+ feature. Please upgrade your plan to use this
                            feature.
                        </p>
                        <div className="flex justify-end space-x-2">
                            <Button variant="outlined" onClick={() => setShowAlert(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpgrade}>Upgrade Now</Button>
                        </div>
                    </Alert>
                </div>
            )}
        </>
    );
}
