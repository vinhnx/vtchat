'use client';

import { Thread } from '@repo/common/components';

const ChatPage = () => {
    return (
        <div className="flex h-screen flex-col">
            <div className="flex-grow overflow-y-auto">
                <Thread />
            </div>
        </div>
    );
};

export default ChatPage;
