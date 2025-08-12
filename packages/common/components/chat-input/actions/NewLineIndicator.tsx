'use client';

import { useChatStore } from '@repo/common/store';
import { Kbd } from '@repo/ui';

export function NewLineIndicator() {
    const editor = useChatStore((state) => state.editor);
    const hasTextInput = !!editor?.getText();

    if (!hasTextInput) return null;

    return (
        <p className='flex flex-row items-center gap-1 text-xs text-gray-500'>
            use <Kbd>Shift</Kbd> <Kbd>Enter</Kbd> for new line
        </p>
    );
}
