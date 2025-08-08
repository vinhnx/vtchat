"use client";

import Image from "next/image";
import { useState } from "react";

interface AiToolsBadgeProps {
    className?: string;
}

export function AiToolsBadge({ className }: AiToolsBadgeProps) {
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    if (hasError) {
        // Return a fallback badge or nothing if the external service is down
        return null;
    }

    return (
        <a
            href="https://aitools.inc/tools/vt?utm_source=embed-badge-vt&utm_medium=embed&utm_campaign=embed-badge-featured"
            target="_blank"
            rel="noopener noreferrer"
            className={`${className} block`}
            style={{ width: "175px", height: "auto", display: "inline-block" }}
            aria-label="VT featured on AI Tools directory"
        >
            <div className="relative">
                {isLoading && (
                    <div
                        className="absolute inset-0 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
                        style={{ width: "175px", height: "54px" }}
                    />
                )}
                <Image
                    src="https://aitools.inc/tools/vt/embeds/v1/featured-badge.svg?theme=neutral"
                    alt="VT | AI Tools"
                    width={175}
                    height={54}
                    style={{
                        width: "175px",
                        height: "54px",
                        objectFit: "contain",
                    }}
                    onError={() => setHasError(true)}
                    onLoad={() => setIsLoading(false)}
                    priority={false} // Not critical for initial page load
                    loading="lazy" // Lazy load for performance
                    unoptimized // SVG from external domain
                />
            </div>
        </a>
    );
}
