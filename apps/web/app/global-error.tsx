'use client';

import Error from 'next/error';

export default function GlobalError({ error }: { error: Error }) {
    // Global error handling without Sentry

    return (
        <html>
            <body>
                <div className="flex h-screen w-screen flex-col items-center justify-center bg-emerald-50">
                    <div className="flex w-[300px] flex-col gap-2">
                        <p className="text-base">Oops! Something went wrong.</p>
                        <p className="text-brand text-sm">
                            It seems we encountered an unexpected error. Please try refreshing the
                            page or check back later. If the problem persists, feel free to{' '}
                            <a href="mailto:hello@vtai.vn">contact</a>.
                        </p>
                    </div>
                </div>
            </body>
        </html>
    );
}
