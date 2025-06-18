import { auth } from '@/lib/auth';
import { isPublicRoute } from '@repo/shared/constants';
import { getCookieCache } from 'better-auth/cookies';
import { NextRequest, NextResponse } from 'next/server';

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip middleware for static files, API routes, and Next.js internals
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api/') ||
        pathname.includes('.') || // Files with extensions
        pathname.startsWith('/favicon')
    ) {
        return NextResponse.next();
    }

    // Check if the route is public (doesn't require authentication)
    const isPublic = isPublicRoute(pathname);

    // Only check authentication for protected routes
    if (!isPublic) {
        try {
            // First, try to get session from cookie cache (fastest)
            const cachedSession = await getCookieCache(request);

            if (cachedSession) {
                // Session found in cookie cache, proceed
                return NextResponse.next();
            }

            // If no cached session, fall back to database check with timeout
            const sessionPromise = auth.api.getSession({
                headers: request.headers,
            });

            // Add 3-second timeout to prevent hanging (reduced from 5s)
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Auth timeout')), 3000)
            );

            const session = await Promise.race([sessionPromise, timeoutPromise]);

            if (!session) {
                const loginUrl = new URL('/login', request.url);
                loginUrl.searchParams.set('redirect_url', pathname);
                return NextResponse.redirect(loginUrl);
            }
        } catch (error) {
            console.warn('[Middleware] Auth check failed:', error);
            // On auth failure, redirect to login for protected routes
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect_url', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (auth endpoints)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         */
        '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*|public/).*)',
    ],
};
