"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@repo/ui"

export function FeaturesAccordion() {
  return (
    <Accordion type="single" collapsible className="w-full max-w-2xl mx-auto" defaultValue="item-1">
      <AccordionItem value="item-1" className="border-border">
        <AccordionTrigger className="text-foreground text-left hover:text-[#BFB38F] text-base">Web Search Grounding With Gemini</AccordionTrigger>
        <AccordionContent className="text-muted-foreground text-sm">
          Enhanced search with web integration for real-time information
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2" className="border-border">
        <AccordionTrigger className="text-foreground text-left hover:text-[#BFB38F] text-base">Dark Mode</AccordionTrigger>
        <AccordionContent className="text-muted-foreground text-sm">Access to beautiful dark mode interface</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3" className="border-border">
        <AccordionTrigger className="text-foreground text-left hover:text-[#BFB38F] text-base">
          Deep Research
        </AccordionTrigger>
        <AccordionContent className="text-muted-foreground text-sm">
          Comprehensive analysis of complex topics with in-depth exploration
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
