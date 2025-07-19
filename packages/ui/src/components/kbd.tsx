import * as React from "react";
import { cn } from "../lib/utils";

interface KbdProps extends React.HTMLAttributes<HTMLElement> {
    children: React.ReactNode;
}

const Kbd = React.forwardRef<HTMLElement, KbdProps>(({ className, children, ...props }, ref) => {
    return (
        <kbd
            className={cn(
                "border-border bg-background text-foreground flex h-5 items-center justify-center rounded-md border px-1.5 font-sans text-[10px] font-semibold",
                className,
            )}
            ref={ref}
            {...props}
        >
            {children}
        </kbd>
    );
});

Kbd.displayName = "Kbd";

export { Kbd };
