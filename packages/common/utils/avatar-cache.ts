/**
 * Adds cache-busting parameter to avatar URLs to ensure fresh images on refresh
 */
export function getCacheBustedAvatarUrl(url: string | null | undefined): string | undefined {
    if (!url) return undefined;

    // If URL already has query parameters, append with &, otherwise use ?
    const separator = url.includes("?") ? "&" : "?";
    const timestamp = Date.now();

    return `${url}${separator}_t=${timestamp}`;
}

/**
 * Adds session-based cache busting to avatar URLs
 * This ensures avatars refresh on each session/page load but remain consistent during the session
 * Uses a more conservative approach to avoid rate limiting from GitHub and Google
 */
export function getSessionCacheBustedAvatarUrl(url: string | null | undefined): string | undefined {
    if (!url) return undefined;

    // For GitHub avatars, use a more conservative cache busting approach
    if (url.includes("avatars.githubusercontent.com")) {
        // Use a daily cache buster for GitHub avatars to avoid rate limiting
        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
        const separator = url.includes("?") ? "&" : "?";
        return `${url}${separator}_d=${today}`;
    }

    // For Google avatars, use a more conservative cache busting approach
    if (url.includes("googleusercontent.com")) {
        // Use a daily cache buster for Google avatars to avoid rate limiting
        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
        const separator = url.includes("?") ? "&" : "?";
        return `${url}${separator}_d=${today}`;
    }

    // Use a session-based cache buster that changes only on page refresh for other providers
    let sessionId: number;

    try {
        sessionId =
            typeof window !== "undefined" && window.performance
                ? window.performance.timeOrigin || Date.now()
                : Date.now();
    } catch {
        // Fallback if any error occurs
        sessionId = Date.now();
    }

    const separator = url.includes("?") ? "&" : "?";

    return `${url}${separator}_sid=${Math.floor(sessionId)}`;
}
