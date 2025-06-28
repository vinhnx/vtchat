import { CodeBlock, ToolResultIcon } from '@repo/common/components';
import { isMathTool } from '@repo/common/constants/math-tools';
import { isChartTool } from '@repo/common/constants/chart-tools';
import { ToolResult as ToolResultType } from '@repo/shared/types';
import { Badge, cn, DynamicChartRenderer, Card } from '@repo/ui';
import { ChevronDown, CheckCircle, BarChart3, CheckCheck, Activity } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
        <Card className="w-full border-muted/50 bg-muted/20 transition-all duration-200 hover:bg-muted/30">
            <motion.div
                className="flex w-full cursor-pointer flex-row items-center justify-between gap-3 p-3"
                onClick={toggleOpen}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
            >
                <div className="flex flex-row items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                        {isResultMathTool ? (
                            <CheckCheck size={16} className="text-muted-foreground" />
                        ) : isResultChartTool ? (
                            <Activity size={16} className="text-muted-foreground" />
                        ) : (
                            <ToolResultIcon />
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <Badge 
                            variant="secondary" 
                            className="border-muted-foreground/20 bg-background/80 text-muted-foreground text-xs font-medium"
                        >
                            <CheckCircle size={10} className="mr-1" />
                            {isResultMathTool ? 'Result' : isResultChartTool ? 'Chart' : 'Result'}
                        </Badge>
                        <Badge 
                            variant="outline" 
                            className="border-muted-foreground/10 bg-muted/20 text-muted-foreground text-xs"
                        >
                            {isResultMathTool
                                ? `${toolResult.toolName}`
                                : isResultChartTool
                                  ? `${toolResult.toolName}`
                                  : toolResult.toolName}
                        </Badge>
                    </div>
                </div>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-md p-1 hover:bg-muted/60"
                >
                    <ChevronDown
                        size={16}
                        strokeWidth={2}
                        className="text-muted-foreground"
                    />
                </motion.div>
            </motion.div>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-muted/50 p-3 pt-3">
                            {isResultChartTool ? (
                                <div className="w-full">
                                    <DynamicChartRenderer {...(toolResult.result as any)} />
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Activity size={14} className="text-muted-foreground" />
                                        <span className="text-xs font-medium text-muted-foreground">Output</span>
                                    </div>
                                    <CodeBlock
                                        variant="secondary"
                                        showHeader={false}
                                        lang="json"
                                        className="rounded-md border-muted/50"
                                        code={JSON.stringify(toolResult.result, null, 2)}
                                    />
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
});

ToolResultStep.displayName = 'ToolResultStep';
