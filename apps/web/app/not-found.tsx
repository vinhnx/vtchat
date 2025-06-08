import { FC } from 'react';

const NotFound: FC = () => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                textAlign: 'center',
                gap: '1rem',
            }}
        >
            <h3>Page not found</h3>
            <a
                href="/"
                style={{
                    color: '#BFB38F',
                    textDecoration: 'underline',
                }}
            >
                Go back home
            </a>
        </div>
    );
};

export default NotFound;
