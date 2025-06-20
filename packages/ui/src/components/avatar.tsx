import { cn } from '../lib/utils';

export type TAvatar = {
    name: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
};
export const Avatar = ({ name, size = 'md', className }: TAvatar) => {
    return (
        <div
            className={cn(
                'bg-secondary text-secondary-foreground relative rounded-full',
                size === 'sm' && 'h-7 w-7 min-w-7',
                size === 'md' && 'h-8 w-8 min-w-8',
                size === 'lg' && 'h-12 w-12 min-w-12',
                className
            )}
            style={{
                borderRadius: '50%',
            }}
        >
            <p className="absolute inset-0 flex items-center justify-center font-bold uppercase">
                {name?.[0]}
            </p>
        </div>
    );
};
