'use client';

import { useSpring } from '@react-spring/web';
import createGlobe from 'cobe';
import { useEffect, useRef } from 'react';

type CobeGlobeProps = {
    className?: string;
};

// Convert hex to normalized RGB tuple [0..1]
function hexToRgbNorm(hex: string): [number, number, number] {
    const v = hex.replace('#', '');
    const r = parseInt(v.substring(0, 2), 16) / 255;
    const g = parseInt(v.substring(2, 4), 16) / 255;
    const b = parseInt(v.substring(4, 6), 16) / 255;
    return [r, g, b];
}

export function CobeGlobe({ className }: CobeGlobeProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const pointerInteracting = useRef<number | null>(null);
    const pointerMovement = useRef(0);
    const [{ r }, api] = useSpring(() => ({
        r: 0,
        config: { mass: 1, tension: 280, friction: 40, precision: 0.001 },
    }));

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let phi = 0;
        let width = 0;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        const onResize = () => {
            width = canvas.offsetWidth;
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(width * dpr);
        };

        window.addEventListener('resize', onResize);
        onResize();

        // Palette
        const PALETTE = {
            neutral: '#262626',
            sand: '#BFB38F',
            amber: '#D99A4E',
            red: '#BF4545',
        } as const;

        const markerColor = hexToRgbNorm(PALETTE.sand);
        // White glow
        const glow = hexToRgbNorm('#FFFFFF');

        const globe = createGlobe(canvas, {
            devicePixelRatio: dpr,
            width: canvas.width,
            height: canvas.height,
            phi: 0,
            theta: 0.3,
            dark: 0,
            diffuse: 3,
            mapSamples: 16000,
            mapBrightness: 1.2,
            // Shrink the globe within the canvas
            scale: 0.8,
            baseColor: [1, 1, 1],
            markerColor,
            glowColor: glow,
            markers: [
                { location: [37.7595, -122.4367], size: 0.03 },
                { location: [40.7128, -74.006], size: 0.1 },
            ],
            onRender: (state) => {
                if (pointerInteracting.current === null) {
                    phi += 0.005;
                }
                state.phi = phi + r.get();
                state.width = canvas.width;
                state.height = canvas.height;
            },
        });

        canvas.style.opacity = '1';

        return () => {
            globe.destroy();
            window.removeEventListener('resize', onResize);
        };
    }, [r]);

    return (
        <div
            className={className}
            style={{
                position: 'absolute',
                inset: 0,
                // Subtle, light radial shade behind the globe
                background:
                    'radial-gradient(60% 60% at 50% 40%, rgba(191,179,143,0.18), rgba(191,179,143,0.06) 45%, transparent 75%)',
            }}
        >
            <canvas
                ref={canvasRef}
                onPointerDown={(e) => {
                    pointerInteracting.current = e.clientX - pointerMovement.current;
                    if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
                }}
                onPointerUp={() => {
                    pointerInteracting.current = null;
                    if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
                    // Smoothly ease back to the auto-rotate baseline
                    api.start({ r: 0 });
                }}
                onPointerOut={() => {
                    pointerInteracting.current = null;
                    if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
                    api.start({ r: 0 });
                }}
                onPointerMove={(e) => {
                    if (pointerInteracting.current !== null) {
                        const delta = e.clientX - pointerInteracting.current;
                        pointerMovement.current = delta;
                        api.start({ r: delta / 200 });
                    }
                }}
                onTouchMove={(e) => {
                    if (pointerInteracting.current !== null && e.touches[0]) {
                        const delta = e.touches[0].clientX - pointerInteracting.current;
                        pointerMovement.current = delta;
                        api.start({ r: delta / 100 });
                    }
                }}
                style={{
                    width: '100%',
                    height: '100%',
                    cursor: 'grab',
                    touchAction: 'none',
                    contain: 'layout paint size',
                    opacity: 0,
                    transition: 'opacity 1s ease',
                    display: 'block',
                }}
                aria-hidden='true'
            />
        </div>
    );
}
