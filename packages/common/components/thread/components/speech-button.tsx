'use client';

import { useApiKeysStore } from '@repo/common/store';
import { http } from '@repo/shared/lib/http-client';
import { log } from '@repo/shared/lib/logger';
import { Button, cn } from '@repo/ui';
import { useLegacyToast } from '@repo/ui/src/components/use-toast';
import { Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';

interface SpeechButtonProps {
    text: string;
    className?: string;
}

export const SpeechButton = ({ text, className }: SpeechButtonProps) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const [audioSource, setAudioSource] = useState<AudioBufferSourceNode | null>(null);
    const { toast } = useLegacyToast();
    const openaiApiKey = useApiKeysStore((state) => state.keys.OPENAI_API_KEY);

    const handleSpeak = async () => {
        if (!text.trim()) {
            toast({
                title: 'No text to speak',
                description: 'There is no content available to read aloud.',
                variant: 'default',
            });
            return;
        }

        try {
            setIsSpeaking(true);
            const response = await http.post('/api/speech', {
                body: { text },
                headers: {
                    'x-openai-api-key': openaiApiKey || '',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.error || 'Failed to generate speech';
                toast({
                    title: 'Speech Generation Error',
                    description: errorMessage,
                    variant: 'destructive',
                });
                throw new Error(errorMessage); // Re-throw for the catch block to handle general error state
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            // For browser compatibility, especially with autoplay policies,
            // using the Web Audio API is often more reliable than <audio> element.
            let newAudioContext = audioContext;
            if (!newAudioContext) {
                newAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                setAudioContext(newAudioContext);
            }

            const arrayBuffer = await audioBlob.arrayBuffer();
            const audioBuffer = await newAudioContext.decodeAudioData(arrayBuffer);

            // Stop any currently playing audio
            if (audioSource) {
                audioSource.stop();
            }

            const source = newAudioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(newAudioContext.destination);
            source.start(0);
            setAudioSource(source);

            source.onended = () => {
                setIsSpeaking(false);
                URL.revokeObjectURL(audioUrl); // Clean up the object URL
            };
        } catch (error: any) {
            log.error({ error, text: text.substring(0, 100) }, 'Error generating or playing speech');
            setIsSpeaking(false);
            // Toast for general errors (e.g., network issues, unexpected errors)
            // Specific API errors are handled above and show their own toasts before re-throwing.
            if (
                !error.message.includes('OpenAI API key is required')
                && !error.message.includes('Speech Generation Error')
            ) {
                toast({
                    title: 'Speech Error',
                    description: error.message || 'Could not generate or play the speech.',
                    variant: 'destructive',
                });
            }
            // If it's the API key error, the toast has already been shown.
            // Re-throwing here is not strictly necessary if we handle all UI feedback via toasts,
            // but keeping it for now in case other logic depends on it.
            // throw error;
        }
    };

    const handleStop = () => {
        if (audioSource) {
            audioSource.stop();
            setIsSpeaking(false);
        }
        // Fallback for cases where audio might be playing via <audio> element
        // This is a simple stop, a more robust solution might track active audio elements
        const allAudioElements = document.querySelectorAll('audio');
        allAudioElements.forEach((el) => {
            (el as HTMLAudioElement).pause();
            (el as HTMLAudioElement).currentTime = 0;
        });
    };

    if (!text.trim()) {
        return null; // Don't render button if there's no text
    }

    return (
        <Button
            variant='secondary'
            size='sm'
            className={cn(
                'bg-muted/30 text-muted-foreground hover:bg-muted h-8 rounded-md border px-3',
                className,
            )}
            onClick={isSpeaking ? handleStop : handleSpeak}
            aria-label={isSpeaking ? 'Stop speaking' : 'Speak text'}
            title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
            disabled={isSpeaking}
        >
            <div className='flex items-center gap-2'>
                {isSpeaking ? <VolumeX className='h-4 w-4' /> : <Volume2 className='h-4 w-4' />}
                <span>{isSpeaking ? 'Stop' : 'Read Aloud'}</span>
            </div>
        </Button>
    );
};
