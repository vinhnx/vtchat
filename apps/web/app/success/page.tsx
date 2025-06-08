import { CreemCheckoutProcessor } from '@repo/common/components';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
    title: 'Processing Payment | VT Chat',
    description: 'Processing your payment and updating your account...',
};

function ProcessingMessage() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2"></div>
                <h1 className="mb-2 text-2xl font-semibold">Processing your payment...</h1>
                <p className="text-muted-foreground">Please wait while we update your account.</p>
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<ProcessingMessage />}>
            <div className="flex min-h-screen items-center justify-center">
                <CreemCheckoutProcessor />
                <ProcessingMessage />
            </div>
        </Suspense>
    );
}
