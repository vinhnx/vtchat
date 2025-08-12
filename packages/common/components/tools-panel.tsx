'use client';

import { ToolInvocationStep } from '@repo/common/components';
import { useAppStore } from '@repo/common/store';
import type { ThreadItem } from '@repo/shared/types';
import { Badge, Card, Separator } from '@repo/ui';
import { motion } from 'framer-motion';
import { Activity, CheckCircle, Clock, Settings, Zap } from 'lucide-react';
import { memo, useCallback, useEffect, useMemo } from 'react';

export type ToolsPanelProps = {
    threadItem: ThreadItem;
};

export const ToolsPanel = memo(({ threadItem }: ToolsPanelProps) => {
    const openSideDrawer = useAppStore((state) => state.openSideDrawer);
    const sideDrawer = useAppStore((state) => state.sideDrawer);

    const toolsData = useMemo(() => {
        const calls = Object.entries(threadItem?.toolCalls || {});

        return calls.map(([key, toolCall]) => {
            const toolResult = threadItem?.toolResults?.[key];
            return {
                id: key,
                toolCall,
                toolResult,
                status: toolResult ? 'completed' : 'pending',
            };
        });
    }, [threadItem?.toolCalls, threadItem?.toolResults]);

    const completedCount = toolsData.filter((t) => t.status === 'completed').length;
    const pendingCount = toolsData.filter((t) => t.status === 'pending').length;
    const totalCount = toolsData.length;

    const renderToolsContent = useCallback(
        () => (
            <div className='space-y-4'>
                {/* Summary Header */}
                <div className='bg-muted/30 rounded-lg p-3'>
                    <div className='mb-2 flex items-center justify-between'>
                        <span className='text-foreground text-sm font-medium'>
                            Execution Summary
                        </span>
                        <Badge className='text-xs' variant='outline'>
                            {completedCount}/{totalCount}
                        </Badge>
                    </div>
                    <div className='grid grid-cols-3 gap-2'>
                        <div className='text-center'>
                            <div className='text-muted-foreground text-lg font-medium'>
                                {totalCount}
                            </div>
                            <div className='text-muted-foreground text-xs'>Total</div>
                        </div>
                        <div className='text-center'>
                            <div className='text-muted-foreground text-lg font-medium'>
                                {completedCount}
                            </div>
                            <div className='text-muted-foreground text-xs'>Completed</div>
                        </div>
                        <div className='text-center'>
                            <div className='text-muted-foreground text-lg font-medium'>
                                {pendingCount}
                            </div>
                            <div className='text-muted-foreground text-xs'>Pending</div>
                        </div>
                    </div>
                </div>

                {/* Tools List */}
                <div className='space-y-3'>
                    {toolsData.map((tool, index) => (
                        <motion.div
                            animate={{ opacity: 1, y: 0 }}
                            className='space-y-2'
                            initial={{ opacity: 0, y: 10 }}
                            key={tool.id}
                            transition={{ delay: index * 0.1 }}
                        >
                            {/* Use the enhanced ToolInvocationStep that handles both calls and results */}
                            <ToolInvocationStep
                                toolCall={tool.toolCall}
                                toolResult={tool.toolResult}
                            />
                            {index < toolsData.length - 1 && <Separator className='my-3' />}
                        </motion.div>
                    ))}
                </div>
            </div>
        ),
        [toolsData, completedCount, totalCount, pendingCount],
    );

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
        <Card className='border-muted/50 bg-muted/20 hover:bg-muted/30 w-full cursor-pointer transition-all duration-200'>
            <motion.div
                className='flex w-full flex-row items-center gap-3 p-3'
                onClick={handleOpenDrawer}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
            >
                <div className='bg-muted flex h-8 w-8 items-center justify-center rounded-md'>
                    {pendingCount > 0
                        ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                    duration: 2,
                                    repeat: Number.POSITIVE_INFINITY,
                                    ease: 'linear',
                                }}
                            >
                                <Settings className='text-muted-foreground' size={16} />
                            </motion.div>
                        )
                        : <Zap className='text-muted-foreground' size={16} />}
                </div>

                <div className='flex flex-col gap-1'>
                    <div className='text-foreground text-sm font-medium'>Tools Execution</div>
                    <div className='text-muted-foreground text-xs'>
                        {pendingCount > 0 ? 'Running tools...' : 'All tools completed'}
                    </div>
                </div>

                <div className='flex-1' />

                <div className='flex items-center gap-2'>
                    {pendingCount > 0 && (
                        <Badge
                            className='border-muted-foreground/20 bg-muted/20 text-muted-foreground'
                            variant='outline'
                        >
                            <Clock className='mr-1' size={10} />
                            {pendingCount} pending
                        </Badge>
                    )}
                    {completedCount > 0 && (
                        <Badge
                            className='border-muted-foreground/20 bg-muted/20 text-muted-foreground'
                            variant='outline'
                        >
                            <CheckCircle className='mr-1' size={10} />
                            {completedCount} done
                        </Badge>
                    )}
                    <Badge
                        className='border-muted-foreground/20 bg-muted/30 text-muted-foreground'
                        variant='secondary'
                    >
                        <Activity className='mr-1' size={10} />
                        {totalCount} tools
                    </Badge>
                </div>
            </motion.div>
        </Card>
    );
});

ToolsPanel.displayName = 'ToolsPanel';
