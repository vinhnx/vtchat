export type TReaderResponse = {
    success: boolean;
    title: string;
    url: string;
    markdown: string;
    error?: string;
};
export type TReaderResult = {
    success: boolean;
    title?: string;
    url?: string;
    markdown?: string;
};
export declare const readWebPagesWithTimeout: (urls: string[], timeoutMs?: number) => Promise<TReaderResult[]>;
//# sourceMappingURL=reader.d.ts.map