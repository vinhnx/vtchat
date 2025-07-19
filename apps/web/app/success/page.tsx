import { CreemCheckoutProcessor, FullPageLoader } from "@repo/common/components";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Processing Payment | VT Chat",
    description: "Processing your payment and updating your account...",
};

function ProcessingMessage() {
    return <FullPageLoader label="Processing your payment..." />;
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
