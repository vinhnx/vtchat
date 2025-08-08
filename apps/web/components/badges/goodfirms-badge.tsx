"use client";

import Image from "next/image";
import { useState } from "react";

interface GoodFirmsBadgeProps {
    className?: string;
}

export function GoodFirmsBadge({ className }: GoodFirmsBadgeProps) {
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Fallback component for when the image fails to load
    const FallbackBadge = () => (
        <a
            href="https://www.goodfirms.co/chatbot-software/"
            target="_blank"
            rel="noopener noreferrer"
            className={`${className} block`}
            aria-label="VT featured on GoodFirms Chatbot Software directory"
        >
            <div className="bg-card flex h-20 w-40 items-center justify-center rounded-lg border-2 border-blue-500 px-4 py-2 text-center shadow-sm transition-transform duration-200 hover:scale-105">
                <div>
                    <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                        Featured on
                    </div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">GoodFirms</div>
                    <div className="text-muted-foreground text-xs">Chatbot Software</div>
                </div>
            </div>
        </a>
    );

    if (hasError) {
        return <FallbackBadge />;
    }

    return (
        <a
            href="https://www.goodfirms.co/chatbot-software/"
            target="_blank"
            rel="noopener noreferrer"
            className={`${className} block`}
            style={{ width: "160px", height: "auto", display: "inline-block" }}
            aria-label="VT featured on GoodFirms Chatbot Software directory"
        >
            <div className="relative">
                {isLoading && (
                    <div
                        className="absolute inset-0 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
                        style={{ width: "160px", height: "120px" }}
                    />
                )}
                <Image
                    src="/goodfirms_badge.svg"
                    alt="VT | GoodFirms Chatbot Software"
                    width={160}
                    height={120}
                    style={{
                        width: "160px",
                        height: "auto",
                        maxHeight: "120px",
                        objectFit: "contain",
                    }}
                    onError={() => {
                        console.warn("GoodFirms badge failed to load, using fallback");
                        setHasError(true);
                    }}
                    onLoad={() => setIsLoading(false)}
                    priority={false}
                    loading="lazy"
                    quality={75}
                />
            </div>
        </a>
    );
}
