"use client";

import { FullPageLoader } from "./full-page-loader";

export type PaymentRedirectLoaderProps = {
    isLoading: boolean;
};

export const PaymentRedirectLoader = ({ isLoading }: PaymentRedirectLoaderProps) => {
    if (!isLoading) return null;

    return (
        <div className="bg-background/80 fixed inset-0 z-[9999] backdrop-blur-sm">
            <FullPageLoader />
        </div>
    );
};
