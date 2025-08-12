'use client';
import type React from 'react';
import { useRef, useState } from 'react';

interface CardSpotlightPricingProps {
    children: React.ReactNode;
    className?: string;
}

export const CardSpotlightPricing = ({ children, className = '' }: CardSpotlightPricingProps) => {
    const divRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current || isFocused) return;

        const div = divRef.current;
        const rect = div.getBoundingClientRect();

        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleFocus = () => {
        setIsFocused(true);
        setOpacity(1);
    };

    const handleBlur = () => {
        setIsFocused(false);
        setOpacity(0);
    };

    const handleMouseEnter = () => {
        setOpacity(1);
    };

    const handleMouseLeave = () => {
        setOpacity(0);
    };

    return (
        <div
            className={`relative overflow-hidden transition-all duration-300 ${className}`}
            onBlur={handleBlur}
            onFocus={handleFocus}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
            ref={divRef}
        >
            <div
                className='pointer-events-none absolute -inset-px opacity-0 transition duration-300'
                style={{
                    opacity,
                    background:
                        `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(191,179,143,.15), transparent 40%)`,
                }}
            />
            {children}
        </div>
    );
};
