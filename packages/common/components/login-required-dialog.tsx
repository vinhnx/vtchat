'use client';

import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@repo/ui';
import { LogIn } from 'lucide-react';
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
 * />
 * ```
 */
export const LoginRequiredDialog: React.FC<LoginRequiredDialogProps> = React.memo(
    ({
        isOpen,
        onClose,
        title = 'Sign in to Continue',
        description = 'Join VTChat to unlock all features and save your conversations. It only takes a moment!',
        redirectUrl,
        cancelText = 'Not Now',
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
            <Dialog onOpenChange={onClose} open={isOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>{description}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-3">
                        {showCancel && (
                            <Button onClick={handleCancel} variant="outline">
                                {cancelText}
                            </Button>
                        )}
                        <Button className="gap-2" onClick={handleLogin}>
                            <LogIn size={16} />
                            {loginText}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }
);

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
                        description={options?.description}
                        isOpen={showLoginPrompt}
                        onClose={hideLoginPrompt}
                        title={options?.title}
                    />
                </>
            );
        }

        return <Component {...(componentProps as any)} />;
    };

    WithLoginRequired.displayName = `withLoginRequired(${Component.displayName || Component.name})`;
    return WithLoginRequired;
};
