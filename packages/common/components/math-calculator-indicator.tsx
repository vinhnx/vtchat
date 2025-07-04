import { Badge } from '@repo/ui';
import { Loader2, Sigma } from 'lucide-react';
import { memo } from 'react';

export type MathCalculatorIndicatorProps = {
    isCalculating: boolean;
};

export const MathCalculatorIndicator = memo(({ isCalculating }: MathCalculatorIndicatorProps) => {
    if (!isCalculating) return null;

    return (
        <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-2">
            <div className="flex items-center gap-1">
                <Sigma className="text-green-600" size={16} />
                <Loader2 className="animate-spin text-green-600" size={14} />
            </div>
            <Badge className="border-green-300 bg-green-100 text-green-800">
                🧮 Calculating...
            </Badge>
        </div>
    );
});

MathCalculatorIndicator.displayName = 'MathCalculatorIndicator';
