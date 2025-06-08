import { useChatStore } from '@repo/common/store';
import { ChatModeConfig } from '@repo/shared/config';
import { useSession } from '@repo/shared/lib/auth-client';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    Button,
    Tooltip,
} from '@repo/ui';
import { IconPaperclip } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { FC, useState } from 'react';

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
    const { push } = useRouter();

    const handleFileSelect = () => {
        if (!isSignedIn) {
            setShowLoginPrompt(true);
            return;
        }
        document.getElementById(id)?.click();
    };

    if (!ChatModeConfig[chatMode]?.imageUpload) {
        return null;
    }

    return (
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
            {showLoginPrompt && (
                <AlertDialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Login Required</AlertDialogTitle>
                            <AlertDialogDescription>
                                Please log in to upload and attach files to your messages.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => {
                                    setShowLoginPrompt(false);
                                    push('/login');
                                }}
                            >
                                Login
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </>
    );
};
