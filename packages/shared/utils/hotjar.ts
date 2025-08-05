import Hotjar from "@hotjar/browser";
import { log } from "../src/lib/logger";

const siteId = process.env.NEXT_PUBLIC_HOTJAR_SITE_ID;
const hotjarVersion = process.env.NEXT_PUBLIC_HOTJAR_VERSION;

const initHotjar = () => {
    // Only initialize in browser environment
    if (typeof window === "undefined") {
        return;
    }

    // Check if required environment variables are present
    if (!siteId || !hotjarVersion) {
        // Silently skip initialization if config is missing
        // This prevents errors in development or when Hotjar is not configured
        return;
    }

    try {
        // Parse and validate the configuration values
        const parsedSiteId = Number.parseInt(siteId, 10);
        const parsedVersion = Number.parseInt(hotjarVersion, 10);

        // Validate that parsing was successful
        if (Number.isNaN(parsedSiteId) || Number.isNaN(parsedVersion)) {
            log.warn(
                { siteId, hotjarVersion },
                "Hotjar configuration invalid: siteId or version is not a valid number",
            );
            return;
        }

        // Additional validation for reasonable values
        if (parsedSiteId <= 0 || parsedVersion <= 0) {
            log.warn(
                { siteId: parsedSiteId, version: parsedVersion },
                "Hotjar configuration invalid: values must be positive numbers",
            );
            return;
        }

        // Initialize Hotjar with proper error handling and timeout
        const initTimeout = setTimeout(() => {
            log.warn("Hotjar initialization timed out");
        }, 5000);

        Hotjar.init(parsedSiteId, parsedVersion, {
            debug: process.env.NODE_ENV === "development",
        });

        clearTimeout(initTimeout);

        log.info(
            { siteId: parsedSiteId, version: parsedVersion },
            "Hotjar initialized successfully",
        );
    } catch (error) {
        // Log error but don't throw to prevent app crashes
        log.warn({ error }, "Failed to initialize Hotjar");

        // Additional safety: if Hotjar fails, ensure it doesn't break the app
        if (typeof window !== "undefined") {
            // Provide a minimal fallback to prevent undefined errors
            (window as any).hj = (window as any).hj || (() => {});
        }
    }
};

export { initHotjar };
