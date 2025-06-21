import * as React from 'react';

import { cn } from '@/lib/utils';

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
            width="100%"
            height="100%"
            viewBox={`0 0 ${width} ${height}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
            {...props}
        >
            <circle cx={cx} cy={cy} r={cr} fill="currentColor" />
            <pattern
                id="dot-pattern"
                x="0"
                y="0"
                width={width}
                height={height}
                patternUnits="userSpaceOnUse"
            >
                <circle cx={cx} cy={cy} r={cr} fill="currentColor" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#dot-pattern)" />
        </svg>
    );
};
