'use client';

import { Button, Dialog, DialogContent, TypographyH3 } from '@repo/ui';
import { KeyRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

export interface LoginRequiredDialogProps {
    /** Whether the dialog is open */
    isOpen: boolean;
    /** Function to call when dialog should be closed */
    onClose: () => void;
    /** Custom title for the dialog */
    title?: string;
    /** Custom description for the dialog */
    description?: string;
    /** Custom icon component */
    icon?: React.ComponentType<{ size?: number; className?: string }>;
    /** Custom redirect URL after login */
    redirectUrl?: string;
    /** Custom cancel button text */
    cancelText?: string;
    /** Custom login button text */
    loginText?: string;
    /** Whether to show the cancel button */
    showCancel?: boolean;
}

/**
 * LoginRequiredDialog - A reusable dialog component for requiring user login
 *
 * This component provides a consistent login prompt across the application with
 * customizable title, description, and icon based on context.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <LoginRequiredDialog
 *   isOpen={showLoginPrompt}
 *   onClose={() => setShowLoginPrompt(false)}
 * />
 *
 * // Customized for specific context
 * <LoginRequiredDialog
 *   isOpen={showLoginPrompt}
 *   onClose={() => setShowLoginPrompt(false)}
 *   title="Upload Requires Login"
 *   description="Please log in to upload and attach files to your messages."
 *   icon={IconPaperclip}
 * />
 * ```
 */
export const LoginRequiredDialog: React.FC<LoginRequiredDialogProps> = ({
    isOpen,
    onClose,
    title = 'Login Required',
    description = 'Please sign in to access this feature.',
    icon: Icon = KeyRound,
    redirectUrl,
    cancelText = 'Cancel',
    loginText = 'Sign In',
    showCancel = true,
}) => {
    const router = useRouter();

    const handleLogin = () => {
        onClose();
        const loginUrl = redirectUrl
            ? `/login?redirect_url=${encodeURIComponent(redirectUrl)}`
            : '/login';
        router.push(loginUrl);
    };

    const handleCancel = () => {
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent ariaTitle={title} className="max-w-md rounded-xl">
                <div className="flex flex-col items-center gap-4 p-6 text-center">
                    <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
                        <Icon size={24} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="space-y-2">
                        <TypographyH3 className="text-lg font-semibold">{title}</TypographyH3>
                        <p className="text-muted-foreground text-sm">{description}</p>
                    </div>
                    <div className="flex gap-2">
                        {showCancel && (
                            <Button variant="outlined" onClick={handleCancel}>
                                {cancelText}
                            </Button>
                        )}
                        <Button onClick={handleLogin}>{loginText}</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

/**
 * Hook for managing login requirement state
 * Provides consistent state management for login prompts
 */
export const useLoginRequired = () => {
    const [showLoginPrompt, setShowLoginPrompt] = React.useState(false);

    const requireLogin = React.useCallback(() => {
        setShowLoginPrompt(true);
    }, []);

    const hideLoginPrompt = React.useCallback(() => {
        setShowLoginPrompt(false);
    }, []);

    return {
        showLoginPrompt,
        requireLogin,
        hideLoginPrompt,
        setShowLoginPrompt,
    };
};

/**
 * Higher-order component for requiring login before executing actions
 */
export const withLoginRequired = <T extends Record<string, any>>(
    Component: React.ComponentType<T>,
    options?: {
        title?: string;
        description?: string;
        icon?: React.ComponentType<{ size?: number; className?: string }>;
    }
) => {
    const WithLoginRequired = (props: T & { isSignedIn: boolean }) => {
        const { isSignedIn, ...componentProps } = props;
        const { showLoginPrompt, requireLogin, hideLoginPrompt } = useLoginRequired();

        if (!isSignedIn) {
            return (
                <>
                    <Component
                        {...(componentProps as any)}
                        onClick={(e: React.MouseEvent) => {
                            e.preventDefault();
                            e.stopPropagation();
                            requireLogin();
                        }}
                        style={{
                            opacity: 0.7,
                            cursor: 'pointer',
                        }}
                    />
                    <LoginRequiredDialog
                        isOpen={showLoginPrompt}
                        onClose={hideLoginPrompt}
                        title={options?.title}
                        description={options?.description}
                        icon={options?.icon}
                    />
                </>
            );
        }

        return <Component {...(componentProps as any)} />;
    };

    WithLoginRequired.displayName = `withLoginRequired(${Component.displayName || Component.name})`;
    return WithLoginRequired;
};
