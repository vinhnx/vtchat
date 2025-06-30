import { CodeBlock, ToolIcon } from '@repo/common/components';
import { isMathTool } from '@repo/common/constants/math-tools';
import { ToolCall as ToolCallType } from '@repo/shared/types';
import { Badge, cn, Card } from '@repo/ui';
import { ChevronDown, FileText, Sigma, Play, Settings } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type ToolCallProps = {
    toolCall: ToolCallType;
};

export const ToolCallStep = memo(({ toolCall }: ToolCallProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleOpen = useCallback(() => setIsOpen(prev => !prev), []);

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
        if (isToolMathTool) return <Sigma size={16} className="text-green-600" />;
        if (isDocumentTool) return <FileText size={16} className="text-blue-600" />;
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
        <Card className="w-full border-muted/50 bg-muted/30 transition-all duration-200 hover:bg-muted/40">
            <motion.div
                className="flex w-full cursor-pointer flex-row items-center justify-between gap-3 p-3"
                onClick={toggleOpen}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
            >
                <div className="flex flex-row items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                        {getToolIcon()}
                    </div>
                    <div className="flex flex-col gap-1">
                        <Badge 
                            variant="secondary" 
                            className={cn(
                                "border-muted-foreground/20 bg-background/80 text-muted-foreground text-xs font-medium",
                                getToolBadge()
                            )}
                        >
                            <Play size={10} className="mr-1" />
                            {getToolLabel()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">Tool execution</span>
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
                            <div className="flex items-center gap-2 mb-2">
                                <Settings size={14} className="text-muted-foreground" />
                                <span className="text-xs font-medium text-muted-foreground">Parameters</span>
                            </div>
                            <CodeBlock
                                variant="secondary"
                                showHeader={false}
                                lang="json"
                                className="rounded-md border-muted/50"
                                code={JSON.stringify(toolCall.args, null, 2)}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
});

ToolCallStep.displayName = 'ToolCallStep';
