/**
 * Application Routes Configuration
 * Centralized route constants for consistent routing across the application
 */

/**
 * Public routes that don't require authentication
 * These routes are accessible without login
 */
export const PublicRoutes = {
    HOME: '/',
    LOGIN: '/login',
    API_AUTH: '/api/auth',
    PRIVACY: '/privacy',
    TERMS: '/terms',
    HELP: '/help',
    ABOUT: '/about',
} as const;

export type PublicRoute = (typeof PublicRoutes)[keyof typeof PublicRoutes];

/**
 * Protected routes that require authentication
 * These routes will redirect to login if user is not authenticated
 */
export const ProtectedRoutes = {
    SETTINGS: '/settings',
    PRICING: '/pricing', // VT+ subscription page - requires login
    SUCCESS: '/success',
    PROFILE: '/profile',
} as const;

export type ProtectedRoute = (typeof ProtectedRoutes)[keyof typeof ProtectedRoutes];

/**
 * API routes that may have different authentication requirements
 */
export const ApiRoutes = {
    AUTH: '/api/auth',
    USER_PROFILE: '/api/user/profile',
    CHECKOUT: '/api/checkout',
    WEBHOOK_CREEM: '/api/webhook/creem',
    SUBSCRIPTION: '/api/subscription',
} as const;

export type ApiRoute = (typeof ApiRoutes)[keyof typeof ApiRoutes];

/**
 * Array of all public routes for middleware usage
 */
export const PUBLIC_ROUTES_ARRAY = Object.values(PublicRoutes);

const PUBLIC_ROUTES_EXCLUDING_HOME = PUBLIC_ROUTES_ARRAY.filter(
    (route) => route !== PublicRoutes.HOME,
);

/**
 * Array of all protected routes for middleware usage
 */
export const PROTECTED_ROUTES_ARRAY = Object.values(ProtectedRoutes);

/**
 * Check if a given pathname is a public route
 * @param pathname - The pathname to check
 * @returns true if the pathname is a public route
 */
export function isPublicRoute(pathname: string): boolean {
    // Chat threads (/chat/[threadId]) should be treated as protected routes
    // Only allow exact /chat path to be public (which gets redirected to / anyway)
    if (pathname.startsWith('/chat/') && pathname !== '/chat') {
        return false;
    }

    if (pathname === PublicRoutes.HOME) {
        return true;
    }

    return PUBLIC_ROUTES_EXCLUDING_HOME.some((route) => pathname.startsWith(route));
}

/**
 * Check if a given pathname is a protected route
 * @param pathname - The pathname to check
 * @returns true if the pathname is a protected route
 */
export function isProtectedRoute(pathname: string): boolean {
    return PROTECTED_ROUTES_ARRAY.some((route) => pathname.startsWith(route));
}
