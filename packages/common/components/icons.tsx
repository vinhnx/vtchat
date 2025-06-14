import { cn } from '@repo/ui';
import { Zap, Code, Loader, Wrench } from 'lucide-react';

export const ToolIcon = ({ className }: { className?: string }) => {
    return (
        <div
            className={`flex size-5 items-center justify-center rounded-md border border-yellow-900 bg-yellow-800 p-0.5 ${className}`}
        >
            <Wrench size={20} strokeWidth={2} className="text-yellow-400"  />
        </div>
    );
};

export const ToolResultIcon = () => {
    return (
        <div className="flex size-5 items-center justify-center rounded-md border border-yellow-900 bg-yellow-800 p-0.5">
            <Code size={20} strokeWidth={2} className="text-yellow-400"  />
        </div>
    );
};

export const DeepResearchIcon = () => {
    return <Loader size={20} strokeWidth={2} className="text-muted-foreground"  />;
};

export const BYOKIcon = () => {
    return (
        <div className="flex-inline flex h-5 items-center justify-center gap-1 rounded-md bg-emerald-500/20 p-0.5 px-1 font-mono text-xs font-medium text-emerald-600">
            BYOK
        </div>
    );
};

export const NewIcon = () => {
    return (
        <div className="flex-inline flex h-5 items-center justify-center gap-1 rounded-md bg-emerald-500/20 p-0.5 px-1 font-mono text-xs font-medium text-emerald-500">
            New
        </div>
    );
};
<<<<<<< HEAD
=======

export const CreditIcon = ({
    credits,
    variant = 'default',
}: {
    credits: number;
    variant?: 'default' | 'muted';
}) => {
    return (
        <div
            className={cn(
                'flex-inline text-muted-foreground flex h-5 items-center justify-center gap-0.5 rounded-md border border-none font-mono text-xs font-medium opacity-50',
                variant === 'muted' && 'border-none'
            )}
        >
            <Zap size={14} strokeWidth={2} className="text-muted-foreground"  /> {credits}
        </div>
    );
};
>>>>>>> 0c84a71 (feat: unify icon packages to use lucide-react only)
