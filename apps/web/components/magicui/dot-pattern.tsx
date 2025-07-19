import type * as React from "react";

import { cn } from "@/lib/utils";

interface DotPatternProps extends React.SVGProps<SVGSVGElement> {
    width?: number;
    height?: number;
    cx?: number;
    cy?: number;
    cr?: number;
}

export const DotPattern: React.FC<DotPatternProps> = ({
    width = 20,
    height = 20,
    cx = 1,
    cy = 1,
    cr = 1,
    className,
    ...props
}) => {
    return (
        <svg
            className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
            fill="none"
            height="100%"
            viewBox={`0 0 ${width} ${height}`}
            width="100%"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <circle cx={cx} cy={cy} fill="currentColor" r={cr} />
            <pattern
                height={height}
                id="dot-pattern"
                patternUnits="userSpaceOnUse"
                width={width}
                x="0"
                y="0"
            >
                <circle cx={cx} cy={cy} fill="currentColor" r={cr} />
            </pattern>
            <rect fill="url(#dot-pattern)" height="100%" width="100%" />
        </svg>
    );
};
