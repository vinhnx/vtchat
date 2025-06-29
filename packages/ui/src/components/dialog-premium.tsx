"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from "../lib/utils"

const PremiumDialog = DialogPrimitive.Root
const PremiumDialogTrigger = DialogPrimitive.Trigger
const PremiumDialogPortal = DialogPrimitive.Portal
const PremiumDialogClose = DialogPrimitive.Close

const premiumDialogOverlayVariants = cva(
  "fixed inset-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
  {
    variants: {
      variant: {
        default: "bg-black/80",
        blur: "bg-black/20 backdrop-blur-md",
        glass: "bg-white/10 backdrop-blur-xl",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const premiumDialogContentVariants = cva(
  "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
  {
    variants: {
      variant: {
        default: "rounded-lg shadow-xl",
        premium: "rounded-xl shadow-2xl border-slate-200/50 dark:border-slate-700/50",
        glass: "rounded-xl backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border-white/20 shadow-2xl",
        minimal: "rounded-2xl border-none shadow-2xl",
      },
      size: {
        sm: "max-w-sm",
        default: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
        full: "max-w-[95vw] max-h-[95vh]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface PremiumDialogOverlayProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>,
    VariantProps<typeof premiumDialogOverlayVariants> {}

const PremiumDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  PremiumDialogOverlayProps
>(({ className, variant, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(premiumDialogOverlayVariants({ variant }), className)}
    {...props}
  />
))
PremiumDialogOverlay.displayName = DialogPrimitive.Overlay.displayName

interface PremiumDialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof premiumDialogContentVariants> {
  overlayVariant?: VariantProps<typeof premiumDialogOverlayVariants>['variant']
  showCloseButton?: boolean
}

const PremiumDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  PremiumDialogContentProps
>(({ className, variant, size, overlayVariant = "blur", showCloseButton = true, children, ...props }, ref) => (
  <PremiumDialogPortal>
    <PremiumDialogOverlay variant={overlayVariant} />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(premiumDialogContentVariants({ variant, size }), className)}
      {...props}
    >
      {children}
      {showCloseButton && (
        <PremiumDialogClose className="absolute right-4 top-4 rounded-md opacity-70 ring-offset-background transition-all hover:opacity-100 hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground p-1">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </PremiumDialogClose>
      )}
    </DialogPrimitive.Content>
  </PremiumDialogPortal>
))
PremiumDialogContent.displayName = DialogPrimitive.Content.displayName

const PremiumDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-3 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
PremiumDialogHeader.displayName = "PremiumDialogHeader"

const PremiumDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4 border-t border-border/50",
      className
    )}
    {...props}
  />
)
PremiumDialogFooter.displayName = "PremiumDialogFooter"

const PremiumDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-tight tracking-tight",
      className
    )}
    {...props}
  />
))
PremiumDialogTitle.displayName = DialogPrimitive.Title.displayName

const PremiumDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground leading-relaxed", className)}
    {...props}
  />
))
PremiumDialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  PremiumDialog,
  PremiumDialogPortal,
  PremiumDialogTrigger,
  PremiumDialogClose,
  PremiumDialogOverlay,
  PremiumDialogContent,
  PremiumDialogHeader,
  PremiumDialogFooter,
  PremiumDialogTitle,
  PremiumDialogDescription,
}
