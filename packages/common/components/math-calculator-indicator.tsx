import { Badge } from '@repo/ui';
import { Loader2, Sigma } from 'lucide-react';
import { memo } from 'react';

export type MathCalculatorIndicatorProps = {
    isCalculating: boolean;
};

export const MathCalculatorIndicator = memo(({ isCalculating }: MathCalculatorIndicatorProps) => {
    if (!isCalculating) return null;

    return (
        <div className='flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800'>
            <div className='flex items-center gap-1'>
                <Sigma className='text-green-600' size={16} />
                <Loader2 className='animate-spin text-green-600' size={14} />
            </div>
            <Badge className='border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300'>
                🧮 Calculating...
            </Badge>
        </div>
    );
});

MathCalculatorIndicator.displayName = 'MathCalculatorIndicator';
