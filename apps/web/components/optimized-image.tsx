import Image, { type ImageProps } from 'next/image';
import { memo, useCallback, useState } from 'react';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    priority?: boolean;
    sizes?: string;
    fill?: boolean;
    quality?: number;
    fallbackSrc?: string;
    showErrorMessage?: boolean;
}

export const OptimizedImage = memo(function OptimizedImage({
    src,
    alt,
    width,
    height,
    className = '',
    priority = false,
    sizes,
    fill = false,
    quality = 85,
    fallbackSrc,
    showErrorMessage = true,
    ...props
}: OptimizedImageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [currentSrc, setCurrentSrc] = useState(src);

    const handleLoad = useCallback(() => {
        setIsLoading(false);
    }, []);

    const handleError = useCallback(() => {
        setIsLoading(false);
        if (fallbackSrc && currentSrc !== fallbackSrc) {
            setCurrentSrc(fallbackSrc);
            return;
        }
        setHasError(true);
    }, [fallbackSrc, currentSrc]);

    if (hasError) {
        return showErrorMessage
            ? (
                <div
                    className={`bg-muted text-muted-foreground flex items-center justify-center text-sm ${className}`}
                    style={{ width: fill ? undefined : width, height: fill ? undefined : height }}
                    role='img'
                    aria-label={`Failed to load: ${alt}`}
                >
                    Failed to load image
                </div>
            )
            : null;
    }

    return (
        <div className={`relative ${isLoading ? 'bg-muted animate-pulse' : ''}`}>
            <Image
                src={currentSrc}
                alt={alt}
                width={fill ? undefined : width}
                height={fill ? undefined : height}
                fill={fill}
                priority={priority}
                quality={quality}
                sizes={sizes || (fill ? '100vw' : undefined)}
                className={`transition-opacity duration-300 ${
                    isLoading ? 'opacity-0' : 'opacity-100'
                } ${className}`}
                onLoad={handleLoad}
                onError={handleError}
                {...props}
            />
        </div>
    );
});

// Specific optimized components for common use cases
export function OptimizedIcon({
    src,
    alt,
    size = 24,
    className = '',
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
    className = '',
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
