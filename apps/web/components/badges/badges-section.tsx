"use client";

import { AiToolsBadge } from "./aitools-badge";
import { GoodFirmsBadge } from "./goodfirms-badge";

interface BadgesSectionProps {
    className?: string;
}

export function BadgesSection({ className }: BadgesSectionProps) {
    return (
        <section className={`badges-section ${className || ""}`} aria-label="Recognition and community badges">
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
                {/* AI Tools Badge */}
                <div className="badge-item flex-shrink-0">
                    <AiToolsBadge className="transition-transform duration-200 hover:scale-105 focus:scale-105" />
                </div>
                
                {/* GoodFirms Badge */}
                <div className="badge-item flex-shrink-0">
                    <GoodFirmsBadge className="transition-transform duration-200 hover:scale-105 focus:scale-105" />
                </div>
            </div>
            
            {/* Optional: Add a subtle description */}
            <p className="text-muted-foreground mt-4 text-center text-sm">
                VT is recognized by leading AI and software directories
            </p>
        </section>
    );
}
