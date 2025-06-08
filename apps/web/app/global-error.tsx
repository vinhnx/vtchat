'use client';

import Error from 'next/error';

export default function GlobalError({ error }: { error: Error }) {
    return (
        <html>
            <body>
                <div className="flex h-screen w-screen flex-col items-center justify-center bg-emerald-50">
                    <div className="flex w-[300px] flex-col gap-2">
                        <small className="text-sm font-medium leading-none">
                            It seems we encountered an unexpected error. Please try refreshing the
                            page or check back later.
                        </small>
                    </div>
                </div>
            </body>
        </html>
    );
}
