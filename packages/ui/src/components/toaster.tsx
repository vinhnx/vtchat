'use client';

import { AlertCircle, Check } from 'lucide-react';
import { Button } from './button';
import {
    Toast,
    ToastClose,
    ToastDescription,
    ToastProvider,
    ToastTitle,
    ToastViewport,
} from './toast';
import { useToast } from './use-toast';

export function Toaster() {
    const { toasts, dismiss } = useToast();

    return (
        <ToastProvider>
            {toasts.map(({ id, title, description, action, ...props }) => (
                <Toast key={id} {...props}>
                    <div className='flex flex-row gap-3'>
                        {props.variant === 'destructive'
                            ? (
                                <AlertCircle
                                    className='mt-1 flex-shrink-0 text-white'
                                    size={18}
                                    strokeWidth={2}
                                />
                            )
                            : (
                                <Check
                                    className='mt-1 flex-shrink-0 text-white'
                                    size={18}
                                    strokeWidth={2}
                                />
                            )}
                        <div className='flex w-full flex-col items-start gap-0'>
                            {title && <ToastTitle>{title}</ToastTitle>}
                            {description && <ToastDescription>{description}</ToastDescription>}
                            {action && (
                                <div className='flex flex-row gap-1 pt-2'>
                                    {action}
                                    <Button
                                        onClick={() => {
                                            dismiss();
                                        }}
                                        size='sm'
                                        variant='ghost'
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            )}
                        </div>
                        {!action && <ToastClose />}
                    </div>
                </Toast>
            ))}
            <ToastViewport />
        </ToastProvider>
    );
}
