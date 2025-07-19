"use client";

import {
    FloatingPortal,
    flip,
    offset,
    shift,
    useFloating,
    useHover,
    useInteractions,
} from "@floating-ui/react";
import * as React from "react";
import { cn } from "../lib/utils";

type HoverCardContextType = {
    open: boolean;
    setOpen: (open: boolean) => void;
    getReferenceProps: () => any;
    getFloatingProps: () => any;
    refs: {
        setReference: (node: HTMLElement | null) => void;
        setFloating: (node: HTMLElement | null) => void;
    };
    floatingStyles: React.CSSProperties;
};

const HoverCardContext = React.createContext<HoverCardContextType | null>(null);

const useHoverCard = () => {
    const context = React.useContext(HoverCardContext);
    if (!context) {
        throw new Error("useHoverCard must be used within a HoverCard");
    }
    return context;
};

type HoverCardProps = {
    openDelay?: number;
    closeDelay?: number;
    children: React.ReactNode;
};

const HoverCard = ({ openDelay = 200, closeDelay = 200, children }: HoverCardProps) => {
    const [open, setOpen] = React.useState(false);

    const { refs, floatingStyles, context } = useFloating({
        open,
        onOpenChange: setOpen,
        middleware: [offset(4), flip(), shift()],
    });

    const hover = useHover(context, {
        delay: { open: openDelay, close: closeDelay },
    });

    const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

    const contextValue = React.useMemo(
        () => ({
            open,
            setOpen,
            getReferenceProps,
            getFloatingProps,
            refs,
            floatingStyles,
        }),
        [open, getReferenceProps, getFloatingProps, refs, floatingStyles],
    );

    return <HoverCardContext.Provider value={contextValue}>{children}</HoverCardContext.Provider>;
};

type HoverCardTriggerProps = React.HTMLAttributes<HTMLSpanElement>;

const HoverCardTrigger = React.forwardRef<HTMLSpanElement, HoverCardTriggerProps>(
    ({ className, ...props }, ref) => {
        const { getReferenceProps, refs } = useHoverCard();

        return (
            <span
                ref={(node) => {
                    refs.setReference(node);
                    if (typeof ref === "function") {
                        ref(node);
                    } else if (ref) {
                        ref.current = node;
                    }
                }}
                {...getReferenceProps()}
                {...props}
                className={cn("inline-block cursor-pointer", className)}
            />
        );
    },
);
HoverCardTrigger.displayName = "HoverCardTrigger";

type HoverCardContentProps = React.HTMLAttributes<HTMLDivElement>;

const HoverCardContent = React.forwardRef<HTMLDivElement, HoverCardContentProps>(
    ({ className, ...props }, ref) => {
        const { open, getFloatingProps, refs, floatingStyles } = useHoverCard();

        if (!open) {
            return null;
        }

        return (
            <FloatingPortal>
                <div
                    ref={(node) => {
                        refs.setFloating(node);
                        if (typeof ref === "function") {
                            ref(node);
                        } else if (ref) {
                            ref.current = node;
                        }
                    }}
                    style={{ ...floatingStyles, zIndex: 999 }}
                    {...getFloatingProps()}
                    className={cn(
                        "bg-background text-card-foreground isolate z-[200] flex max-w-64 flex-col items-start rounded-md border p-4 shadow-md outline-none",
                        "fade-in-0 zoom-in-95 animate-in",
                        className,
                    )}
                    {...props}
                />
            </FloatingPortal>
        );
    },
);
HoverCardContent.displayName = "HoverCardContent";

export { HoverCard, HoverCardContent, HoverCardTrigger };
