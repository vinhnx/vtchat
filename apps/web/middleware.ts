import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/api/auth', '/', '/privacy', '/terms'];
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    // Only check authentication for protected routes
    if (!isPublicRoute) {
        // If user is not authenticated and trying to access protected route
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect_url', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/api/:path*',
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    ],
};
