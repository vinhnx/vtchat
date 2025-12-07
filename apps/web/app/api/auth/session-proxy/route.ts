import { auth } from '@/lib/auth-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        return NextResponse.json(
            { session },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'no-store',
                },
            },
        );
    } catch (error) {
        return NextResponse.json(
            { session: null, error: 'SESSION_FETCH_FAILED' },
            {
                status: 500,
                headers: {
                    'Cache-Control': 'no-store',
                },
            },
        );
    }
}
