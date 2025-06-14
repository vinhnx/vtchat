import { useSubscriptionAccess } from '@repo/common/hooks/use-subscription-access';
import { useChatStore } from '@repo/common/store';
import { ChatModeConfig } from '@repo/shared/config';
import { useSession } from '@repo/shared/lib/auth-client';
import { FeatureSlug } from '@repo/shared/types/subscription';
import { Button, Tooltip } from '@repo/ui';
import { IconPaperclip } from '@tabler/icons-react';
import { FC, useState } from 'react';
import { GatedFeatureAlert } from '../gated-feature-alert';
import { LoginRequiredDialog } from '../login-required-dialog';

// Create a wrapper component for IconPaperclip to match expected icon prop type
const PaperclipIcon: React.ComponentType<{ size?: number; className?: string }> = ({
    size,
    className,
}) => <IconPaperclip size={size} className={className} />;

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
    const chatMode = useChatStore(state => state.chatMode);
    const { data: session } = useSession();
    const isSignedIn = !!session;
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const { canAccess } = useSubscriptionAccess();

    const chatModeConfig = ChatModeConfig[chatMode];
    const requiresVTPlusForImageUpload =
        chatModeConfig?.requiredPlan || chatModeConfig?.requiredFeature;

    const handleFileSelect = () => {
        if (!isSignedIn) {
            setShowLoginPrompt(true);
            return;
        }

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
            <input type="file" id={id} className="hidden" onChange={handleImageUpload} />
            <Tooltip content={tooltip}>
                {showIcon ? (
                    <Button variant="ghost" size="icon-sm" onClick={handleFileSelect}>
                        <IconPaperclip size={16} strokeWidth={2} />
                    </Button>
                ) : (
                    <Button variant="bordered" onClick={handleFileSelect}>
                        {label}
                    </Button>
                )}
            </Tooltip>

            {/* Login prompt dialog */}
            <LoginRequiredDialog
                isOpen={showLoginPrompt}
                onClose={() => setShowLoginPrompt(false)}
                title="Login Required"
                description="Please log in to upload and attach files to your messages."
                icon={PaperclipIcon}
            />
        </>
    );

    // If chat mode requires VT+ subscription, wrap with GatedFeatureAlert
    if (requiresVTPlusForImageUpload && isSignedIn) {
        return (
            <GatedFeatureAlert
                requiredFeature={chatModeConfig?.requiredFeature}
                requiredPlan={chatModeConfig?.requiredPlan}
                title="Image Upload Requires VT+"
                message="Image upload with advanced models is a VT+ feature. Upgrade to access enhanced AI capabilities."
            >
                {imageUploadButton}
            </GatedFeatureAlert>
        );
    }

    return imageUploadButton;
};
