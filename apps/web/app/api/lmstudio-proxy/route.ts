import { log } from '@repo/shared/logger';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        // Get user's LM Studio URL from headers or use default
        const lmstudioUrl = request.headers.get('x-lmstudio-url') || 'http://localhost:1234';
        
        // Security: Only allow localhost URLs
        const url = new URL(lmstudioUrl);
        const isLocalhost = url.hostname === 'localhost' || 
                           url.hostname === '127.0.0.1' || 
                           url.hostname === '::1';
        
        if (!isLocalhost) {
            return NextResponse.json(
                { error: 'Only localhost URLs are allowed for security' },
                { status: 400 }
            );
        }

        // Forward request to local LM Studio
        const response = await fetch(`${lmstudioUrl}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            // Timeout after 60 seconds
            signal: AbortSignal.timeout(60000),
        });

        if (!response.ok) {
            const errorText = await response.text();
            log.error('LM Studio proxy error:', { 
                status: response.status, 
                statusText: response.statusText,
                error: errorText 
            });
            
            return NextResponse.json(
                { 
                    error: 'LM Studio server error',
                    details: `Status ${response.status}: ${response.statusText}`,
                    suggestion: 'Make sure LM Studio is running with: lms server start --cors'
                },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        log.error('LM Studio proxy request failed:', { error });
        
        // Provide helpful error messages
        if (error.name === 'AbortError') {
            return NextResponse.json(
                { 
                    error: 'Request timeout',
                    suggestion: 'The local model may be slow. Try a smaller model or increase timeout.'
                },
                { status: 408 }
            );
        }
        
        if (error.code === 'ECONNREFUSED') {
            return NextResponse.json(
                { 
                    error: 'Cannot connect to LM Studio',
                    suggestion: 'Start LM Studio server with: lms server start --cors'
                },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { 
                error: 'Local AI connection failed',
                suggestion: 'Check that LM Studio is running and accessible'
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'LM Studio proxy endpoint',
        usage: 'POST to this endpoint to proxy requests to your local LM Studio instance',
        headers: {
            'x-lmstudio-url': 'Optional custom LM Studio URL (default: http://localhost:1234)'
        }
    });
}
