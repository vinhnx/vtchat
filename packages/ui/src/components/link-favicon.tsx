"use client";
import { Globe } from "lucide-react";
import Image from "next/image";
import { type FC, useState } from "react";
import { cn } from "../lib/utils";

export type LinkFaviconType = {
    link?: string;
    className?: string;
    size?: "sm" | "md" | "lg";
};

const FallbackIcon = ({ size, className }: { size: "sm" | "md" | "lg"; className?: string }) => (
    <Globe
        className={cn("shrink-0 text-gray-500", className)}
        size={size === "sm" ? 12 : size === "md" ? 16 : 20}
        strokeWidth={2}
    />
);

const extractDomain = (url?: string): string | null => {
    if (!url) return null;

    try {
        // Handle grounding API redirects or other redirect URLs
        if (
            url.includes("vertexaisearch.cloud.google.com") ||
            url.includes("grounding-api-redirect")
        ) {
            return null; // Return null for redirect URLs to use fallback
        }

        const urlObj = new URL(url);
        return urlObj.hostname;
    } catch {
        return null;
    }
};

export const LinkFavicon: FC<LinkFaviconType> = ({ link, className, size = "sm" }) => {
    const [error, setError] = useState<boolean>(false);
    const domain = extractDomain(link);

    if (error || !domain) {
        return <FallbackIcon className={className} size={size} />;
    }

    return (
        <div
            className={cn(
                "bg-tertiary relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border",
                size === "sm" && "h-4 w-4",
                size === "md" && "h-5 w-5",
                size === "lg" && "h-8 w-8",
            )}
        >
            <div className="border-foreground/10 absolute inset-0 z-[2] rounded-full border" />
            <Image
                alt="favicon"
                className={cn("rounded-xs absolute inset-0 h-full w-full object-cover", className)}
                onError={() => setError(true)}
                src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
                width={128}
                height={128}
            />
        </div>
    );
};
