'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@repo/ui';
import { PRICING_CONFIG } from '../lib/config/pricing'; // Corrected import path

interface FeatureItem {
    name: string;
    description: string;
}

export function FeaturesAccordion() {
    const plusFeatures: ReadonlyArray<FeatureItem> = PRICING_CONFIG.pricing.plus.features;

    return (
        <Accordion
            type="single"
            collapsible
            className="mx-auto w-full max-w-2xl"
            // Set default open to the first feature if features exist
            defaultValue={plusFeatures.length > 0 ? `item-0` : undefined}
        >
            {plusFeatures.map((feature: FeatureItem, index: number) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-border">
                    <AccordionTrigger className="text-foreground text-left text-base font-medium hover:text-[#BFB38F]">
                        {feature.name}
                    </AccordionTrigger>
                    <AccordionContent className="text-foreground text-sm">
                        {feature.description}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
