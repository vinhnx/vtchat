import * as AvatarPrimitive from "@radix-ui/react-avatar";
import * as React from "react";

import { cn } from "../lib/utils";

const Avatar = React.forwardRef<
    React.ElementRef<typeof AvatarPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
    <AvatarPrimitive.Root
        ref={ref}
        className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
        {...props}
    />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
    React.ElementRef<typeof AvatarPrimitive.Image>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
    <AvatarPrimitive.Image
        ref={ref}
        className={cn("aspect-square h-full w-full", className)}
        {...props}
    />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
    React.ElementRef<typeof AvatarPrimitive.Fallback>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
    <AvatarPrimitive.Fallback
        ref={ref}
        className={cn(
            "bg-muted flex h-full w-full items-center justify-center rounded-full",
            className,
        )}
        {...props}
    />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

// Unified Avatar Component with enhanced features
export type UnifiedAvatarProps = {
    /** Display name for fallback and alt text */
    name: string;
    /** Avatar image source URL */
    src?: string | null | undefined;
    /** Size variant */
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    /** Additional CSS classes */
    className?: string;
    /** Image alt text (defaults to name) */
    alt?: string;
    /** Referrer policy for external images */
    referrerPolicy?: React.ImgHTMLAttributes<HTMLImageElement>["referrerPolicy"];
    /** Error handler for failed image loads */
    onImageError?: () => void;
    /** Custom fallback content (overrides default initials) */
    fallback?: React.ReactNode;
};

const UnifiedAvatar = React.forwardRef<
    React.ElementRef<typeof AvatarPrimitive.Root>,
    UnifiedAvatarProps
>(
    (
        {
            name,
            src,
            size = "md",
            className,
            alt,
            referrerPolicy = "no-referrer-when-downgrade",
            onImageError,
            fallback,
            ...props
        },
        ref,
    ) => {
        const sizeClasses = {
            xs: "h-6 w-6 min-w-6",
            sm: "h-7 w-7 min-w-7",
            md: "h-8 w-8 min-w-8",
            lg: "h-12 w-12 min-w-12",
            xl: "h-16 w-16 min-w-16",
        };

        const textSizeClasses = {
            xs: "text-xs",
            sm: "text-xs",
            md: "text-sm",
            lg: "text-base",
            xl: "text-lg",
        };

        const getInitials = (name: string): string => {
            if (!name) return "?";

            // Handle email addresses
            if (name.includes("@")) {
                return name.charAt(0).toUpperCase();
            }

            // Handle full names - take first letter of first two words
            const words = name.trim().split(/\s+/);
            if (words.length >= 2) {
                return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
            }

            return name.charAt(0).toUpperCase();
        };

        return (
            <Avatar ref={ref} className={cn(sizeClasses[size], className)} {...props}>
                {src && (
                    <AvatarImage
                        src={src}
                        alt={alt || name}
                        referrerPolicy={referrerPolicy}
                        onError={onImageError}
                    />
                )}
                <AvatarFallback
                    className={cn(
                        "bg-muted text-muted-foreground font-medium",
                        textSizeClasses[size],
                    )}
                >
                    {fallback || getInitials(name)}
                </AvatarFallback>
            </Avatar>
        );
    },
);
UnifiedAvatar.displayName = "UnifiedAvatar";

// Legacy component for backward compatibility
export type TAvatar = {
    name: string;
    src?: string;
    size?: "sm" | "md" | "lg";
    className?: string;
};

export const AvatarLegacy = ({ name, src, size = "md", className }: TAvatar) => {
    const sizeClasses = {
        sm: "h-7 w-7 min-w-7",
        md: "h-8 w-8 min-w-8",
        lg: "h-12 w-12 min-w-12",
    };

    return (
        <Avatar className={cn(sizeClasses[size], className)}>
            {src && <AvatarImage alt={name} src={src} />}
            <AvatarFallback
                className={cn(
                    "bg-secondary text-secondary-foreground font-bold uppercase",
                    size === "sm" && "text-xs",
                    size === "md" && "text-sm",
                    size === "lg" && "text-base",
                )}
            >
                {name?.[0] || "?"}
            </AvatarFallback>
        </Avatar>
    );
};

export { Avatar, AvatarFallback, AvatarImage, UnifiedAvatar };
