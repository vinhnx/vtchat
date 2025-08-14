"use client";

import { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

// Convert hex to normalized RGB tuple [0..1]
function hexToRgbNorm(hex: string): [number, number, number] {
    const v = hex.replace('#', '');
    const r = parseInt(v.substring(0, 2), 16) / 255;
    const g = parseInt(v.substring(2, 4), 16) / 255;
    const b = parseInt(v.substring(4, 6), 16) / 255;
    return [r, g, b];
}

export function CobeGlobeScaled() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        let width = 0;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const onResize = () => {
            if (!canvasRef.current) return;
            width = canvasRef.current.offsetWidth;
        };

        window.addEventListener('resize', onResize);
        onResize();

        const markerColor = hexToRgbNorm('#BFB38F');
        // White glow
        const glowColor = hexToRgbNorm('#FFFFFF');

        const globe = createGlobe(canvas, {
            devicePixelRatio: dpr,
            width: width * 2,
            height: width * 2 * 0.4,
            phi: 0,
            theta: 0.3,
            dark: 0,
            diffuse: 3,
            mapSamples: 16000,
            mapBrightness: 1.2,
            baseColor: [1, 1, 1],
            markerColor,
            glowColor,
            markers: [],
            // Smaller globe and pushed down so only a small top sliver peeks
            scale: 1.8,
            offset: [0, width * 2 * 0.4 * 0.75],
            onRender: (state) => {
                state.width = width * 2;
                state.height = width * 2 * 0.4;
            },
        });

        setTimeout(() => {
            if (canvasRef.current) canvasRef.current.style.opacity = '1';
        });

        return () => {
            globe.destroy();
            window.removeEventListener('resize', onResize);
        };
    }, []);

    return (
        <div
            style={{
                width: '100%',
                aspectRatio: 1 / 0.4,
                margin: 'auto',
                position: 'relative',
            }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    width: '100%',
                    height: '100%',
                    contain: 'layout paint size',
                    opacity: 0,
                    transition: 'opacity 1s ease',
                }}
                aria-hidden='true'
            />
        </div>
    );
}
