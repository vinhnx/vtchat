'use client';

import { useSubscriptionAccess } from '@repo/common/hooks/use-subscription-access';
import { useChatStore } from '@repo/common/store';
import { ChatModeConfig } from '@repo/shared/config';
import { useSession } from '@repo/shared/lib/auth-client';
import { FeatureSlug } from '@repo/shared/types/subscription';
import { Button, Tooltip } from '@repo/ui';
import { Image } from 'lucide-react';
import { type FC } from 'react';
import { GatedFeatureAlert } from '../gated-feature-alert';

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
    const { data: session } = useSession();
    const isSignedIn = !!session;
    const { canAccess } = useSubscriptionAccess();

    // Check if an image is attached
    const hasImageAttached = imageAttachment?.file || imageAttachment?.base64;

    const chatModeConfig = ChatModeConfig[chatMode];
    const requiresVTPlusForImageUpload = chatModeConfig?.requiredPlan
        || chatModeConfig?.requiredFeature;

    const handleFileSelect = () => {
        // Do not block selection for unauthenticated users; enforce auth on send
        // Check subscription requirements for current chat mode
        if (requiresVTPlusForImageUpload) {
            const requiredFeature = chatModeConfig?.requiredFeature;
            const hasAccess = requiredFeature
                ? canAccess(requiredFeature)
                : canAccess(FeatureSlug.ADVANCED_CHAT_MODES);

            if (!hasAccess) {
                // Let GatedFeatureAlert handle this via the wrapper
                return;
            }
        }

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

    // If chat mode requires VT+ subscription, wrap with GatedFeatureAlert
    if (requiresVTPlusForImageUpload && isSignedIn) {
        return (
            <GatedFeatureAlert
                message='Image upload with advanced models is a VT+ feature. Upgrade to access enhanced AI capabilities.'
                requiredFeature={chatModeConfig?.requiredFeature}
                requiredPlan={chatModeConfig?.requiredPlan}
                title='Image Upload Requires VT+'
            >
                {imageUploadButton}
            </GatedFeatureAlert>
        );
    }

    return imageUploadButton;
};
