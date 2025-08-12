'use client';

import { log } from '@repo/shared/logger';
import { useEffect } from 'react';
import { scan } from 'react-scan';
import { REACT_SCAN_CONFIG } from '../lib/config/react-scan';

/**
 * React Scan Performance Monitoring Component
 *
 * Integrates React Scan for development performance monitoring.
 * Helps identify slow renders and unnecessary re-renders in the app.
 *
 * Only runs in development by default to avoid production overhead.
 * Configuration can be customized via environment variables.
 */
export function ReactScan() {
    useEffect(() => {
        // Multiple safety checks to ensure React Scan ONLY runs in development
        if (!REACT_SCAN_CONFIG.shouldRun) {
            // Early exit if not in development or in deployment environment
            return;
        }

        // Additional runtime safety check
        if (process.env.NODE_ENV !== 'development') {
            return;
        }

        // Check for deployment environment indicators
        if (REACT_SCAN_CONFIG.isDeployment) {
            return;
        }

        try {
            scan({
                enabled: true,
                log: REACT_SCAN_CONFIG.log,
                showToolbar: REACT_SCAN_CONFIG.showToolbar,
                animationSpeed: REACT_SCAN_CONFIG.animationSpeed,
                trackUnnecessaryRenders: REACT_SCAN_CONFIG.trackUnnecessaryRenders,
                dangerouslyForceRunInProduction: false, // Always false for safety

                // Callback functions for monitoring
                onCommitStart: () => {
                    // Track commit start times if needed for analytics
                },

                onRender: (fiber, renders) => {
                    // Log slow renders in development for debugging
                    if (REACT_SCAN_CONFIG.log && renders.length > 0) {
                        const slowRenders = renders.filter(
                            (render) => (render.time ?? 0) > REACT_SCAN_CONFIG.slowRenderThreshold,
                        );

                        if (slowRenders.length > 0 && process.env.NODE_ENV === 'development') {
                            log.debug(
                                {
                                    component: fiber.type?.name || fiber.type || 'Unknown',
                                    slowRenders: slowRenders.map((r) => ({
                                        time: r.time,
                                        phase: r.phase,
                                    })),
                                },
                                '[React Scan] Slow renders detected',
                            );
                        }
                    }
                },

                onCommitFinish: () => {
                    // Track commit completion for performance analytics
                },

                onPaintStart: (outlines) => {
                    // Track when render highlighting starts
                    if (
                        REACT_SCAN_CONFIG.log
                        && outlines.length > 5
                        && process.env.NODE_ENV === 'development'
                    ) {
                        log.debug(
                            {
                                outlinesCount: outlines.length,
                            },
                            '[React Scan] Heavy render cycle detected',
                        );
                    }
                },

                onPaintFinish: (_outlines) => {
                    // Track when render highlighting completes
                },
            });

            if (process.env.NODE_ENV === 'development') {
                log.info(
                    {
                        environment: process.env.NODE_ENV,
                        trackUnnecessaryRenders: REACT_SCAN_CONFIG.trackUnnecessaryRenders,
                        logging: REACT_SCAN_CONFIG.log,
                        deployment: REACT_SCAN_CONFIG.isDeployment,
                    },
                    '[React Scan] Performance monitoring initialized',
                );
            }
        } catch (error) {
            // Always log errors
            log.error({ error }, '[React Scan] Failed to initialize');
        }
    }, []);

    // Return null as this is just a monitoring component
    return null;
}
