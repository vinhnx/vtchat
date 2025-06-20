import { cn, LoadingSpinner, Type } from '@repo/ui';

export type InlineLoaderProps = {
    label?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    variant?: 'subtle' | 'normal';
    className?: string;
};

export const InlineLoader = ({
    label = 'Loading...',
    size = 'sm',
    variant = 'normal',
    className,
}: InlineLoaderProps) => {
    const sizeClasses = {
        xs: 'gap-1',
        sm: 'gap-1.5',
        md: 'gap-2',
        lg: 'gap-3',
    };

    const textSize = {
        xs: 'xxs' as const,
        sm: 'xs' as const,
        md: 'sm' as const,
        lg: 'base' as const,
    };

    return (
        <div
            className={cn(
                'flex items-center justify-center',
                sizeClasses[size],
                variant === 'subtle' && 'opacity-60',
                className
            )}
        >
            <LoadingSpinner 
                variant="primary" 
                size={size === 'xs' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
                className="text-primary"
            />
            {label && (
                <Type size={textSize[size]} textColor="secondary" className="whitespace-nowrap">
                    {label}
                </Type>
            )}
        </div>
    );
};
