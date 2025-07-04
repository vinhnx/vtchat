import { isPublicRoute } from '@repo/shared/constants';
import { log } from '@repo/shared/logger';
import { getCookieCache } from 'better-auth/cookies';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-server';

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Privacy-safe traffic monitoring - only aggregate region stats, no IPs or personal data
    const flyRegion =
        request.headers.get('Fly-Region') || request.headers.get('fly-region') || 'local';
    log.info({ region: flyRegion, pathname }, '[Traffic] Request');

    // Redirect '/chat' to '/' (keep '/chat/{threadid}' intact)
    // Only redirect exact '/chat' path, not '/chat/' or '/chat/anything'
    if (pathname === '/chat') {
        return NextResponse.redirect(new URL('/', request.url), 301);
    }

    // Skip middleware for static files, API routes with their own protection, and Next.js internals
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

            // Add 1-second timeout to prevent hanging (optimized for INP)
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Auth timeout')), 1000)
            );

            const session = await Promise.race([sessionPromise, timeoutPromise]);

            if (!session) {
                const loginUrl = new URL('/login', request.url);
                loginUrl.searchParams.set('redirect_url', pathname);
                return NextResponse.redirect(loginUrl);
            }
        } catch (error) {
            log.warn({ error }, '[Middleware] Auth check failed');
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
         * - api/auth (auth endpoints) - these have their own protection
         * - api/chat (chat endpoints) - these have their own protection
         * - api/feedback (feedback endpoints) - these have their own protection
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         * - healthz (health checks)
         */
        '/((?!api/auth|api/chat|api/feedback|_next/static|_next/image|favicon.ico|.*\\..*|public/|healthz).*)',
    ],
};
