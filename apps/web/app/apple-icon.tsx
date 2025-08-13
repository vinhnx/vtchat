import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
    width: 180,
    height: 180,
};
export const contentType = 'image/png';

// Image generation
export default function AppleIcon() {
    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 48,
                    background: '#BFB38F',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#262626',
                    fontWeight: 'bold',
                    borderRadius: '16px',
                }}
            >
                VT
            </div>
        ),
        {
            ...size,
        },
    );
}
