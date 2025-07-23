"use client";

import * as ToastPrimitive from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import * as React from "react";
import { cn } from "../lib/utils";

const ToastProvider = ToastPrimitive.Provider;

const ToastViewport = React.forwardRef<
    React.ElementRef<typeof ToastPrimitive.Viewport>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
    <ToastPrimitive.Viewport
        className={cn(
            "dark fixed bottom-2 right-0 z-[500] flex w-full flex-col-reverse p-4 md:top-auto md:max-w-[420px] md:flex-col",
            className,
        )}
        ref={ref}
        {...props}
    />
));
ToastViewport.displayName = ToastPrimitive.Viewport.displayName;

const toastVariants = cva(
    "group data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-bottom-full data-[state=open]:slide-in-from-bottom-full data-[state=open]:sm:slide-in-from-bottom-full pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-lg p-4 pr-6 shadow-lg transition-all data-[swipe=cancel]:translate-y-0 data-[swipe=end]:translate-y-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-y-[var(--radix-toast-swipe-move-x)] data-[state=closed]:animate-out data-[state=open]:animate-in data-[swipe=end]:animate-out data-[swipe=move]:transition-none",
    {
        variants: {
            variant: {
                default: "border bg-background text-foreground",
                destructive: "border bg-destructive text-destructive-foreground",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    },
);

const Toast = React.forwardRef<
    React.ElementRef<typeof ToastPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> & VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
    return (
        <ToastPrimitive.Root
            className={cn(toastVariants({ variant }), className)}
            ref={ref}
            {...props}
        />
    );
});
Toast.displayName = ToastPrimitive.Root.displayName;

const ToastAction = React.forwardRef<
    React.ElementRef<typeof ToastPrimitive.Action>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action>
>(({ className, ...props }, ref) => (
    <ToastPrimitive.Action
        className={cn(
            "hover:bg-secondary focus:ring-ring-3 group-[.destructive]:border-destructive/30 group-[.destructive]:focus:ring-destructive group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors focus:outline-hidden focus:ring-1 disabled:pointer-events-none disabled:opacity-50 md:text-base",
            className,
        )}
        ref={ref}
        {...props}
    />
));
ToastAction.displayName = ToastPrimitive.Action.displayName;

const ToastClose = React.forwardRef<
    React.ElementRef<typeof ToastPrimitive.Close>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
    <ToastPrimitive.Close
        className={cn(
            "bg-muted/50 text-foreground/50 hover:text-foreground group-[.destructive]:text-destructive-foreground/50 group-[.destructive]:focus:ring-destructive group-[.destructive]:hover:text-destructive-foreground absolute right-2 top-2 rounded-lg p-1.5 opacity-100 transition-opacity focus:opacity-100 focus:outline-hidden focus:ring-1 group-hover:opacity-100",
            className,
        )}
        ref={ref}
        toast-close=""
        {...props}
    >
        <X size={14} strokeWidth={2} />
    </ToastPrimitive.Close>
));
ToastClose.displayName = ToastPrimitive.Close.displayName;

const ToastTitle = React.forwardRef<
    React.ElementRef<typeof ToastPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
    <ToastPrimitive.Title
        className={cn("text-sm font-medium [&+div]:text-sm", className)}
        ref={ref}
        {...props}
    />
));
ToastTitle.displayName = ToastPrimitive.Title.displayName;

const ToastDescription = React.forwardRef<
    React.ElementRef<typeof ToastPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
    <ToastPrimitive.Description
        className={cn("text-sm opacity-60", className)}
        ref={ref}
        {...props}
    />
));
ToastDescription.displayName = ToastPrimitive.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
    Toast,
    ToastAction,
    ToastClose,
    ToastDescription,
    ToastProvider,
    ToastTitle,
    ToastViewport,
    type ToastActionElement,
    type ToastProps,
};
