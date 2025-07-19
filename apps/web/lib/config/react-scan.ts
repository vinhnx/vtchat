/**
 * React Scan Configuration
 *
 * Centralized configuration for React Scan performance monitoring
 */

export const REACT_SCAN_CONFIG = {
    // Enable React Scan ONLY in development mode - never in production
    enabled:
        process.env.NODE_ENV === "development" && !process.env.VERCEL && !process.env.FLY_APP_NAME,

    // Force enable in all environments (STRONGLY not recommended and disabled by default)
    forceEnabledInProduction:
        process.env.REACT_SCAN_FORCE_PRODUCTION === "true" &&
        process.env.NODE_ENV === "development",

    // Enable console logging (can impact performance) - only in development
    log: process.env.REACT_SCAN_LOG === "true" && process.env.NODE_ENV === "development",

    // Show the React Scan toolbar - only in development
    showToolbar:
        process.env.NODE_ENV === "development" && !process.env.VERCEL && !process.env.FLY_APP_NAME,

    // Animation speed for highlighting renders
    animationSpeed: "fast" as const,

    // Track unnecessary renders (can add overhead) - only in development
    trackUnnecessaryRenders:
        process.env.NODE_ENV === "development" && !process.env.VERCEL && !process.env.FLY_APP_NAME,

    // Render time threshold for logging slow renders (in milliseconds)
    slowRenderThreshold: parseInt(process.env.REACT_SCAN_SLOW_THRESHOLD || "10", 10),

    // Additional safety checks for deployment environments
    isDeployment: !!(
        process.env.VERCEL ||
        process.env.FLY_APP_NAME ||
        process.env.NETLIFY ||
        process.env.RENDER
    ),

    // Final safety check - must be development AND not in any deployment environment AND explicitly enabled
    shouldRun:
        process.env.REACT_SCAN_ENABLED === "true" &&
        process.env.NODE_ENV === "development" &&
        !process.env.VERCEL &&
        !process.env.FLY_APP_NAME &&
        !process.env.NETLIFY &&
        !process.env.RENDER &&
        !process.env.RAILWAY_ENVIRONMENT &&
        !process.env.HEROKU_APP_NAME,
} as const;

/**
 * Environment variables for React Scan configuration:
 *
 * REACT_SCAN_ENABLED=true - Enable React Scan (required to run)
 * REACT_SCAN_FORCE_PRODUCTION=true - Force enable in production (STRONGLY NOT RECOMMENDED and only works in dev)
 * REACT_SCAN_LOG=true - Enable console logging (only works in development)
 * REACT_SCAN_SLOW_THRESHOLD=20 - Set threshold for slow render detection (default: 10ms)
 *
 * Safety Features:
 * - Only runs when NODE_ENV === 'development' AND REACT_SCAN_ENABLED=true
 * - Disabled on all deployment platforms (Vercel, Fly.io, Netlify, Render, Railway, Heroku)
 * - Multiple environment checks prevent accidental production activation
 * - Even force production flag is limited to development environment only
 */
