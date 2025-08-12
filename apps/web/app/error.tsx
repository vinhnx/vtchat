'use client';

// Standalone error page without any imports to avoid context issues during build
interface ErrorPageProps {
    error: Error & { digest?: string; };
    reset: () => void;
}

export default function ErrorPage({ reset }: ErrorPageProps) {
    const handleHomeNavigation = () => {
        window.location.href = '/';
    };

    return (
        <div
            style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                backgroundColor: 'hsl(0 0% 100%)',
                color: 'hsl(0 0% 3.9%)',
                display: 'flex',
                minHeight: '100vh',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1.5,
            }}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: '28rem',
                    padding: '1.5rem',
                    textAlign: 'center',
                }}
            >
                <h1
                    style={{
                        marginBottom: '0.75rem',
                        fontSize: '1.125rem',
                        fontWeight: 500,
                    }}
                >
                    Something went wrong
                </h1>
                <p
                    style={{
                        marginBottom: '1rem',
                        fontSize: '0.875rem',
                        color: 'hsl(0 0% 45.1%)',
                    }}
                >
                    An unexpected error occurred. Please try again.
                </p>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '0.75rem',
                    }}
                >
                    <button
                        onClick={reset}
                        style={{
                            display: 'inline-flex',
                            height: '2.25rem',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '0.375rem',
                            padding: '0.5rem 1rem',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: 'hsl(0 0% 9%)',
                            color: 'hsl(0 0% 98%)',
                            boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                            transition: 'background-color 0.2s',
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = 'hsl(0 0% 9% / 0.9)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = 'hsl(0 0% 9%)';
                        }}
                    >
                        Try again
                    </button>
                    <button
                        onClick={handleHomeNavigation}
                        style={{
                            display: 'inline-flex',
                            height: '2.25rem',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '0.375rem',
                            padding: '0.5rem 1rem',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            backgroundColor: 'hsl(0 0% 100%)',
                            color: 'hsl(0 0% 3.9%)',
                            border: '1px solid hsl(0 0% 89.1%)',
                            boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                            transition: 'background-color 0.2s',
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = 'hsl(0 0% 96.1%)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = 'hsl(0 0% 100%)';
                        }}
                    >
                        Back to VT
                    </button>
                </div>
            </div>
        </div>
    );
}
