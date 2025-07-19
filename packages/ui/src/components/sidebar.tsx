"use client";

import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../lib/utils";

const _SIDEBAR_COOKIE_NAME = "sidebar:state";
const _SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const _SIDEBAR_KEYBOARD_SHORTCUT = "b";

type SidebarContext = {
    state: "open" | "closed";
    open: boolean;
    setOpen: (open: boolean) => void;
    openMobile: boolean;
    setOpenMobile: (open: boolean) => void;
    isMobile: boolean;
    toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContext | null>(null);

function useSidebar() {
    const context = React.useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider.");
    }

    return context;
}

const SidebarProvider = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div"> & {
        defaultOpen?: boolean;
        open?: boolean;
        onOpenChange?: (open: boolean) => void;
    }
>(
    (
        {
            defaultOpen = true,
            open: openProp,
            onOpenChange: setOpenProp,
            className,
            style,
            children,
            ...props
        },
        ref,
    ) => {
        const [_open, _setOpen] = React.useState(defaultOpen);
        const open = openProp ?? _open;
        const setOpen = React.useCallback(
            (value: boolean | ((value: boolean) => boolean)) => {
                const openState = typeof value === "function" ? value(open) : value;
                if (setOpenProp) {
                    setOpenProp(openState);
                } else {
                    _setOpen(openState);
                }
            },
            [setOpenProp, open],
        );

        const [openMobile, setOpenMobile] = React.useState(false);

        const isMobile = false; // Simplified for this implementation

        const toggleSidebar = React.useCallback(() => {
            return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
        }, [setOpen]);

        const state = open ? "open" : "closed";

        const contextValue = React.useMemo<SidebarContext>(
            () => ({
                state,
                open,
                setOpen,
                isMobile,
                openMobile,
                setOpenMobile,
                toggleSidebar,
            }),
            [state, open, setOpen, openMobile, toggleSidebar],
        );

        return (
            <SidebarContext.Provider value={contextValue}>
                <div
                    style={
                        {
                            "--sidebar-width": SIDEBAR_WIDTH,
                            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                            "--sidebar-width-mobile": SIDEBAR_WIDTH_MOBILE,
                            ...style,
                        } as React.CSSProperties
                    }
                    className={cn(
                        "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar",
                        className,
                    )}
                    ref={ref}
                    {...props}
                >
                    {children}
                </div>
            </SidebarContext.Provider>
        );
    },
);
SidebarProvider.displayName = "SidebarProvider";

const Sidebar = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div"> & {
        side?: "left" | "right";
        variant?: "sidebar" | "floating" | "inset";
        collapsible?: "offcanvas" | "icon" | "none";
    }
>(
    (
        {
            side = "left",
            variant = "sidebar",
            collapsible = "offcanvas",
            className,
            children,
            ...props
        },
        ref,
    ) => {
        const { isMobile, state, openMobile } = useSidebar();

        if (collapsible === "none") {
            return (
                <div
                    className={cn(
                        "flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground",
                        className,
                    )}
                    ref={ref}
                    {...props}
                >
                    {children}
                </div>
            );
        }

        if (isMobile) {
            return (
                <div
                    className={cn("group peer", className)}
                    data-state={openMobile ? "open" : "closed"}
                    data-collapsible={state === "closed" ? collapsible : ""}
                    data-variant={variant}
                    data-side={side}
                >
                    {/* Mobile implementation would go here */}
                    {children}
                </div>
            );
        }

        return (
            <div
                ref={ref}
                className={cn(
                    "group peer hidden md:block",
                    "text-sidebar-foreground",
                    state === "open" &&
                        "w-[--sidebar-width] transition-[width] duration-200 ease-linear",
                    state === "closed" &&
                        collapsible === "icon" &&
                        "w-[--sidebar-width-icon] transition-[width] duration-200 ease-linear",
                    variant === "floating" && "p-2",
                    variant === "inset" &&
                        "peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm",
                    className,
                )}
                data-state={state}
                data-collapsible={state === "closed" ? collapsible : ""}
                data-variant={variant}
                data-side={side}
                {...props}
            >
                <div className="flex h-full w-full flex-col bg-sidebar">{children}</div>
            </div>
        );
    },
);
Sidebar.displayName = "Sidebar";

const SidebarTrigger = React.forwardRef<React.ElementRef<"button">, React.ComponentProps<"button">>(
    ({ className, onClick, ...props }, ref) => {
        const { toggleSidebar } = useSidebar();

        return (
            <button
                ref={ref}
                data-sidebar="trigger"
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring-3 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    "h-7 w-7",
                    "[&>svg]:size-4",
                    className,
                )}
                onClick={(event) => {
                    onClick?.(event);
                    toggleSidebar();
                }}
                {...props}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <path d="M9 3v18" />
                </svg>
                <span className="sr-only">Toggle Sidebar</span>
            </button>
        );
    },
);
SidebarTrigger.displayName = "SidebarTrigger";

const SidebarInset = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
    ({ className, ...props }, ref) => {
        return (
            <main
                ref={ref}
                className={cn(
                    "relative flex min-h-svh flex-1 flex-col bg-background",
                    "peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm",
                    className,
                )}
                {...props}
            />
        );
    },
);
SidebarInset.displayName = "SidebarInset";

const SidebarInput = React.forwardRef<React.ElementRef<"input">, React.ComponentProps<"input">>(
    ({ className, ...props }, ref) => {
        return (
            <input
                ref={ref}
                data-sidebar="input"
                className={cn(
                    "flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-foreground file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring-3 disabled:cursor-not-allowed disabled:opacity-50",
                    className,
                )}
                {...props}
            />
        );
    },
);
SidebarInput.displayName = "SidebarInput";

const SidebarHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                data-sidebar="header"
                className={cn("flex flex-col gap-2 p-2", className)}
                {...props}
            />
        );
    },
);
SidebarHeader.displayName = "SidebarHeader";

const SidebarFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                data-sidebar="footer"
                className={cn("flex flex-col gap-2 p-2", className)}
                {...props}
            />
        );
    },
);
SidebarFooter.displayName = "SidebarFooter";

const SidebarSeparator = React.forwardRef<React.ElementRef<"div">, React.ComponentProps<"div">>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                data-sidebar="separator"
                className={cn("mx-2 w-auto h-px bg-sidebar-border", className)}
                {...props}
            />
        );
    },
);
SidebarSeparator.displayName = "SidebarSeparator";

const SidebarContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                data-sidebar="content"
                className={cn(
                    "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
                    className,
                )}
                {...props}
            />
        );
    },
);
SidebarContent.displayName = "SidebarContent";

const SidebarGroup = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                data-sidebar="group"
                className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
                {...props}
            />
        );
    },
);
SidebarGroup.displayName = "SidebarGroup";

const SidebarGroupLabel = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div"> & {
        asChild?: boolean;
    }
>(({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : "div";

    if (asChild) {
        return props.children;
    }

    return (
        <Comp
            ref={ref}
            data-sidebar="group-label"
            className={cn(
                "duration-200 flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-hidden ring-sidebar-ring-3 transition-[margin,opa] ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
                "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
                className,
            )}
            {...props}
        />
    );
});
SidebarGroupLabel.displayName = "SidebarGroupLabel";

const SidebarGroupAction = React.forwardRef<
    React.ElementRef<"button">,
    React.ComponentProps<"button"> & {
        asChild?: boolean;
    }
>(({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : "button";

    if (asChild) {
        return props.children;
    }

    return (
        <Comp
            ref={ref}
            data-sidebar="group-action"
            className={cn(
                "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-hidden ring-sidebar-ring-3 transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
                // Increases the hit area of the button on mobile.
                "after:absolute after:-inset-2 after:md:hidden",
                "group-data-[collapsible=icon]:hidden",
                className,
            )}
            {...props}
        />
    );
});
SidebarGroupAction.displayName = "SidebarGroupAction";

const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                data-sidebar="group-content"
                className={cn("w-full text-sm", className)}
                {...props}
            />
        );
    },
);
SidebarGroupContent.displayName = "SidebarGroupContent";

const SidebarMenu = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                data-sidebar="menu"
                className={cn("flex w-full min-w-0 flex-col gap-1", className)}
                {...props}
            />
        );
    },
);
SidebarMenu.displayName = "SidebarMenu";

const SidebarMenuItem = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                data-sidebar="menu-item"
                className={cn(
                    "group/menu-item relative flex w-full min-w-0 items-center",
                    className,
                )}
                {...props}
            />
        );
    },
);
SidebarMenuItem.displayName = "SidebarMenuItem";

const sidebarMenuButtonVariants = cva(
    "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring-3 transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
    {
        variants: {
            variant: {
                default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                outline:
                    "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
            },
            size: {
                default: "h-8 text-sm",
                sm: "h-7 text-xs",
                lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
);

const SidebarMenuButton = React.forwardRef<
    React.ElementRef<"button">,
    React.ComponentProps<"button"> & {
        asChild?: boolean;
        isActive?: boolean;
        tooltip?: string | React.ComponentProps<any>;
    } & VariantProps<typeof sidebarMenuButtonVariants>
>(
    (
        {
            asChild = false,
            isActive = false,
            variant = "default",
            size = "default",
            tooltip: _tooltip,
            className,
            ...props
        },
        ref,
    ) => {
        const Comp = asChild ? React.Fragment : "button";

        if (asChild) {
            return props.children;
        }

        return (
            <Comp
                ref={ref}
                data-sidebar="menu-button"
                data-size={size}
                data-active={isActive}
                className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
                {...props}
            />
        );
    },
);
SidebarMenuButton.displayName = "SidebarMenuButton";

const SidebarMenuAction = React.forwardRef<
    React.ElementRef<"button">,
    React.ComponentProps<"button"> & {
        asChild?: boolean;
        showOnHover?: boolean;
    }
>(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : "button";

    if (asChild) {
        return props.children;
    }

    return (
        <Comp
            ref={ref}
            data-sidebar="menu-action"
            className={cn(
                "absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-hidden ring-sidebar-ring-3 transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0",
                // Increases the hit area of the button on mobile.
                "after:absolute after:-inset-2 after:md:hidden",
                "peer-data-[size=sm]/menu-button:top-1",
                "peer-data-[size=default]/menu-button:top-1.5",
                "peer-data-[size=lg]/menu-button:top-2.5",
                "group-data-[collapsible=icon]:hidden",
                showOnHover &&
                    "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0",
                className,
            )}
            {...props}
        />
    );
});
SidebarMenuAction.displayName = "SidebarMenuAction";

const SidebarMenuBadge = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                data-sidebar="menu-badge"
                className={cn(
                    "absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground select-none pointer-events-none",
                    "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
                    "peer-data-[size=sm]/menu-button:top-1",
                    "peer-data-[size=default]/menu-button:top-1.5",
                    "peer-data-[size=lg]/menu-button:top-2.5",
                    "group-data-[collapsible=icon]:hidden",
                    className,
                )}
                {...props}
            />
        );
    },
);
SidebarMenuBadge.displayName = "SidebarMenuBadge";

const SidebarMenuSkeleton = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div"> & {
        showIcon?: boolean;
    }
>(({ className, showIcon = false, ...props }, ref) => {
    const width = React.useMemo(() => {
        return `${Math.floor(Math.random() * 40) + 50}%`;
    }, []);

    return (
        <div
            ref={ref}
            data-sidebar="menu-skeleton"
            className={cn("rounded-md h-8 flex gap-2 px-2 items-center", className)}
            {...props}
        >
            {showIcon && <div className="bg-sidebar-accent h-4 w-4 rounded-md flex-shrink-0" />}
            <div
                className="bg-sidebar-accent h-4 flex-1 max-w-[--skeleton-width] rounded-md"
                style={
                    {
                        "--skeleton-width": width,
                    } as React.CSSProperties
                }
            />
        </div>
    );
});
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton";

const SidebarMenuSub = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                data-sidebar="menu-sub"
                className={cn(
                    "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 px-2.5 py-0.5",
                    "group-data-[collapsible=icon]:hidden",
                    className,
                )}
                {...props}
            />
        );
    },
);
SidebarMenuSub.displayName = "SidebarMenuSub";

const SidebarMenuSubItem = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
    ({ ...props }, ref) => {
        return <div ref={ref} {...props} />;
    },
);
SidebarMenuSubItem.displayName = "SidebarMenuSubItem";

const SidebarMenuSubButton = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentProps<"a"> & {
        asChild?: boolean;
        size?: "sm" | "md";
        isActive?: boolean;
    }
>(({ asChild = false, size = "md", isActive, className, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : "a";

    if (asChild) {
        return props.children;
    }

    return (
        <Comp
            ref={ref}
            data-sidebar="menu-sub-button"
            data-size={size}
            data-active={isActive}
            className={cn(
                "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-hidden ring-sidebar-ring-3 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-foreground/50",
                "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
                size === "sm" && "text-xs",
                size === "md" && "text-sm",
                "group-data-[collapsible=icon]:hidden",
                className,
            )}
            {...props}
        />
    );
});
SidebarMenuSubButton.displayName = "SidebarMenuSubButton";

export {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInput,
    SidebarInset,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSkeleton,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarProvider,
    SidebarSeparator,
    SidebarTrigger,
    useSidebar,
};
