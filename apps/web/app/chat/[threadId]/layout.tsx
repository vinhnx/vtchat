import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const appName = process.env.NEXT_PUBLIC_APP_NAME || 'VT';

type Props = {
    params: Promise<{ threadId: string; }>;
    children: ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { threadId } = await params;
    return {
        title: `Chat Thread ${threadId} | ${appName}`,
        description: `Conversation ${threadId} on ${appName} AI platform`,
    };
}

export function ThreadLayout({ children }: Props) {
    return <>{children}</>;
}

export default ThreadLayout;
