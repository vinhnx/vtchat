'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@repo/ui';

export function FeaturesAccordion() {
    return (
        <Accordion
            type="single"
            collapsible
            className="mx-auto w-full max-w-2xl"
            defaultValue="item-1"
        >
            <AccordionItem value="item-1" className="border-border">
                <AccordionTrigger className="text-foreground text-left text-base hover:text-[#BFB38F]">
                    Grounding Web Search - by Gemini
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                    Enhanced search with web integration and comprehensive analysis for real-time information
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-border">
                <AccordionTrigger className="text-foreground text-left text-base hover:text-[#BFB38F]">
                    Dark Mode
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">
                    Access to beautiful dark mode interface
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}
