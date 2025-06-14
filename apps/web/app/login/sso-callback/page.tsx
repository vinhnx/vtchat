'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
    const router = useRouter();

    useEffect(() => {
        // Better Auth handles OAuth redirects automatically
        // Redirect to chat page or wherever the user was going
        router.push('/chat');
    }, [router]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div>Redirecting...</div>
        </div>
    );
}
