'use client';

import { LoginForm } from '@/components/login-form';
import { Dialog, DialogContent } from '@repo/ui';

interface LoginDialogProps {
    isOpen: boolean;
    onClose: () => void;
    redirectUrl?: string;
}

export function LoginDialog({ isOpen, onClose, redirectUrl }: LoginDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="p-0 sm:max-w-[425px]" ariaTitle="Login">
                <div className="p-6">
                    <LoginForm redirectUrl={redirectUrl} onClose={onClose} />
                </div>
            </DialogContent>
        </Dialog>
    );
}
