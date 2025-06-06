import ChatSessionClient from './chat-session-client';

// Server component that handles async params
const ChatSessionPage = async ({ params }: { params: Promise<{ threadId: string }> }) => {
    const { threadId } = await params;
    return <ChatSessionClient threadId={threadId} />;
};

export default ChatSessionPage;
