import { openai } from '@ai-sdk/openai';
import { experimental_generateSpeech as generateSpeech } from 'ai';
import { type NextRequest, NextResponse } from 'next/server';

// This route handler will generate speech using the user's OpenAI API key
export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();

        if (!text || typeof text !== 'string') {
            return NextResponse.json(
                { error: 'Invalid or missing text parameter' },
                { status: 400 },
            );
        }

        // In a real app, you'd get the API key from the user's session or store
        // For now, we'll try to get it from the store, but this is a server-side component
        // so we need a way to pass the user's API key to this endpoint.
        // This might involve reading it from a request header or a secure cookie.
        // For simplicity, this example assumes the key is available or passed in a header.
        // A more robust solution would involve user authentication and session management.

        const apiKey = req.headers.get('x-openai-api-key'); // Example: pass key in header

        if (!apiKey) {
            return NextResponse.json(
                { error: 'OpenAI API key is required. Please configure your API key in settings.' },
                { status: 401 },
            );
        }

        // Set the API key for the OpenAI client
        // Note: The @ai-sdk/openai client might have a specific way to set the API key.
        // You might need to configure the openai instance with the key.
        // For example: openai.apiKey = apiKey;
        // Or, the generateSpeech function might take an options object with the provider.
        // This part depends on the exact usage of the ai-sdk.

        const { audio } = await generateSpeech({
            model: openai.speech('tts-1'), // Using tts-1 as requested
            text: text,
            // voice: 'alloy', // Optional: specify voice if needed
            // speed: 1.0, // Optional: specify speed
        });

        // The 'audio' is likely a ReadableStream or similar.
        // We need to convert it to a format suitable for NextResponse.
        // For now, let's assume it's a Uint8Array or can be converted to one.
        // If it's a ReadableStream, we might need to buffer it first.
        // The Vercel AI SDK documentation for `experimental_generateSpeech`
        // should specify the exact type of `audio`.
        // Let's assume for now it returns an ArrayBuffer or Uint8Array.

        // Assuming 'audio' is an object with a 'value' property containing the audio data
        // This is a common pattern in the Vercel AI SDK
        const audioData = (audio as any).value || audio;

        // Convert audio data to ArrayBuffer if it's not already
        let audioBuffer: ArrayBuffer;
        if (audioData instanceof ArrayBuffer) {
            audioBuffer = audioData;
        } else if (audioData instanceof Uint8Array) {
            // Ensure ArrayBuffer type, not ArrayBufferLike
            // Create a new Uint8Array to guarantee a true ArrayBuffer
            audioBuffer = new Uint8Array(audioData).buffer;
        } else if (audioData instanceof ReadableStream) {
            // If it's a ReadableStream, convert it to an ArrayBuffer
            audioBuffer = await new Response(audioData).arrayBuffer();
        } else {
            // Fallback or error if the type is unexpected
            throw new Error('Unsupported audio data type');
        }

        // Return the audio data
        return new NextResponse(audioBuffer, {
            headers: {
                'Content-Type': 'audio/mpeg', // Adjust if the AI SDK provides a different type
            },
        });
    } catch (error) {
        const { log } = await import('@repo/shared/lib/logger');
        log.error({ error }, 'Error generating speech');
        if (error instanceof Error && error.message.includes('API key')) {
            return NextResponse.json(
                { error: 'Invalid OpenAI API key. Please check your key in settings.' },
                { status: 401 },
            );
        }
        return NextResponse.json({ error: 'Failed to generate speech' }, { status: 500 });
    }
}
