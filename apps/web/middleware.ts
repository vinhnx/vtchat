import { isPublicRoute } from '@repo/shared/constants';
import { log } from '@repo/shared/logger';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Privacy-safe traffic monitoring - only aggregate region stats, no IPs or personal data
    const flyRegion = request.headers.get('Fly-Region') || request.headers.get('fly-region')
        || 'local';
    log.info({ region: flyRegion, pathname }, '[Traffic] Request');

    // Remove tracking parameters from home page to prevent duplicate content
    // while preserving them for analytics in a non-indexable way
    if (pathname === '/' || pathname === '') {
        const trackingParams = ['ref', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid', 'ref_src', 'source'];
        let hasTrackingParams = false;
        const newSearchParams = new URLSearchParams();
        
        request.nextUrl.searchParams.forEach((value, key) => {
            if (trackingParams.includes(key)) {
                hasTrackingParams = true;
            } else {
                newSearchParams.append(key, value);
            }
        });
        
        if (hasTrackingParams) {
            const cleanUrl = new URL(request.url);
            cleanUrl.search = newSearchParams.toString();
            return NextResponse.rewrite(cleanUrl);
        }
    }

    // Redirect '/chat' to '/' (keep '/chat/{threadid}' intact)
    // Only redirect exact '/chat' path, not '/chat/' or '/chat/anything'
    if (pathname === '/chat') {
        return NextResponse.redirect(new URL('/', request.url), 301);
    }

    // Skip middleware for static files, API routes with their own protection, and Next.js internals
    if (
        pathname.startsWith('/_next')
        || pathname.startsWith('/api/')
        || pathname.includes('.') // Files with extensions
        || pathname.startsWith('/favicon')
        || pathname.startsWith('/robots')
        || pathname.startsWith('/sitemap')
        || pathname.startsWith('/manifest')
    ) {
        return NextResponse.next();
    }

    // Check if the route is public (doesn't require authentication)
    const isPublic = isPublicRoute(pathname);

    // Only check authentication for protected routes
    if (!isPublic) {
        try {
            // Dynamic import to avoid Edge Runtime issues
            const { getCookieCache } = await import('better-auth/cookies');
            const { auth } = await import('@/lib/auth-server');

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

            // Increase timeout to 10 seconds to handle slow network conditions
            // and prevent false negatives during active chat sessions
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Auth timeout')), 10000)
            );

            const session = await Promise.race([sessionPromise, timeoutPromise]);

            if (!session) {
                log.info({ pathname }, '[Middleware] No session found, redirecting to login');
                const loginUrl = new URL('/login', request.url);
                loginUrl.searchParams.set('redirect_url', pathname);
                return NextResponse.redirect(loginUrl);
            }
        } catch (error) {
            // Distinguish between timeout and other errors for better debugging
            const isTimeout = error instanceof Error && error.message === 'Auth timeout';

            if (isTimeout) {
                log.warn({ pathname, timeout: '10s' }, '[Middleware] Auth check timed out');

                // For timeout errors during chat sessions, try to preserve the session
                // by allowing the request to proceed and let client-side auth handle it
                if (pathname.startsWith('/chat/')) {
                    log.info(
                        { pathname },
                        '[Middleware] Allowing chat route to proceed despite timeout',
                    );
                    return NextResponse.next();
                }
            } else {
                log.warn({ error, pathname }, '[Middleware] Auth check failed');
            }

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
         * - api/cron (cron endpoints) - these have their own Bearer token auth
         * - api/metrics (metrics endpoints) - these have their own protection
         * - api/health (health check endpoints) - these are public
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         * - healthz (health checks)
         */
        '/((?!api/auth|api/chat|api/feedback|api/cron|api/metrics|api/health|_next/static|_next/image|favicon.ico|.*\\..*|public/|healthz).*)',
    ],
};
