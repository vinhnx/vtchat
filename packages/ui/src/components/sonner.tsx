'use client';
import { useTheme } from 'next-themes';
import type React from 'react';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
    const { theme = 'system' } = useTheme();

    return (
        <Sonner
            className="toaster group"
            theme={theme as ToasterProps['theme']}
            toastOptions={{
                classNames: {
                    toast: 'group group-[.toaster]:rounded-2xl toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
                    description: 'group-[.toast]:text-muted-foreground',
                    actionButton: 'group-[.toast]:bg-foreground group-[.toast]:text-background',
                    cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
                },
            }}
            {...props}
        />
    );
};

export { Toaster };
export { Toaster as SonnerToaster };
