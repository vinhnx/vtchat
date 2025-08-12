'use client';

import { toast } from 'sonner';

// Simple wrapper to maintain API compatibility with existing useToast usage
export function useToast() {
    return {
        toast: ({
            title,
            description,
            variant = 'default',
            duration = 4000,
        }: {
            title?: string;
            description?: string;
            variant?: 'default' | 'destructive' | 'success';
            duration?: number;
        }) => {
            const message = description || title || '';
            const titleText = description ? title : undefined;

            switch (variant) {
                case 'destructive':
                    return toast.error(message, {
                        description: titleText,
                        duration,
                        dismissible: true,
                        closeButton: true,
                    });
                case 'success':
                    return toast.success(message, {
                        description: titleText,
                        duration,
                    });
                default:
                    return toast(message, {
                        description: titleText,
                        duration,
                    });
            }
        },
        dismiss: (toastId?: string) => {
            if (toastId) {
                toast.dismiss(toastId);
            } else {
                toast.dismiss();
            }
        },
    };
}

export { toast };
