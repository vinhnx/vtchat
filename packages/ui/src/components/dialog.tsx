'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import * as React from 'react';

import { cn } from '../lib/utils';

// Context to track trigger position for transform origin
const DialogTriggerPositionContext = React.createContext<{
    triggerPosition: { x: number; y: number } | null;
    setTriggerPosition: (position: { x: number; y: number } | null) => void;
}>({
    triggerPosition: null,
    setTriggerPosition: () => {},
});

const DialogRoot = DialogPrimitive.Root;

// Enhanced Dialog with transform origin animation support
const Dialog: React.FC<React.ComponentProps<typeof DialogPrimitive.Root>> = ({ children, ...props }) => {
    const [triggerPosition, setTriggerPosition] = React.useState<{ x: number; y: number } | null>(null);

    return (
        <DialogTriggerPositionContext.Provider value={{ triggerPosition, setTriggerPosition }}>
            <AnimatePresence mode='wait'>
                <DialogRoot {...props}>
                    {children}
                </DialogRoot>
            </AnimatePresence>
        </DialogTriggerPositionContext.Provider>
    );
};

const DialogTrigger = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>
>(({ children, ...props }, ref) => {
    const { setTriggerPosition } = React.useContext(DialogTriggerPositionContext);
    const triggerRef = React.useRef<HTMLButtonElement>(null);

    React.useImperativeHandle(ref, () => triggerRef.current!);

    const handleClick = (event: React.MouseEvent) => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // Convert to viewport percentage for transform origin
            const x = (centerX / window.innerWidth) * 100;
            const y = (centerY / window.innerHeight) * 100;
            
            setTriggerPosition({ x, y });
        }
        props.onClick?.(event);
    };

    return (
        <DialogPrimitive.Trigger
            ref={triggerRef}
            {...props}
            onClick={handleClick}
        >
            {children}
        </DialogPrimitive.Trigger>
    );
});
DialogTrigger.displayName = DialogPrimitive.Trigger.displayName;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
        ref={ref}
        className={cn(
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0  fixed inset-0 z-50 bg-black/80',
            className,
        )}
        {...props}
    />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
    const { triggerPosition } = React.useContext(DialogTriggerPositionContext);

    return (
        <DialogPortal>
            <DialogOverlay />
            <DialogPrimitive.Content
                ref={ref}
                asChild
                aria-describedby={props['aria-describedby'] || 'dialog-description'}
                {...props}
            >
                <motion.div
                    initial={{ 
                        opacity: 0, 
                        scale: 0.95,
                        originX: triggerPosition ? triggerPosition.x / 100 : 0.5,
                        originY: triggerPosition ? triggerPosition.y / 100 : 0.5
                    }}
                    animate={{ 
                        opacity: 1, 
                        scale: 1,
                        originX: triggerPosition ? triggerPosition.x / 100 : 0.5,
                        originY: triggerPosition ? triggerPosition.y / 100 : 0.5
                    }}
                    exit={{ 
                        opacity: 0, 
                        scale: 0.95,
                        originX: triggerPosition ? triggerPosition.x / 100 : 0.5,
                        originY: triggerPosition ? triggerPosition.y / 100 : 0.5
                    }}
                    transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 30,
                        mass: 0.8
                    }}
                    style={{
                        transformOrigin: triggerPosition 
                            ? `${triggerPosition.x}% ${triggerPosition.y}%` 
                            : 'center center'
                    }}
                    className={cn(
                        'bg-background fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg duration-200 sm:rounded-lg',
                        className,
                    )}
                >
                    {!props['aria-describedby']
                        && !props.children?.toString().includes('aria-describedby') && (
                        <span id='dialog-description' className='sr-only'>
                            Dialog content
                        </span>
                    )}
                    {children}
                    <DialogPrimitive.Close className='rounded-xs ring-offset-background focus:outline-hidden focus:ring-ring-3 data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute right-4 top-4 opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none'>
                        <X className='h-4 w-4' />
                        <span className='sr-only'>Close</span>
                    </DialogPrimitive.Close>
                </motion.div>
            </DialogPrimitive.Content>
        </DialogPortal>
    );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}
        {...props}
    />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
        {...props}
    />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Title
        ref={ref}
        className={cn('text-lg font-semibold leading-none tracking-tight', className)}
        {...props}
    />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Description
        ref={ref}
        className={cn('text-muted-foreground text-sm', className)}
        {...props}
    />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogPortal,
    DialogTitle,
    DialogTrigger,
};
