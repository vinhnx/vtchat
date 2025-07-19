"use client";

import { CodeBlock, ToolResultIcon } from "@repo/common/components";
import { isChartTool } from "@repo/common/constants/chart-tools";
import { isMathTool } from "@repo/common/constants/math-tools";
import type { ToolResult as ToolResultType } from "@repo/shared/types";
import { Badge, Card, DynamicChartRenderer } from "@repo/ui";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, CheckCheck, CheckCircle, ChevronDown } from "lucide-react";
import { memo, useCallback, useState } from "react";

export type ToolResultProps = {
    toolResult: ToolResultType;
};

export const ToolInvocationStep = memo(({ toolResult }: ToolResultProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleOpen = useCallback(() => setIsOpen((prev) => !prev), []);

    // Check if this is a math calculator tool result
    const isResultMathTool = isMathTool(toolResult.toolName);
    // Check if this is a chart tool result
    const isResultChartTool = isChartTool(toolResult.toolName);

    return (
        <Card className="border-muted/50 bg-muted/20 hover:bg-muted/30 w-full transition-all duration-200">
            <motion.div
                className="flex w-full cursor-pointer flex-row items-center justify-between gap-3 p-3"
                onClick={toggleOpen}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
            >
                <div className="flex flex-row items-center gap-3">
                    <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-md">
                        {isResultMathTool ? (
                            <CheckCheck className="text-muted-foreground" size={16} />
                        ) : isResultChartTool ? (
                            <Activity className="text-muted-foreground" size={16} />
                        ) : (
                            <ToolResultIcon />
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <Badge
                            className="border-muted-foreground/20 bg-background/80 text-muted-foreground text-xs font-medium"
                            variant="secondary"
                        >
                            <CheckCircle className="mr-1" size={10} />
                            {isResultMathTool ? "Result" : isResultChartTool ? "Chart" : "Result"}
                        </Badge>
                        <Badge
                            className="border-muted-foreground/10 bg-muted/20 text-muted-foreground text-xs"
                            variant="outline"
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
                    className="hover:bg-muted/60 rounded-md p-1"
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown className="text-muted-foreground" size={16} strokeWidth={2} />
                </motion.div>
            </motion.div>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        animate={{ height: "auto", opacity: 1 }}
                        className="overflow-hidden"
                        exit={{ height: 0, opacity: 0 }}
                        initial={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="border-muted/50 border-t p-3 pt-3">
                            {isResultChartTool ? (
                                <div className="w-full">
                                    <DynamicChartRenderer {...(toolResult.result as any)} />
                                </div>
                            ) : (
                                <div>
                                    <div className="mb-2 flex items-center gap-2">
                                        <Activity className="text-muted-foreground" size={14} />
                                        <span className="text-muted-foreground text-xs font-medium">
                                            Output
                                        </span>
                                    </div>
                                    <CodeBlock
                                        className="border-muted/50 rounded-md"
                                        code={JSON.stringify(toolResult.result, null, 2)}
                                        lang="json"
                                        showHeader={false}
                                        variant="secondary"
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

ToolInvocationStep.displayName = "ToolInvocationStep";

// Keep the original component for backward compatibility
export const ToolResultStep = memo(({ toolResult }: ToolResultProps) => {
    return <ToolInvocationStep toolResult={toolResult} />;
});
