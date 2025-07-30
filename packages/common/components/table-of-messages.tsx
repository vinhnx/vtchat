"use client";

import { useChatStore } from "@repo/common/store";
import { Button, cn, Popover, PopoverContent, PopoverTrigger } from "@repo/ui";
import { AnimatePresence, motion } from "framer-motion";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";

export const TableOfMessages = () => {
    const { threadId } = useParams();
    const currentThreadId = threadId?.toString() ?? "";
    const [isHovering, setIsHovering] = useState(false);

    // Only call getPreviousThreadItems if we have a valid threadId
    const previousThreadItems = useChatStore(
        useShallow((state) =>
            currentThreadId ? state.getPreviousThreadItems(currentThreadId) : [],
        ),
    );
    const currentThreadItem = useChatStore(
        useShallow((state) =>
            currentThreadId ? state.getCurrentThreadItem(currentThreadId) : null,
        ),
    );
    const activeItemId = useChatStore((state) => state.activeThreadItemView);
    const allItems = [...previousThreadItems, currentThreadItem].filter(Boolean);

    if (allItems?.length <= 1) {
        return null;
    }

    return (
        <div
            className="absolute left-4 top-1/2 z-[10] flex -translate-y-1/2 flex-col items-end gap-1.5"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <Popover onOpenChange={setIsHovering} open={isHovering}>
                <PopoverTrigger asChild>
                    <div className="flex h-12 w-8 flex-col items-start justify-center gap-1.5">
                        {allItems.map((item, index) => {
                            const isActive = activeItemId === item?.id;
                            return (
                                <div
                                    className={cn(
                                        "h-[1px] w-4 cursor-pointer rounded-full transition-all duration-200",
                                        isActive ? "bg-brand w-3" : "bg-foreground/20 w-2",
                                    )}
                                    key={index}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (item?.id) {
                                            const element = document.getElementById(
                                                `thread-item-${item.id}`,
                                            );
                                            element?.scrollIntoView({ behavior: "smooth" });
                                        }
                                    }}
                                />
                            );
                        })}
                    </div>
                </PopoverTrigger>
                <AnimatePresence>
                    {isHovering && (
                        <PopoverContent
                            align="center"
                            asChild
                            className="relative z-[10] max-w-[260px] p-0"
                            side="right"
                            sideOffset={-40}
                        >
                            <motion.div
                                animate={{ opacity: 1, x: 0 }}
                                className="w-full rounded-md bg-white p-1 shadow-2xl"
                                exit={{ opacity: 0, x: -10 }}
                                initial={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                            >
                                <div className="no-scrollbar max-h-60 touch-pan-y overflow-y-auto overscroll-contain">
                                    {allItems.map((item, index) => {
                                        const isActive = activeItemId === item?.id;
                                        return (
                                            <Button
                                                className={cn(
                                                    "text-muted-foreground/50 hover:text-foreground group line-clamp-2 h-auto min-h-7 w-full max-w-full cursor-pointer justify-end overflow-hidden whitespace-normal py-1 text-left text-sm",
                                                    isActive && "text-foreground",
                                                )}
                                                key={index}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (item?.id) {
                                                        const element = document.getElementById(
                                                            `thread-item-${item.id}`,
                                                        );
                                                        element?.scrollIntoView({
                                                            behavior: "instant",
                                                        });
                                                    }
                                                }}
                                                variant="ghost"
                                            >
                                                {item?.query}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        </PopoverContent>
                    )}
                </AnimatePresence>
            </Popover>
        </div>
    );
};
