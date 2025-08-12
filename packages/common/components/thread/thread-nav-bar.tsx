'use client';

import { useChatStore } from '@repo/common/store';
import type { Thread } from '@repo/shared/types';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

export const ThreadNavBar = () => {
    const { threadId: currentThreadId } = useParams();
    const getThread = useChatStore(useShallow((state) => state.getThread));
    const [thread, setThread] = useState<Thread | null>(null);
    useEffect(() => {
        getThread(currentThreadId?.toString() ?? '').then(setThread);
    }, [currentThreadId]);
    return (
        <div className='border-border bg-secondary absolute left-0 right-0 top-0 z-[100] flex h-10 w-full flex-row items-center justify-center border-b px-4 md:px-2'>
            <p className='line-clamp-1 max-w-xs text-xs font-medium md:max-w-xl md:text-sm'>
                {thread?.title}
            </p>
        </div>
    );
};
