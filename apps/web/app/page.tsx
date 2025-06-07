'use client';

import {
    DevTestModeBanner,
    DevTestModeDebugPanel,
} from '@repo/common/components/dev-test-mode-banner';

export default function Home() {
    return (
        <>
            <DevTestModeBanner />
            <div className="flex min-h-screen items-center justify-center p-8">
                <div className="max-w-2xl space-y-6 text-center">
                    <h1 className="text-4xl font-bold">VTChat Development</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        DEV TEST MODE implementation is complete. Check the debug panel in the
                        bottom right to see the current status and verify that all access controls
                        can be bypassed.
                    </p>
                    <div className="rounded-lg bg-gray-100 p-6 dark:bg-gray-800">
                        <h2 className="mb-4 text-xl font-semibold">🚧 DEV TEST MODE Features</h2>
                        <ul className="space-y-2 text-left">
                            <li>✅ Credit system bypass</li>
                            <li>✅ Subscription requirement bypass</li>
                            <li>✅ UI gating bypass</li>
                            <li>✅ Server-side API bypass</li>
                            <li>✅ Client-side hook bypass</li>
                            <li>✅ Component-level bypass</li>
                        </ul>
                    </div>
                </div>
            </div>
            <DevTestModeDebugPanel />
        </>
    );
}
