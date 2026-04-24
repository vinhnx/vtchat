'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@repo/ui';

interface FeatureItem {
    name: string;
    description: string;
}

export function FeaturesAccordion() {
    const includedFeatures: ReadonlyArray<FeatureItem> = [
        {
            name: 'Core chat features',
            description: 'Access to the standard chat experience and everyday assistant tools.',
        },
        {
            name: 'Research workflows',
            description: 'Structured research modes for deeper answers and source-backed output.',
        },
        {
            name: 'Model controls',
            description: 'Flexible model selection, thinking settings, and caching controls.',
        },
    ];

    return (
        <Accordion
            className='mx-auto w-full max-w-2xl'
            collapsible
            defaultValue={includedFeatures.length > 0 ? 'item-0' : undefined}
            type='single'
        >
            {includedFeatures.map((feature: FeatureItem, index: number) => (
                <AccordionItem className='border-border' key={index} value={`item-${index}`}>
                    <AccordionTrigger className='text-foreground hover:text-muted-foreground text-left text-base font-medium'>
                        {feature.name}
                    </AccordionTrigger>
                    <AccordionContent className='text-foreground text-sm'>
                        {feature.description}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
