'use client';

import { useSession } from '@/lib/auth-client';
import { Button } from '@repo/ui';
import Link from 'next/link';

export default function Home() {
    const { data: session } = useSession();

    return (
        <div className="flex min-h-screen flex-col">
            <header className="flex items-center justify-between border-b p-4">
                <h1 className="text-xl font-semibold">VT</h1>
                {session ? (
                    <Link href="/chat">
                        {/* @ts-ignore - Type compatibility issue between React versions */}
                        <Button variant="default" size="sm">
                            Go to Chat
                        </Button>
                    </Link>
                ) : (
                    <Link href="/login">
                        {/* @ts-ignore - Type compatibility issue between React versions */}
                        <Button variant="default" size="sm">
                            Sign In
                        </Button>
                    </Link>
                )}
            </header>
            <div className="flex flex-1 items-center justify-center p-8">
                <div className="max-w-2xl space-y-6 text-center">
                    <h1 className="text-4xl font-bold">VT</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Welcome to VT - Your intelligent conversation companion.
                    </p>
                </div>
            </div>
        </div>
    );
}
