"use client";

import Image from "next/image";
import { useState } from "react";

interface AiToolsBadgeProps {
    className?: string;
}

export function AiToolsBadge({ className }: AiToolsBadgeProps) {
    const [hasError, setHasError] = useState(false);

    if (hasError) {
        // Return a fallback badge or nothing if the external service is down
        return null;
    }

    return (
        <a
            href="https://aitools.inc/tools/vt?utm_source=embed-badge-vt&utm_medium=embed&utm_campaign=embed-badge-featured"
            target="_blank"
            rel="noopener noreferrer"
            className={className}
            style={{ width: "175px", height: "54px", display: "inline-block" }}
        >
            <Image
                src="https://aitools.inc/tools/vt/embeds/v1/featured-badge.svg?theme=neutral"
                alt="VT | AI Tools"
                width={175}
                height={54}
                style={{ width: "175px", height: "54px" }}
                onError={() => setHasError(true)}
                unoptimized // SVG from external domain
            />
        </a>
    );
}
