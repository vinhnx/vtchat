'use client';

import type React from 'react';

interface ButtonShadowGradientProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
}

export const ButtonShadowGradient = ({
    children,
    onClick,
    className = '',
}: ButtonShadowGradientProps) => {
    return (
        <button
            onClick={onClick}
            className={`relative inline-flex h-12 w-full items-center justify-center rounded-md border border-gray-200 bg-white px-6 font-medium text-gray-950 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-50 ${className}`}
        >
            <div className="absolute -inset-0.5 -z-10 rounded-lg bg-gradient-to-b from-[#BFB38F] to-[#D4C5A0] opacity-75 blur-sm" />
            {children}
        </button>
    );
};
