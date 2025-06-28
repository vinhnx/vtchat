import type React from 'react';

interface ShineTextProps {
    children: React.ReactNode;
    className?: string;
}

export const ShineText = ({ children, className = '' }: ShineTextProps) => {
    return (
        <span className={`relative inline-flex ${className}`}>
            {/* Fallback text (visible if gradient clipping fails) */}
            <span className="text-foreground">
                {children}
            </span>
            {/* Shine effect overlay */}
            <span
                className="absolute inset-0 dark:hidden"
                style={{
                    background: 'linear-gradient(110deg, #1e293b 0%, #64748b 45%, #1e293b 55%, #64748b 100%)',
                    backgroundSize: '250% 100%',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                    animation: 'background-shine 3s ease-in-out infinite'
                }}
            >
                {children}
            </span>
            {/* Dark theme shine effect overlay */}
            <span
                className="absolute inset-0 hidden dark:block"
                style={{
                    background: 'linear-gradient(110deg, #f8fafc 0%, #cbd5e1 45%, #f8fafc 55%, #cbd5e1 100%)',
                    backgroundSize: '250% 100%',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                    animation: 'background-shine 3s ease-in-out infinite'
                }}
            >
                {children}
            </span>
        </span>
    );
};
