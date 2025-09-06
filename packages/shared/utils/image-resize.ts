export async function resizeImageDataUrl(
    dataUrl: string,
    mimeType?: string,
    maxDim = 768,
    quality?: number,
): Promise<string> {
    return new Promise((resolve) => {
        try {
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width <= maxDim && height <= maxDim) {
                    resolve(dataUrl);
                    return;
                }

                if (width > height) {
                    height = Math.round((height / width) * maxDim);
                    width = maxDim;
                } else {
                    width = Math.round((width / height) * maxDim);
                    height = maxDim;
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(dataUrl);
                    return;
                }
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);

                const type = mimeType || 'image/png';
                const q = typeof quality === 'number'
                    ? quality
                    : type === 'image/jpeg'
                    ? 0.9
                    : undefined;
                const out = canvas.toDataURL(type, q as any);
                resolve(out || dataUrl);
            };
            img.onerror = () => resolve(dataUrl);
            img.src = dataUrl;
        } catch {
            resolve(dataUrl);
        }
    });
}
