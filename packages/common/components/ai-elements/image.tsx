'use client';

import NextImage from 'next/image';
import { memo, useMemo } from 'react';

type BaseProps = {
    alt?: string;
    className?: string;
    fill?: boolean;
    width?: number;
    height?: number;
    sizes?: string;
    priority?: boolean;
};

// Compatible with AI SDK image output plus our server shape
export type GeneratedImageProps = BaseProps & {
    // AI SDK shapes
    base64?: string;
    uint8Array?: Uint8Array;
    mediaType?: string; // e.g. image/png
    // Our server convenience fields
    dataUrl?: string;
    url?: string;
};

function toDataUrlFromUint8(uint8Array?: Uint8Array, mediaType?: string): string | undefined {
    if (!uint8Array || !mediaType) return undefined;
    try {
        // Browser-safe conversion
        let base64 = '';
        if (typeof window !== 'undefined') {
            const binary = Array.from(uint8Array)
                .map((b) => String.fromCharCode(b))
                .join('');
            base64 = btoa(binary);
        } else if (typeof Buffer !== 'undefined') {
            base64 = Buffer.from(uint8Array).toString('base64');
        }
        return base64 ? `data:${mediaType};base64,${base64}` : undefined;
    } catch {
        return undefined;
    }
}

export const Image = memo(function AIImage({
    alt = 'Generated image',
    className,
    fill = false,
    width,
    height,
    sizes,
    priority = false,
    base64,
    uint8Array,
    mediaType,
    dataUrl,
    url,
}: GeneratedImageProps) {
    const src = useMemo(() => {
        if (dataUrl) return dataUrl;
        if (base64 && mediaType) return `data:${mediaType};base64,${base64}`;
        const fromUint = toDataUrlFromUint8(uint8Array, mediaType);
        if (fromUint) return fromUint;
        if (url) return url;
        return undefined;
    }, [dataUrl, base64, mediaType, uint8Array, url]);

    if (!src) {
        return (
            <div
                className={`bg-muted text-muted-foreground flex h-40 w-full items-center justify-center rounded-md border ${
                    className || ''
                }`}
                aria-label='No image available'
            >
                No image available
            </div>
        );
    }

    return (
        <NextImage
            alt={alt}
            src={src}
            fill={fill}
            width={fill ? undefined : width}
            height={fill ? undefined : height}
            sizes={sizes || (fill ? '100vw' : undefined)}
            priority={priority}
            className={className}
        />
    );
});

Image.displayName = 'AIImage';
