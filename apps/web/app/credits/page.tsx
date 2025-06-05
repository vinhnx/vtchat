import { auth } from '@clerk/nextjs/server';
import { CreemCreditsShop } from '@repo/common/components';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: 'Credits | VT Chat',
    description: 'Purchase credits for advanced chat modes and features',
};

export default async function CreditsPage() {
    // Require authentication for credits page
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in?redirect_url=/credits');
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8 text-center">
                    <h1 className="mb-4 text-3xl font-bold">Power Up Your Conversations</h1>
                    <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
                        Purchase credits to access advanced AI models and features, or subscribe to
                        VT+ for unlimited access and monthly credit allowance.
                    </p>
                </div>

                <CreemCreditsShop />
            </div>
        </div>
    );
}
