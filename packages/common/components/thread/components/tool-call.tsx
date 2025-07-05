'use client';

import { CodeBlock, ToolIcon } from '@repo/common/components';
import { isMathTool } from '@repo/common/constants/math-tools';
import type { ToolCall as ToolCallType } from '@repo/shared/types';
import { Badge, Card, cn } from '@repo/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, FileText, Play, Settings, Sigma } from 'lucide-react';
import { memo, useCallback, useState } from 'react';

export type ToolCallProps = {
    toolCall: ToolCallType;
};

export const ToolCallStep = memo(({ toolCall }: ToolCallProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleOpen = useCallback(() => setIsOpen((prev) => !prev), []);

    // Check if this is a math calculator tool
    const isToolMathTool = isMathTool(toolCall.toolName);

    // Check if this is a document processing tool
    const isDocumentTool =
        toolCall.toolName &&
        (toolCall.toolName.includes('document') ||
            toolCall.toolName.includes('file') ||
            toolCall.toolName.includes('pdf') ||
            toolCall.toolName.includes('read'));

    const getToolIcon = () => {
        if (isToolMathTool) return <Sigma className="text-green-600" size={16} />;
        if (isDocumentTool) return <FileText className="text-blue-600" size={16} />;
        return <ToolIcon />;
    };

    const getToolBadge = () => {
        return 'border-muted-foreground/10 bg-muted/20 text-muted-foreground';
    };

    const getToolLabel = () => {
        if (isToolMathTool) return toolCall.toolName;
        if (isDocumentTool) return toolCall.toolName;
        return toolCall.toolName;
    };

    return (
        <Card className="border-muted/50 bg-muted/30 hover:bg-muted/40 w-full transition-all duration-200">
            <motion.div
                className="flex w-full cursor-pointer flex-row items-center justify-between gap-3 p-3"
                onClick={toggleOpen}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
            >
                <div className="flex flex-row items-center gap-3">
                    <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-md">
                        {getToolIcon()}
                    </div>
                    <div className="flex flex-col gap-1">
                        <Badge
                            className={cn(
                                'border-muted-foreground/20 bg-background/80 text-muted-foreground text-xs font-medium',
                                getToolBadge()
                            )}
                            variant="secondary"
                        >
                            <Play className="mr-1" size={10} />
                            {getToolLabel()}
                        </Badge>
                        <span className="text-muted-foreground text-xs">Tool execution</span>
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
                        animate={{ height: 'auto', opacity: 1 }}
                        className="overflow-hidden"
                        exit={{ height: 0, opacity: 0 }}
                        initial={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="border-muted/50 border-t p-3 pt-3">
                            <div className="mb-2 flex items-center gap-2">
                                <Settings className="text-muted-foreground" size={14} />
                                <span className="text-muted-foreground text-xs font-medium">
                                    Parameters
                                </span>
                            </div>
                            <CodeBlock
                                className="border-muted/50 rounded-md"
                                code={JSON.stringify(toolCall.args, null, 2)}
                                lang="json"
                                showHeader={false}
                                variant="secondary"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
});

ToolCallStep.displayName = 'ToolCallStep';
