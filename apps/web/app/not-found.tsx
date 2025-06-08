import Link from 'next/link';
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
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Page not found</h3>
            <Link
                href="/"
                style={{
                    color: '#BFB38F',
                    textDecoration: 'underline',
                }}
            >
                Go back home
            </Link>
        </div>
    );
};

export default NotFound;
