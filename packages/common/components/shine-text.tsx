import type React from 'react';

interface ShineTextProps {
    children: React.ReactNode;
    className?: string;
}

export const ShineText = ({ children, className = '' }: ShineTextProps) => {
    return (
        <span className={`relative inline-flex ${className}`}>
            {/* Fallback text (visible if gradient clipping fails) */}
            <span className='text-foreground'>{children}</span>
            {/* Shine effect overlay */}
            <span
                className='absolute inset-0 dark:hidden'
                style={{
                    background:
                        'linear-gradient(110deg, #64748b 0%, #94a3b8 45%, #64748b 55%, #94a3b8 100%)',
                    backgroundSize: '250% 100%',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                    animation: 'background-shine 3s ease-in-out infinite',
                }}
            >
                {children}
            </span>
            {/* Dark theme shine effect overlay */}
            <span
                className='absolute inset-0 hidden dark:block'
                style={{
                    background:
                        'linear-gradient(110deg, #94a3b8 0%, #cbd5e1 45%, #94a3b8 55%, #cbd5e1 100%)',
                    backgroundSize: '250% 100%',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                    animation: 'background-shine 3s ease-in-out infinite',
                }}
            >
                {children}
            </span>
        </span>
    );
};
