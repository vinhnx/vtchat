import { ChatInput } from '@repo/common/components';

export default async function ChatPageLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ threadId: string }>;
}) {
    // We await params but don't need to use threadId in the layout
    await params;
    return (
        <div className="relative flex h-full w-full flex-col">
            {children}
            <ChatInput />
        </div>
    );
}
