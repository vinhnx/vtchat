import * as AvatarPrimitive from '@radix-ui/react-avatar';
import * as React from 'react';

import { cn } from '../lib/utils';

const Avatar = React.forwardRef<
    React.ElementRef<typeof AvatarPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
    <AvatarPrimitive.Root
        ref={ref}
        className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)}
        {...props}
    />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
    React.ElementRef<typeof AvatarPrimitive.Image>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
    <AvatarPrimitive.Image
        ref={ref}
        className={cn('aspect-square h-full w-full', className)}
        {...props}
    />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
    React.ElementRef<typeof AvatarPrimitive.Fallback>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
    <AvatarPrimitive.Fallback
        ref={ref}
        className={cn(
            'flex h-full w-full items-center justify-center rounded-full bg-muted',
            className
        )}
        {...props}
    />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };

// Keep the old implementation for backward compatibility
export type TAvatar = {
    name: string;
    src?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
};

export const AvatarLegacy = ({ name, src, size = 'md', className }: TAvatar) => {
    const sizeClasses = {
        sm: 'h-7 w-7 min-w-7',
        md: 'h-8 w-8 min-w-8',
        lg: 'h-12 w-12 min-w-12',
    };

    return (
        <Avatar className={cn(sizeClasses[size], className)}>
            {src && <AvatarImage alt={name} src={src} />}
            <AvatarFallback
                className={cn(
                    'bg-secondary text-secondary-foreground font-bold uppercase',
                    size === 'sm' && 'text-xs',
                    size === 'md' && 'text-sm',
                    size === 'lg' && 'text-base'
                )}
            >
                {name?.[0] || '?'}
            </AvatarFallback>
        </Avatar>
    );
};
