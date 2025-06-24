import { ToolCallStep, ToolResultStep } from '@repo/common/components';
import { useAppStore } from '@repo/common/store';
import { ThreadItem } from '@repo/shared/types';
import { Badge, Card, Separator } from '@repo/ui';
import { Activity, Settings, Zap, Clock, CheckCircle } from 'lucide-react';
import { memo, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

export type ToolsPanelProps = {
    threadItem: ThreadItem;
};

export const ToolsPanel = memo(({ threadItem }: ToolsPanelProps) => {
    const openSideDrawer = useAppStore(state => state.openSideDrawer);
    const sideDrawer = useAppStore(state => state.sideDrawer);

    const toolsData = useMemo(() => {
        const calls = Object.entries(threadItem?.toolCalls || {});
        
        return calls.map(([key, toolCall]) => {
            const toolResult = threadItem?.toolResults?.[key];
            return {
                id: key,
                toolCall,
                toolResult,
                status: toolResult ? 'completed' : 'pending'
            };
        });
    }, [threadItem?.toolCalls, threadItem?.toolResults]);

    const completedCount = toolsData.filter(t => t.status === 'completed').length;
    const pendingCount = toolsData.filter(t => t.status === 'pending').length;
    const totalCount = toolsData.length;

    const renderToolsContent = useCallback(() => (
        <div className="space-y-4">
            {/* Summary Header */}
            <div className="rounded-lg bg-muted/30 p-3">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Execution Summary</span>
                    <Badge variant="outline" className="text-xs">
                        {completedCount}/{totalCount}
                    </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                        <div className="text-lg font-medium text-muted-foreground">{totalCount}</div>
                        <div className="text-xs text-muted-foreground">Total</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-medium text-muted-foreground">{completedCount}</div>
                        <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-medium text-muted-foreground">{pendingCount}</div>
                        <div className="text-xs text-muted-foreground">Pending</div>
                    </div>
                </div>
            </div>

            {/* Tools List */}
            <div className="space-y-3">
                {toolsData.map((tool, index) => (
                    <motion.div
                        key={tool.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="space-y-2"
                    >
                        <ToolCallStep toolCall={tool.toolCall} />
                        {tool.toolResult && (
                            <ToolResultStep toolResult={tool.toolResult} />
                        )}
                        {index < toolsData.length - 1 && (
                            <Separator className="my-3" />
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    ), [toolsData, completedCount, totalCount, pendingCount]);

    const updateDrawerContent = useCallback(() => {
        openSideDrawer({
            title: `Tools Execution ${pendingCount > 0 ? '(Running...)' : '(Complete)'}`,
            badge: totalCount,
            renderContent: renderToolsContent,
        });
    }, [openSideDrawer, pendingCount, totalCount, renderToolsContent]);

    const handleOpenDrawer = useCallback(() => {
        openSideDrawer({
            title: 'Tools Execution',
            badge: totalCount,
            renderContent: renderToolsContent,
        });
    }, [openSideDrawer, totalCount, renderToolsContent]);

    // Auto-expand when tools are executing
    useEffect(() => {
        if (pendingCount > 0 && !sideDrawer.open) {
            // Automatically open the tools panel when tools are executing
            handleOpenDrawer();
        }
    }, [pendingCount, sideDrawer.open, handleOpenDrawer]);

    // Auto-update the drawer content when tool status changes
    useEffect(() => {
        if (sideDrawer.open && totalCount > 0) {
            // Update the drawer content in real-time
            updateDrawerContent();
        }
    }, [toolsData, sideDrawer.open, totalCount, updateDrawerContent]);

    if (totalCount === 0) {
        return null;
    }

    return (
        <Card className="w-full border-muted/50 bg-muted/20 transition-all duration-200 hover:bg-muted/30 cursor-pointer">
            <motion.div
                className="flex w-full flex-row items-center gap-3 p-3"
                onClick={handleOpenDrawer}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
            >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                    {pendingCount > 0 ? (
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                            <Settings size={16} className="text-muted-foreground" />
                        </motion.div>
                    ) : (
                        <Zap size={16} className="text-muted-foreground" />
                    )}
                </div>
                
                <div className="flex flex-col gap-1">
                    <div className="text-sm font-medium text-foreground">
                        Tools Execution
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {pendingCount > 0 ? 'Running tools...' : 'All tools completed'}
                    </div>
                </div>
                
                <div className="flex-1" />
                
                <div className="flex items-center gap-2">
                    {pendingCount > 0 && (
                        <Badge variant="outline" className="bg-muted/20 text-muted-foreground border-muted-foreground/20">
                            <Clock size={10} className="mr-1" />
                            {pendingCount} pending
                        </Badge>
                    )}
                    {completedCount > 0 && (
                        <Badge variant="outline" className="bg-muted/20 text-muted-foreground border-muted-foreground/20">
                            <CheckCircle size={10} className="mr-1" />
                            {completedCount} done
                        </Badge>
                    )}
                    <Badge 
                        variant="secondary" 
                        className="bg-muted/30 text-muted-foreground border-muted-foreground/20"
                    >
                        <Activity size={10} className="mr-1" />
                        {totalCount} tools
                    </Badge>
                </div>
            </motion.div>
        </Card>
    );
});

ToolsPanel.displayName = 'ToolsPanel';
