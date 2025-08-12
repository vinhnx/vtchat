export enum PdfWorkerConfig {
    CdnBase = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js',
}

export const pdfWorkerVersion = process.env.NEXT_PUBLIC_PDFJS_VERSION ?? '5.4.54';

export const getPdfWorkerUrl = (): string =>
    `${PdfWorkerConfig.CdnBase}/${pdfWorkerVersion}/pdf.worker.min.mjs`;
