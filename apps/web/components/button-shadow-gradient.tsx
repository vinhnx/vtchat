'use client';

import { Button } from '@repo/ui';
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
        <Button variant='outline' className={className} onClick={onClick}>
            {children}
        </Button>
    );
};
