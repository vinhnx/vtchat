import * as React from "react";

import { cn } from "../lib/utils";
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    "border-border bg-secondary placeholder:text-muted-foreground focus-visible:outline-hidden flex min-h-[120px] w-full resize-none rounded-lg border border-none px-4 py-4 text-sm disabled:cursor-not-allowed disabled:opacity-50",
                    className,
                )}
                ref={ref}
                {...props}
            />
        );
    },
);
Textarea.displayName = "Textarea";

export { Textarea };
