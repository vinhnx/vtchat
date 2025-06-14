'use client';

import { LoginForm } from '@/components/login-form';
import { Dialog, DialogContent } from '@repo/ui';

interface LoginDialogProps {
    isOpen: boolean;
    onClose: () => void;
    redirectUrl?: string;
    dismissible?: boolean; // New prop to control if dialog can be closed
}

export function LoginDialog({
    isOpen,
    onClose,
    redirectUrl,
    dismissible = true,
}: LoginDialogProps) {
    const handleOpenChange = (open: boolean) => {
        // Only allow closing if dismissible is true
        if (dismissible && !open) {
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent
                className="p-0 sm:max-w-[425px]"
                ariaTitle="Login"
                // Hide close button when not dismissible
                hideCloseButton={!dismissible}
            >
                <div className="p-6">
                    <LoginForm
                        redirectUrl={redirectUrl}
                        onClose={dismissible ? onClose : undefined}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
