'use client';

import { useChatStore } from '@repo/common/store';
import { cn, Flex } from '@repo/ui';
import { type Editor, EditorContent } from '@tiptap/react';
import type { FC } from 'react';
import { useRef } from 'react';

export type TChatEditor = {
    sendMessage?: (message: string) => void;
    editor: Editor | null;
    maxHeight?: string;
    className?: string;
    placeholder?: string;
};

export const ChatEditor: FC<TChatEditor> = ({
    sendMessage,
    editor,
    placeholder,
    maxHeight = '160px',
    className,
}) => {
    const isGenerating = useChatStore((state) => state.isGenerating);
    const lastEnterTime = useRef<number>(0);

    if (!editor) return null;

    const editorContainerClass =
        'no-scrollbar [&>*]:no-scrollbar wysiwyg min-h-[48px] w-full cursor-text overflow-y-auto px-4 py-3 text-base outline-none focus:outline-none [&>*]:leading-6 [&>*]:outline-none [&>*]:break-all [&>*]:word-break-break-word [&>*]:whitespace-pre-wrap';

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (isGenerating) return;
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent default form submission

            // Debounce rapid Enter key presses
            const now = Date.now();
            if (now - lastEnterTime.current < 500) {
                return;
            }
            lastEnterTime.current = now;

            sendMessage?.(editor.getText());
        }
        if (e.key === 'Enter' && e.shiftKey) {
            e.preventDefault();
            e.currentTarget.scrollTop = e.currentTarget.scrollHeight;
        }
    };

    return (
        <Flex className='flex-1'>
            <EditorContent
                autoFocus
                aria-label={placeholder}
                className={cn(editorContainerClass, className)}
                disabled={isGenerating}
                editor={editor}
                onKeyDown={handleKeyDown}
                style={{
                    maxHeight,
                }}
            />
        </Flex>
    );
};
