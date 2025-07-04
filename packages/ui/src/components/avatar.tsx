import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '../lib/utils';

export type TAvatar = {
    name: string;
    src?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
};

export const Avatar = ({ name, src, size = 'md', className }: TAvatar) => {
    const sizeClasses = {
        sm: 'h-7 w-7 min-w-7',
        md: 'h-8 w-8 min-w-8',
        lg: 'h-12 w-12 min-w-12',
    };

    return (
        <AvatarPrimitive.Root
            className={cn(
                'relative flex shrink-0 overflow-hidden rounded-full',
                sizeClasses[size],
                className
            )}
        >
            {src && (
                <AvatarPrimitive.Image
                    alt={name}
                    className="aspect-square h-full w-full object-cover"
                    src={src}
                />
            )}
            <AvatarPrimitive.Fallback
                className={cn(
                    'bg-secondary text-secondary-foreground flex h-full w-full items-center justify-center rounded-full font-bold uppercase',
                    size === 'sm' && 'text-xs',
                    size === 'md' && 'text-sm',
                    size === 'lg' && 'text-base'
                )}
            >
                {name?.[0] || '?'}
            </AvatarPrimitive.Fallback>
        </AvatarPrimitive.Root>
    );
};
