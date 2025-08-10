/**
 * Application Routes Configuration
 * Centralized route constants for consistent routing across the application
 */
/**
 * Public routes that don't require authentication
 * These routes are accessible without login
 */
export var PublicRoutes = {
    HOME: "/",
    LOGIN: "/login",
    API_AUTH: "/api/auth",
    PRIVACY: "/privacy",
    TERMS: "/terms",
    HELP: "/help",
    ABOUT: "/about",
};
/**
 * Protected routes that require authentication
 * These routes will redirect to login if user is not authenticated
 */
export var ProtectedRoutes = {
    SETTINGS: "/settings",
    PRICING: "/pricing", // VT+ subscription page - requires login
    SUCCESS: "/success",
};
/**
 * API routes that may have different authentication requirements
 */
export var ApiRoutes = {
    AUTH: "/api/auth",
    USER_PROFILE: "/api/user/profile",
    CHECKOUT: "/api/checkout",
    WEBHOOK_CREEM: "/api/webhook/creem",
    SUBSCRIPTION: "/api/subscription",
};
/**
 * Array of all public routes for middleware usage
 */
export var PUBLIC_ROUTES_ARRAY = Object.values(PublicRoutes);
/**
 * Array of all protected routes for middleware usage
 */
export var PROTECTED_ROUTES_ARRAY = Object.values(ProtectedRoutes);
/**
 * Check if a given pathname is a public route
 * @param pathname - The pathname to check
 * @returns true if the pathname is a public route
 */
export function isPublicRoute(pathname) {
    // Chat threads (/chat/[threadId]) should be treated as protected routes
    // Only allow exact /chat path to be public (which gets redirected to / anyway)
    if (pathname.startsWith("/chat/") && pathname !== "/chat") {
        return false;
    }
    return PUBLIC_ROUTES_ARRAY.some(function (route) { return pathname.startsWith(route); });
}
/**
 * Check if a given pathname is a protected route
 * @param pathname - The pathname to check
 * @returns true if the pathname is a protected route
 */
export function isProtectedRoute(pathname) {
    return PROTECTED_ROUTES_ARRAY.some(function (route) { return pathname.startsWith(route); });
}
