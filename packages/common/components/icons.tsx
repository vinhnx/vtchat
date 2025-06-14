import { IconCodeDots, IconSpiral, IconTools } from '@tabler/icons-react';

export const ToolIcon = ({ className }: { className?: string }) => {
    return (
        <div
            className={`flex size-5 items-center justify-center rounded-md border border-yellow-900 bg-yellow-800 p-0.5 ${className}`}
        >
            <IconTools size={20} strokeWidth={2} className="text-yellow-400" />
        </div>
    );
};

export const ToolResultIcon = () => {
    return (
        <div className="flex size-5 items-center justify-center rounded-md border border-yellow-900 bg-yellow-800 p-0.5">
            <IconCodeDots size={20} strokeWidth={2} className="text-yellow-400" />
        </div>
    );
};

export const DeepResearchIcon = () => {
    return <IconSpiral size={20} strokeWidth={2} className="text-muted-foreground" />;
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
