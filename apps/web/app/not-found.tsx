import { FC } from 'react';

const NotFound: FC = () => {
    return (
        <html>
            <body>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100vh',
                        textAlign: 'center',
                        gap: '1rem',
                        backgroundColor: '#f9fafb',
                        fontFamily:
                            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    }}
                >
                    <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#374151' }}>
                        Page not found
                    </h3>
                    <a
                        href="/"
                        style={{
                            color: '#BFB38F',
                            textDecoration: 'underline',
                            fontSize: '1rem',
                        }}
                    >
                        Go back home
                    </a>
                </div>
            </body>
        </html>
    );
};

export default NotFound;
