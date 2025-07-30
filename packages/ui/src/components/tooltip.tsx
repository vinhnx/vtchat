"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as React from "react";

import { cn } from "../lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

const TooltipBase = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
    React.ElementRef<typeof TooltipPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
    <TooltipPrimitive.Content
        className={cn(
            "fade-in-0 zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 animate-in bg-foreground text-background data-[state=closed]:animate-out z-[99999] overflow-hidden rounded-lg px-3 py-2 text-xs font-medium shadow-xl",
            "origin-[--radix-tooltip-content-transform-origin]",
            className,
        )}
        ref={ref}
        sideOffset={sideOffset}
        collisionPadding={16}
        avoidCollisions={true}
        sticky="always"
        {...props}
    />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export type TTooltip = {
    children: React.ReactNode;
    content: React.ReactNode;
    sideOffset?: number;
    side?: "left" | "right" | "top" | "bottom";
};

const Tooltip = ({ children, content, side, sideOffset }: TTooltip) => {
    return (
        <TooltipBase delayDuration={0}>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
            <TooltipContent
                side={side}
                sideOffset={sideOffset}
                collisionPadding={16}
                avoidCollisions={true}
            >
                {content}
            </TooltipContent>
        </TooltipBase>
    );
};

export { Tooltip, TooltipBase, TooltipContent, TooltipProvider, TooltipTrigger };
