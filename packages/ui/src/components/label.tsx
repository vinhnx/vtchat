"use client";

import * as React from "react";
import { cn } from "../lib/utils";

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
    ({ className, ...props }, ref) => (
        <label
            className={cn(
                "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                className,
            )}
            ref={ref}
            {...props}
        />
    ),
);
Label.displayName = "Label";

export { Label };
