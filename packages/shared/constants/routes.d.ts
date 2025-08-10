/**
 * Application Routes Configuration
 * Centralized route constants for consistent routing across the application
 */
/**
 * Public routes that don't require authentication
 * These routes are accessible without login
 */
export declare const PublicRoutes: {
    readonly HOME: "/";
    readonly LOGIN: "/login";
    readonly API_AUTH: "/api/auth";
    readonly PRIVACY: "/privacy";
    readonly TERMS: "/terms";
    readonly HELP: "/help";
    readonly ABOUT: "/about";
};
export type PublicRoute = (typeof PublicRoutes)[keyof typeof PublicRoutes];
/**
 * Protected routes that require authentication
 * These routes will redirect to login if user is not authenticated
 */
export declare const ProtectedRoutes: {
    readonly SETTINGS: "/settings";
    readonly PRICING: "/pricing";
    readonly SUCCESS: "/success";
};
export type ProtectedRoute = (typeof ProtectedRoutes)[keyof typeof ProtectedRoutes];
/**
 * API routes that may have different authentication requirements
 */
export declare const ApiRoutes: {
    readonly AUTH: "/api/auth";
    readonly USER_PROFILE: "/api/user/profile";
    readonly CHECKOUT: "/api/checkout";
    readonly WEBHOOK_CREEM: "/api/webhook/creem";
    readonly SUBSCRIPTION: "/api/subscription";
};
export type ApiRoute = (typeof ApiRoutes)[keyof typeof ApiRoutes];
/**
 * Array of all public routes for middleware usage
 */
export declare const PUBLIC_ROUTES_ARRAY: ("/" | "/login" | "/api/auth" | "/privacy" | "/terms" | "/help" | "/about")[];
/**
 * Array of all protected routes for middleware usage
 */
export declare const PROTECTED_ROUTES_ARRAY: ("/settings" | "/pricing" | "/success")[];
/**
 * Check if a given pathname is a public route
 * @param pathname - The pathname to check
 * @returns true if the pathname is a public route
 */
export declare function isPublicRoute(pathname: string): boolean;
/**
 * Check if a given pathname is a protected route
 * @param pathname - The pathname to check
 * @returns true if the pathname is a protected route
 */
export declare function isProtectedRoute(pathname: string): boolean;
//# sourceMappingURL=routes.d.ts.map