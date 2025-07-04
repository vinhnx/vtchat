/**
 * Application Routes Configuration
 * Centralized route constants for consistent routing across the application
 */

/**
 * Public routes that don't require authentication
 * These routes are accessible without login
 */
export enum PublicRoutes {
    HOME = '/',
    LOGIN = '/login',
    API_AUTH = '/api/auth',
    PRIVACY = '/privacy',
    TERMS = '/terms',
    FAQ = '/faq',
}

/**
 * Protected routes that require authentication
 * These routes will redirect to login if user is not authenticated
 */
export enum ProtectedRoutes {
    RECENT = '/recent',
    SETTINGS = '/settings',
    PLUS = '/plus', // VT+ subscription page - requires login
    SUCCESS = '/success',
}

/**
 * API routes that may have different authentication requirements
 */
export enum ApiRoutes {
    AUTH = '/api/auth',
    USER_PROFILE = '/api/user/profile',
    CHECKOUT = '/api/checkout',
    WEBHOOK_CREEM = '/api/webhook/creem',
    SUBSCRIPTION = '/api/subscription',
}

/**
 * Array of all public routes for middleware usage
 */
export const PUBLIC_ROUTES_ARRAY = Object.values(PublicRoutes);

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
    return PUBLIC_ROUTES_ARRAY.some((route) => pathname.startsWith(route));
}

/**
 * Check if a given pathname is a protected route
 * @param pathname - The pathname to check
 * @returns true if the pathname is a protected route
 */
export function isProtectedRoute(pathname: string): boolean {
    return PROTECTED_ROUTES_ARRAY.some((route) => pathname.startsWith(route));
}
