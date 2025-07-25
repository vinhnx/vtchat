"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@repo/ui";
import { PRICING_CONFIG } from "../lib/config/pricing"; // Corrected import path

interface FeatureItem {
    name: string;
    description: string;
}

export function FeaturesAccordion() {
    const plusFeatures: ReadonlyArray<FeatureItem> = PRICING_CONFIG.pricing.plus.features;

    return (
        <Accordion
            className="mx-auto w-full max-w-2xl"
            collapsible
            defaultValue={plusFeatures.length > 0 ? "item-0" : undefined}
            // Set default open to the first feature if features exist
            type="single"
        >
            {plusFeatures.map((feature: FeatureItem, index: number) => (
                <AccordionItem className="border-border" key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-foreground hover:text-muted-foreground text-left text-base font-medium">
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
