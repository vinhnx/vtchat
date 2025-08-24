'use client';

import { AiToolsBadge } from './aitools-badge';
import { FirstoBadges } from './firsto-badges';
import { GoodFirmsBadge } from './goodfirms-badge';

interface BadgesSectionProps {
    className?: string;
}

export function BadgesSection({ className }: BadgesSectionProps) {
    return (
        <section
            className={`badges-section ${className || ''}`}
            aria-label='Recognition and community badges'
        >
            <div className='flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-8 md:gap-12'>
                {/* AI Tools Badge */}
                <div className='badge-item flex-shrink-0'>
                    <AiToolsBadge className='transition-transform duration-200 hover:scale-105 focus:scale-105' />
                </div>

                {/* GoodFirms Badge */}
                <div className='badge-item flex-shrink-0'>
                    <GoodFirmsBadge className='transition-transform duration-200 hover:scale-105 focus:scale-105' />
                </div>

                {/* Firsto Badges */}
                <div className='badge-item flex-shrink-0'>
                    <FirstoBadges />
                </div>
            </div>

            {/* Optional: Add a subtle description */}
            <p className='text-muted-foreground mt-6 text-center text-sm'>
                VT is recognized by leading AI and software directories
            </p>
        </section>
    );
}
