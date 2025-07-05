import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import middleware from '../../middleware';

describe('Chat Route Redirect', () => {
    it('should redirect /chat to /', async () => {
        const request = new NextRequest('process.env.NEXT_PUBLIC_BASE_URL/chat', {
            method: 'GET',
        });

        const response = await middleware(request);

        expect(response.status).toBe(307); // Temporary redirect
        expect(response.headers.get('location')).toBe('process.env.NEXT_PUBLIC_BASE_URL/');
    });

    it('should NOT redirect /chat/{threadId}', async () => {
        const request = new NextRequest('process.env.NEXT_PUBLIC_BASE_URL/chat/abc123', {
            method: 'GET',
        });

        const response = await middleware(request);

        // Should proceed normally (NextResponse.next() or other processing)
        expect(response.status).not.toBe(307);
    });

    it('should NOT redirect /chat/ (with trailing slash)', async () => {
        const request = new NextRequest('process.env.NEXT_PUBLIC_BASE_URL/chat/', {
            method: 'GET',
        });

        const response = await middleware(request);

        // Should proceed normally (not redirect)
        expect(response.status).not.toBe(307);
    });

    it('should handle edge cases safely', async () => {
        // Test various edge cases
        const testCases = [
            '/chat/thread123',
            '/chat/thread-with-dashes',
            '/chat/thread_with_underscores',
            '/chat/thread123/nested',
            '/chatroom', // Similar but different route
            '/mychat', // Similar but different route
        ];

        for (const path of testCases) {
            const request = new NextRequest(`process.env.NEXT_PUBLIC_BASE_URL${path}`, {
                method: 'GET',
            });

            const response = await middleware(request);

            // These should NOT be redirected
            expect(response.status).not.toBe(307);
        }
    });
});
