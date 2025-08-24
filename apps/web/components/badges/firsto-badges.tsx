'use client';

import Image from 'next/image';
import { useState } from 'react';

const BADGE_WIDTH = 195;
const BADGE_HEIGHT = 49;

const enum FirstoBadgeUrls {
    PROJECT = 'https://firsto.co/projects/vt-chat',
    DAILY = 'https://firsto.co/images/badges/daily-top1.svg',
    WEEKLY = 'https://firsto.co/images/badges/weekly-top3.svg',
}

const enum FirstoBadgeAlt {
    DAILY = 'Firsto Top 1 Daily Winner',
    WEEKLY = 'Firsto Top 3 Weekly Winner',
}

interface FirstoBadgesProps {
    className?: string;
}

function FirstoBadgeItem(
    { src, alt, className }: { src: string; alt: string; className?: string; },
) {
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    if (hasError) {
        return null;
    }

    return (
        <a
            href={FirstoBadgeUrls.PROJECT}
            target='_blank'
            rel='noopener noreferrer'
            className={`${className} block`}
            style={{ width: `${BADGE_WIDTH}px`, height: 'auto' }}
            aria-label={alt}
        >
            <div className='relative'>
                {isLoading && (
                    <div
                        className='absolute inset-0 animate-pulse rounded bg-gray-200 dark:bg-gray-700'
                        style={{ width: `${BADGE_WIDTH}px`, height: `${BADGE_HEIGHT}px` }}
                    />
                )}
                <Image
                    src={src}
                    alt={alt}
                    width={BADGE_WIDTH}
                    height={BADGE_HEIGHT}
                    style={{ width: `${BADGE_WIDTH}px`, height: 'auto', objectFit: 'contain' }}
                    onError={() => setHasError(true)}
                    onLoad={() => setIsLoading(false)}
                    loading='lazy'
                    unoptimized
                />
            </div>
        </a>
    );
}

export function FirstoBadges({ className }: FirstoBadgesProps) {
    return (
        <div className={`flex flex-col items-center gap-4 sm:flex-row ${className || ''}`}>
            <FirstoBadgeItem
                src={FirstoBadgeUrls.DAILY}
                alt={FirstoBadgeAlt.DAILY}
                className='transition-transform duration-200 hover:scale-105 focus:scale-105'
            />
            <FirstoBadgeItem
                src={FirstoBadgeUrls.WEEKLY}
                alt={FirstoBadgeAlt.WEEKLY}
                className='transition-transform duration-200 hover:scale-105 focus:scale-105'
            />
        </div>
    );
}
