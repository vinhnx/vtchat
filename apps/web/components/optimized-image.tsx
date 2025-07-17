import Image from "next/image";
import { useState } from "react";

interface OptimizedImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    priority?: boolean;
    sizes?: string;
    fill?: boolean;
    quality?: number;
}

export function OptimizedImage({
    src,
    alt,
    width,
    height,
    className,
    priority = false,
    sizes,
    fill = false,
    quality = 85,
    ...props
}: OptimizedImageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    if (hasError) {
        return (
            <div 
                className={`bg-muted flex items-center justify-center text-muted-foreground text-sm ${className}`}
                style={{ width, height }}
            >
                Failed to load image
            </div>
        );
    }

    return (
        <div className={`relative ${isLoading ? 'animate-pulse bg-muted' : ''} ${className}`}>
            <Image
                src={src}
                alt={alt}
                width={fill ? undefined : width}
                height={fill ? undefined : height}
                fill={fill}
                priority={priority}
                quality={quality}
                sizes={sizes || (fill ? "100vw" : undefined)}
                className={`transition-opacity duration-300 ${
                    isLoading ? 'opacity-0' : 'opacity-100'
                } ${className}`}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                    setIsLoading(false);
                    setHasError(true);
                }}
                {...props}
            />
        </div>
    );
}

// Specific optimized components for common use cases
export function OptimizedIcon({ 
    src, 
    alt, 
    size = 24, 
    className = "" 
}: { 
    src: string; 
    alt: string; 
    size?: number; 
    className?: string; 
}) {
    return (
        <OptimizedImage
            src={src}
            alt={alt}
            width={size}
            height={size}
            className={className}
            quality={90}
            priority={false}
        />
    );
}

export function OptimizedAvatar({ 
    src, 
    alt, 
    size = 40, 
    className = "" 
}: { 
    src: string; 
    alt: string; 
    size?: number; 
    className?: string; 
}) {
    return (
        <OptimizedImage
            src={src}
            alt={alt}
            width={size}
            height={size}
            className={`rounded-full ${className}`}
            quality={80}
            priority={false}
        />
    );
}

