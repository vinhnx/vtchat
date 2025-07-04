import { useAppStore } from '@repo/common/store';
import { useSession } from '@repo/shared/lib/auth-client';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@repo/ui';
import { Wrench } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useApiKeysStore } from '../store/api-keys.store';
import { useChatStore } from '../store/chat.store';

export const ToolsMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { data: session } = useSession();
    const isSignedIn = !!session;
    const apiKeys = useApiKeysStore();
    const chatMode = useChatStore((state) => state.chatMode);
    const hasApiKeyForChatMode = useApiKeysStore((state) => state.hasApiKeyForChatMode);
    const setIsSettingsOpen = useAppStore((state) => state.setIsSettingsOpen);
    const isToolsAvailable = useMemo(
        () => hasApiKeyForChatMode(chatMode, isSignedIn),
        [chatMode, hasApiKeyForChatMode, apiKeys, isSignedIn]
    );

    return (
        <>
            <DropdownMenu onOpenChange={setIsOpen} open={isOpen}>
                <DropdownMenuTrigger asChild>
                    <Button
                        className="gap-2"
                        disabled={true}
                        rounded="full"
                        size="icon"
                        tooltip="Tools (Coming Soon)"
                        variant={isOpen ? 'secondary' : 'ghost'} // Disabled since MCP is temporarily removed
                    >
                        <Wrench className="text-muted-foreground" size={18} strokeWidth={2} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[320px]" side="bottom">
                    <div className="flex h-[150px] flex-col items-center justify-center gap-2">
                        <Wrench className="text-muted-foreground" size={16} strokeWidth={2} />
                        <p className="text-muted-foreground text-sm">Tools Coming Soon</p>
                        <p className="text-muted-foreground px-4 text-center text-xs">
                            External tools integration is temporarily disabled for app optimization.
                        </p>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};
