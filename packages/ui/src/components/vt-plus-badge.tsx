"use client";

import * as React from "react";
import { cn } from "../lib/utils";
import { Badge } from "./badge";

interface VTPlusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: "sm" | "md" | "lg";
    variant?: "default" | "minimal";
}

const VTPlusBadge = React.forwardRef<HTMLDivElement, VTPlusBadgeProps>(
    ({ className, size = "md", variant = "default", ...props }, ref) => {
        const sizeClasses = {
            sm: "px-1.5 py-0.5 text-[10px]",
            md: "px-3 py-1.5 text-xs",
            lg: "px-4 py-2 text-sm",
        };

        const variantClasses = {
            default: "vt-plus-glass text-[#D99A4E] border-[#D99A4E]/30 shadow-lg",
            minimal: "vt-plus-glass text-[#D99A4E] border-[#D99A4E]/20 shadow-xs",
        };

        return (
            <Badge
                className={cn(
                    "flex items-center gap-1.5 rounded-full border font-bold transition-all duration-300",
                    sizeClasses[size],
                    variantClasses[variant],
                    className,
                )}
                ref={ref}
                variant="secondary"
                {...props}
            >
                VT+
            </Badge>
        );
    },
);

VTPlusBadge.displayName = "VTPlusBadge";

export { VTPlusBadge, type VTPlusBadgeProps };
