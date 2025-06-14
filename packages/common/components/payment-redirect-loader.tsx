'use client';

import { FullPageLoader } from './full-page-loader';

export type PaymentRedirectLoaderProps = {
    isLoading: boolean;
    message?: string;
};

export const PaymentRedirectLoader = ({ 
    isLoading, 
    message = "Redirecting to secure payment..." 
}: PaymentRedirectLoaderProps) => {
    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-sm">
            <FullPageLoader label={message} />
        </div>
    );
};
