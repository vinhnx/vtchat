import { useStructuredExtraction } from '@repo/common/hooks';
import { useChatStore } from '@repo/common/store';
import { Button } from '@repo/ui';
import { Lightbulb } from 'lucide-react';

export const StructuredOutputButton = () => {
    const { extractStructuredOutput, isGeminiModel, hasDocument, isPDF } =
        useStructuredExtraction();

    const structuredData = useChatStore(state => state.structuredData);

    // Only show for Gemini models when a PDF document is attached
    if (!isGeminiModel || !hasDocument || !isPDF) return null;

    const isProcessed = !!structuredData;

    return (
        <Button
            size="icon-sm"
            variant="ghost"
            onClick={extractStructuredOutput}
            tooltip={
                isProcessed
                    ? `Structured data extracted from ${structuredData.fileName}`
                    : 'Extract Structured Data from PDF (Gemini Only)'
            }
            className={`text-muted-foreground hover:text-foreground ${
                isProcessed ? 'text-green-600 hover:text-green-700' : ''
            }`}
        >
            <Lightbulb size={16} strokeWidth={2} className={isProcessed ? 'text-green-600' : ''} />
        </Button>
    );
};
