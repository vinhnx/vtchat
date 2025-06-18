import { CodeBlock, ToolIcon } from '@repo/common/components';
import { isMathTool } from '@repo/common/constants/math-tools';
import { ToolCall as ToolCallType } from '@repo/shared/types';
import { Badge, cn } from '@repo/ui';
import { ChevronDown, FileText, Sigma } from 'lucide-react';
import { memo, useCallback, useState } from 'react';

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
        if (isToolMathTool) return 'bg-green-100 text-green-800 border-green-300';
        if (isDocumentTool) return 'bg-blue-100 text-blue-800 border-blue-300';
        return '';
    };

    const getToolLabel = () => {
        if (isToolMathTool) return `🧮 ${toolCall.toolName}`;
        if (isDocumentTool) return `📄 ${toolCall.toolName}`;
        return toolCall.toolName;
    };

    return (
        <div className="flex w-full flex-col items-start overflow-hidden">
            <div
                className="flex w-full cursor-pointer flex-row items-center justify-between gap-2.5 pb-2 pt-2"
                onClick={toggleOpen}
            >
                <div className="flex flex-row items-center gap-2.5">
                    {getToolIcon()}
                    <Badge className={getToolBadge()}>{getToolLabel()}</Badge>
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
                    <CodeBlock
                        variant="secondary"
                        showHeader={false}
                        lang="json"
                        className="my-2"
                        code={JSON.stringify(toolCall.args, null, 2)}
                    />
                </div>
            )}
        </div>
    );
});

ToolCallStep.displayName = 'ToolCallStep';
