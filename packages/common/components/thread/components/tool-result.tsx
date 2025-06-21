import { CodeBlock, ToolResultIcon } from '@repo/common/components';
import { isMathTool } from '@repo/common/constants/math-tools';
import { isChartTool } from '@repo/common/constants/chart-tools';
import { ToolResult as ToolResultType } from '@repo/shared/types';
import { Badge, cn, ChartRenderer } from '@repo/ui';
import { ChevronDown, CheckCircle, BarChart3 } from 'lucide-react';
import { memo, useCallback, useState } from 'react';

export type ToolResultProps = {
    toolResult: ToolResultType;
};

export const ToolResultStep = memo(({ toolResult }: ToolResultProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleOpen = useCallback(() => setIsOpen(prev => !prev), []);

    // Check if this is a math calculator tool result
    const isResultMathTool = isMathTool(toolResult.toolName);
    // Check if this is a chart tool result
    const isResultChartTool = isChartTool(toolResult.toolName);

    return (
        <div className="overflow-hidde flex w-full flex-col items-start">
            <div
                className="flex w-full cursor-pointer flex-row items-center justify-between gap-2.5 pb-2 pt-2"
                onClick={toggleOpen}
            >
                <div className="flex flex-row items-center gap-2.5">
                    {isResultMathTool ? (
                        <CheckCircle size={16} className="text-green-600" />
                    ) : isResultChartTool ? (
                        <BarChart3 size={16} className="text-purple-600" />
                    ) : (
                        <ToolResultIcon />
                    )}
                    <Badge
                        className={
                            isResultMathTool
                                ? 'border-green-300 bg-green-100 text-green-800'
                                : isResultChartTool
                                  ? 'border-purple-300 bg-purple-100 text-purple-800'
                                  : ''
                        }
                    >
                        {isResultMathTool ? '✅ Result' : isResultChartTool ? '📊 Chart' : 'Result'}
                    </Badge>
                    <Badge
                        className={
                            isResultMathTool
                                ? 'border-green-200 bg-green-50 text-green-700'
                                : isResultChartTool
                                  ? 'border-purple-200 bg-purple-50 text-purple-700'
                                  : ''
                        }
                    >
                        {isResultMathTool
                            ? `🧮 ${toolResult.toolName}`
                            : isResultChartTool
                              ? `📈 ${toolResult.toolName}`
                              : toolResult.toolName}
                    </Badge>
                </div>
                <div className="pr-2">
                    <ChevronDown
                        size={14}
                        strokeWidth={2}
                        className={cn(
                            'text-muted-foreground transform transition-transform',
                            isOpen && 'rotate-180'
                        )}
                    />
                </div>
            </div>
            {isOpen && (
                <div className="flex w-full flex-row items-center gap-2.5">
                    {isResultChartTool ? (
                        <div className="my-2 w-full">
                            <ChartRenderer {...(toolResult.result as any)} />
                        </div>
                    ) : (
                        <CodeBlock
                            variant="secondary"
                            showHeader={false}
                            lang="json"
                            className="my-2"
                            code={JSON.stringify(toolResult.result, null, 2)}
                        />
                    )}
                </div>
            )}
        </div>
    );
});

ToolResultStep.displayName = 'ToolResultStep';
