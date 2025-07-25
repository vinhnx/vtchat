import * as React from "react";

export const VisuallyHidden = React.forwardRef<
    HTMLSpanElement,
    React.HTMLAttributes<HTMLSpanElement>
>(({ children, ...props }, ref) => (
    <span
        ref={ref}
        className="clip-[rect(0,0,0,0)] absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0"
        style={{
            position: "absolute",
            border: 0,
            width: "1px",
            height: "1px",
            padding: 0,
            margin: "-1px",
            overflow: "hidden",
            clip: "rect(0, 0, 0, 0)",
            whiteSpace: "nowrap",
        }}
        {...props}
    >
        {children}
    </span>
));
VisuallyHidden.displayName = "VisuallyHidden";
