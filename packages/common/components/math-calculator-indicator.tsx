import { Badge } from '@repo/ui';
import { Sigma, Loader2 } from 'lucide-react';
import { memo } from 'react';

export type MathCalculatorIndicatorProps = {
    isCalculating: boolean;
};

export const MathCalculatorIndicator = memo(({ isCalculating }: MathCalculatorIndicatorProps) => {
    if (!isCalculating) return null;

    return (
        <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center gap-1">
                <Sigma size={16} className="text-green-600" />
                <Loader2 size={14} className="animate-spin text-green-600" />
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-300">
                🧮 Calculating...
            </Badge>
        </div>
    );
});

MathCalculatorIndicator.displayName = 'MathCalculatorIndicator';
