'use client';

import { isDevTestMode } from '@repo/shared/utils';
import { useEffect, useState } from 'react';

export function DevTestModeBanner() {
    const [isDevMode, setIsDevMode] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setIsDevMode(isDevTestMode());
    }, []);

    // Don't render on server to avoid hydration mismatch
    if (!mounted) {
        return null;
    }

    if (!isDevMode) {
        return null;
    }

    return (
        <div className="fixed left-0 right-0 top-0 z-50 bg-yellow-500 p-2 text-center font-bold text-black shadow-lg">
            🚧 DEV TEST MODE ACTIVE - All restrictions bypassed
        </div>
    );
}

export function DevTestModeDebugPanel() {
    const [isDevMode, setIsDevMode] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        setMounted(true);
        setIsDevMode(isDevTestMode());

        // Log to console
        if (isDevTestMode()) {
            console.log('🚧 DEV TEST MODE: Active - All restrictions are bypassed');
        } else {
            console.log('🔒 DEV TEST MODE: Inactive - All restrictions are enforced');
        }
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <button
                onClick={() => setExpanded(!expanded)}
                className={`rounded-lg px-4 py-2 font-mono text-sm shadow-lg transition-all ${
                    isDevMode
                        ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                        : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
            >
                🚧 DEV MODE: {isDevMode ? 'ON' : 'OFF'}
            </button>

            {expanded && (
                <div className="absolute bottom-12 right-0 w-80 rounded-lg border border-gray-300 bg-white p-4 shadow-xl dark:border-gray-600 dark:bg-gray-800">
                    <h3 className="mb-3 text-lg font-bold">🚧 DEV TEST MODE Status</h3>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Environment Variable:</span>
                            <code className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-700">
                                {(typeof window !== 'undefined' &&
                                    process.env.NEXT_PUBLIC_DEV_TEST_MODE) ||
                                    'undefined'}
                            </code>
                        </div>

                        <div className="flex justify-between">
                            <span>Function Result:</span>
                            <code className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-700">
                                {isDevMode.toString()}
                            </code>
                        </div>

                        <hr className="my-3" />

                        <div className="space-y-1">
                            <div
                                className={`text-xs ${isDevMode ? 'text-green-600' : 'text-red-600'}`}
                            >
                                {isDevMode ? '✅' : '❌'} Subscription Requirements:{' '}
                                {isDevMode ? 'Bypassed' : 'Active'}
                            </div>
                            <div
                                className={`text-xs ${isDevMode ? 'text-green-600' : 'text-red-600'}`}
                            >
                                {isDevMode ? '✅' : '❌'} UI Gating:{' '}
                                {isDevMode ? 'Disabled' : 'Active'}
                            </div>
                        </div>

                        {isDevMode && (
                            <div className="mt-3 rounded border border-yellow-200 bg-yellow-50 p-2 text-xs dark:border-yellow-800 dark:bg-yellow-900/20">
                                <strong>⚠️ Warning:</strong> All access controls are disabled. This
                                should only be used for development and testing.
                            </div>
                        )}

                        <div className="mt-3 text-xs text-gray-500">
                            Check browser console for 🚧 logs to see bypasses in action.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
