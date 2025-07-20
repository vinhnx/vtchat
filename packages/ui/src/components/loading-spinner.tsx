"use client";

import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../lib/utils";

// Loading spinner variants
const spinnerVariants = cva("animate-spin rounded-full border-current border-solid", {
    variants: {
        size: {
            sm: "h-4 w-4 border-2",
            md: "h-6 w-6 border-2",
            lg: "h-8 w-8 border-[3px]",
            xl: "h-12 w-12 border-4",
            "2xl": "h-16 w-16 border-4",
        },
        variant: {
            default: "border-border border-t-foreground",
            primary: "border-primary/20 border-t-primary",
            secondary: "border-secondary/20 border-t-secondary",
            destructive: "border-destructive/20 border-t-destructive",
            ghost: "border-muted border-t-muted-foreground",
            outline: "border-border border-t-foreground",
        },
    },
    defaultVariants: {
        size: "md",
        variant: "default",
    },
});

export interface LoadingSpinnerProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof spinnerVariants> {
    text?: string;
    centered?: boolean;
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
    ({ className, size, variant, text, centered = false, ...props }, ref) => {
        const content = (
            <>
                <div
                    className={cn(spinnerVariants({ size, variant, className }))}
                    {...props}
                    ref={ref}
                />
                {text && (
                    <span className="text-muted-foreground ml-2 animate-pulse text-sm">{text}</span>
                )}
            </>
        );

        if (centered) {
            return (
                <div className="flex min-h-[100px] w-full items-center justify-center">
                    <div className="flex items-center">{content}</div>
                </div>
            );
        }

        return <div className="flex items-center">{content}</div>;
    },
);

LoadingSpinner.displayName = "LoadingSpinner";

// Pulse loading component for skeleton states
export interface PulseLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
    lines?: number;
    height?: "sm" | "md" | "lg";
}

const PulseLoader = React.forwardRef<HTMLDivElement, PulseLoaderProps>(
    ({ className, lines = 3, height = "md", ...props }, ref) => {
        const heights = {
            sm: "h-3",
            md: "h-4",
            lg: "h-6",
        };

        return (
            <div className={cn("space-y-2", className)} ref={ref} {...props}>
                {Array.from({ length: lines }).map((_, i) => (
                    <div
                        className={cn(
                            "bg-muted animate-pulse rounded-sm",
                            heights[height],
                            i === lines - 1 ? "w-3/4" : "w-full",
                        )}
                        key={i}
                        style={{
                            animationDelay: `${i * 0.1}s`,
                        }}
                    />
                ))}
            </div>
        );
    },
);

PulseLoader.displayName = "PulseLoader";

// Dots loading animation
export interface DotsLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: "sm" | "md" | "lg";
    color?: "default" | "primary" | "secondary";
}

const DotsLoader = React.forwardRef<HTMLDivElement, DotsLoaderProps>(
    ({ className, size = "md", color = "default", ...props }, ref) => {
        const sizeMap = {
            sm: "w-1 h-1",
            md: "w-2 h-2",
            lg: "w-3 h-3",
        };

        const colorMap = {
            default: "bg-foreground",
            primary: "bg-primary",
            secondary: "bg-secondary",
        };

        return (
            <div className={cn("flex items-center space-x-1", className)} ref={ref} {...props}>
                {[0, 1, 2].map((i) => (
                    <div
                        className={cn(
                            "animate-bounce rounded-full",
                            sizeMap[size],
                            colorMap[color],
                        )}
                        key={i}
                        style={{
                            animationDelay: `${i * 0.1}s`,
                            animationDuration: "0.6s",
                        }}
                    />
                ))}
            </div>
        );
    },
);

DotsLoader.displayName = "DotsLoader";

// Premium skeleton loader with shimmer effect
export interface PremiumSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "roundedSm" | "circle";
    shimmer?: boolean;
    lines?: number;
    height?: number | string;
    width?: number | string;
}

const PremiumSkeleton = React.forwardRef<HTMLDivElement, PremiumSkeletonProps>(
    (
        {
            className,
            variant = "default",
            shimmer = true,
            lines = 1,
            height = 20,
            width = "100%",
            ...props
        },
        ref,
    ) => {
        const variants = {
            default: "rounded-md",
            roundedSm: "rounded-lg",
            circle: "rounded-full",
        };

        const shimmerClass = shimmer
            ? "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent"
            : "";

        if (lines === 1) {
            return (
                <div
                    className={cn(
                        "bg-muted animate-pulse",
                        variants[variant],
                        shimmerClass,
                        className,
                    )}
                    ref={ref}
                    style={{ height, width }}
                    {...props}
                />
            );
        }

        return (
            <div className={cn("space-y-2", className)} ref={ref} {...props}>
                {Array.from({ length: lines }).map((_, i) => (
                    <div
                        className={cn(
                            "bg-muted animate-pulse",
                            variants[variant],
                            shimmerClass,
                            i === lines - 1 ? "w-3/4" : "w-full",
                        )}
                        key={i}
                        style={{
                            height,
                            animationDelay: `${i * 0.1}s`,
                        }}
                    />
                ))}
            </div>
        );
    },
);
PremiumSkeleton.displayName = "PremiumSkeleton";

// Modern circular progress with gradient
export interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    progress?: number; // 0-100
    size?: number;
    strokeWidth?: number;
    showPercentage?: boolean;
    gradient?: boolean;
}

const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
    (
        {
            className,
            progress = 0,
            size = 40,
            strokeWidth = 4,
            showPercentage = false,
            gradient = false,
            ...props
        },
        ref,
    ) => {
        const radius = (size - strokeWidth) / 2;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (progress / 100) * circumference;
        const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

        return (
            <div
                className={cn("relative inline-flex items-center justify-center", className)}
                ref={ref}
                style={{ width: size, height: size }}
                {...props}
            >
                <svg className="-rotate-90 transform" height={size} width={size}>
                    {gradient && (
                        <defs>
                            <linearGradient id={gradientId} x1="0%" x2="100%" y1="0%" y2="0%">
                                <stop offset="0%" stopColor="rgb(59, 130, 246)" />
                                <stop offset="50%" stopColor="rgb(147, 51, 234)" />
                                <stop offset="100%" stopColor="rgb(219, 39, 119)" />
                            </linearGradient>
                        </defs>
                    )}
                    {/* Background circle */}
                    <circle
                        className="text-muted/30"
                        cx={size / 2}
                        cy={size / 2}
                        fill="none"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                    />
                    {/* Progress circle */}
                    <circle
                        className={cn(
                            "transition-all duration-500 ease-out",
                            gradient ? "" : "text-primary",
                        )}
                        cx={size / 2}
                        cy={size / 2}
                        fill="none"
                        r={radius}
                        stroke={gradient ? `url(#${gradientId})` : "currentColor"}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        strokeWidth={strokeWidth}
                        style={{
                            filter: gradient
                                ? "drop-shadow-sm(0 0 6px rgba(59, 130, 246, 0.3))"
                                : undefined,
                        }}
                    />
                </svg>
                {showPercentage && (
                    <span className="absolute text-xs font-medium tabular-nums">
                        {Math.round(progress)}%
                    </span>
                )}
            </div>
        );
    },
);

CircularProgress.displayName = "CircularProgress";

export {
    LoadingSpinner,
    PulseLoader,
    DotsLoader,
    CircularProgress,
    PremiumSkeleton,
    spinnerVariants,
};
