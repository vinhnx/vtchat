'use client';

import { log } from '@repo/shared/logger';
import { TypographyH3 } from '@repo/ui';

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';

export default function GlobalError({ error }: { error: Error }) {
    log.error({ error }, 'Global error encountered');
    return (
        <html>
            <body>
                <div
                    style={{
                        display: 'flex',
                        height: '100vh',
                        width: '100vw',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f9fafb',
                        fontFamily:
                            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            width: '300px',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            textAlign: 'center',
                        }}
                    >
                        <TypographyH3 style={{ margin: 0, fontSize: '1.25rem', color: '#374151' }}>
                            Something went wrong
                        </TypographyH3>
                        <p
                            style={{
                                margin: 0,
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                lineHeight: '1.25',
                                color: '#6b7280',
                            }}
                        >
                            It seems we encountered an unexpected error. Please try refreshing the
                            page or check back later.
                        </p>
                        <a
                            href="/"
                            style={{
                                color: '#BFB38F',
                                textDecoration: 'underline',
                                fontSize: '0.875rem',
                                marginTop: '1rem',
                            }}
                        >
                            Go back home
                        </a>
                    </div>
                </div>
            </body>
        </html>
    );
}
