'use client';

import { useChatStore } from '@repo/common/store';
import { ChatModeConfig } from '@repo/shared/config';
import { Button, Tooltip } from '@repo/ui';
import { Image } from 'lucide-react';
import { type FC } from 'react';

export type TImageUpload = {
    id: string;
    label: string;
    tooltip: string;
    showIcon: boolean;
    handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export const ImageUpload: FC<TImageUpload> = ({
    id,
    label,
    tooltip,
    showIcon,
    handleImageUpload,
}) => {
    const chatMode = useChatStore((state) => state.chatMode);
    const imageAttachment = useChatStore((state) => state.imageAttachment);

    // Check if an image is attached
    const hasImageAttached = imageAttachment?.file || imageAttachment?.base64;

    const chatModeConfig = ChatModeConfig[chatMode];

    const handleFileSelect = () => {
        document.getElementById(id)?.click();
    };

    if (!chatModeConfig?.imageUpload) {
        return null;
    }

    const imageUploadButton = (
        <>
            <label htmlFor={id} className='sr-only'>
                {label}
            </label>
            <input
                className='hidden'
                id={id}
                onChange={handleImageUpload}
                type='file'
                accept='image/*'
                aria-label={label}
            />
            <Tooltip
                content={hasImageAttached
                    ? `Image attached: ${imageAttachment?.file?.name || 'Unknown'}`
                    : tooltip}
            >
                {showIcon
                    ? (
                        <Button
                            className={hasImageAttached
                                ? 'border-blue-300 bg-blue-100 hover:bg-blue-200'
                                : ''}
                            onClick={handleFileSelect}
                            size='icon-sm'
                            variant={hasImageAttached ? 'default' : 'ghost'}
                        >
                            <Image size={16} strokeWidth={2} />
                        </Button>
                    )
                    : (
                        <Button
                            className={hasImageAttached
                                ? 'border-blue-300 bg-blue-100 hover:bg-blue-200'
                                : ''}
                            onClick={handleFileSelect}
                            variant={hasImageAttached ? 'default' : 'bordered'}
                        >
                            {label}
                        </Button>
                    )}
            </Tooltip>

            {/* Login prompt is handled on send; no immediate dialog here */}
        </>
    );

    return imageUploadButton;
};
