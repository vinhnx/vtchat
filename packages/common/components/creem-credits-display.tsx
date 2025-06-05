import { useUser } from '@clerk/nextjs';
import { useApiKeysStore, useAppStore, useChatStore, useCreditsStore } from '@repo/common/store';
import { CHAT_MODE_CREDIT_COSTS } from '@repo/shared/config';
import { Button } from '@repo/ui';
import { IconBoltFilled } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export function CreemCreditsDisplay() {
    const { user } = useUser();
    const router = useRouter();
    const chatMode = useChatStore(state => state.chatMode);
    const hasApiKeys = useApiKeysStore(state => state.hasApiKeyForChatMode(chatMode));
    const creditLimit = useChatStore(state => state.creditLimit);
    const setIsSettingsOpen = useAppStore(state => state.setIsSettingsOpen);
    const setSettingTab = useAppStore(state => state.setSettingTab);

    // Creem.io credits from our new store
    const { balance: creemCredits, isLoading: creditsLoading } = useCreditsStore();

    // Don't show if user has API keys or is not authenticated
    if (!user || hasApiKeys || creditsLoading) {
        return null;
    }

    // Calculate total available credits (Creem + daily)
    const dailyCredits = creditLimit.isFetched ? creditLimit.remaining || 0 : 0;
    const totalCredits = creemCredits + dailyCredits;

    // Calculate cost and remaining sessions
    const currentChatCost = CHAT_MODE_CREDIT_COSTS[chatMode] || 0;
    const remainingSessions =
        currentChatCost > 0 ? Math.floor(totalCredits / currentChatCost) : Infinity;

    // Only show if low on credits (<= 20 remaining)
    if (totalCredits > 20) {
        return null;
    }

    const handlePurchaseCredits = () => {
        router.push('/credits');
    };

    return (
        <div className="relative flex w-full items-center justify-center px-3">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="border-border bg-tertiary/70 -mt-2 flex h-auto w-full flex-col gap-2 rounded-b-xl border-x border-b p-3 font-medium"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <IconBoltFilled size={16} strokeWidth={2} className="text-amber-500" />
                        <span className="font-medium">{totalCredits} credits</span>
                        {currentChatCost > 0 && (
                            <span className="text-muted-foreground/60 text-xs">
                                (~{remainingSessions} {chatMode} sessions)
                            </span>
                        )}
                    </div>
                    <div className="flex gap-1 text-xs">
                        {creemCredits > 0 && (
                            <span className="text-muted-foreground/60">
                                {creemCredits} purchased
                            </span>
                        )}
                        {creemCredits > 0 && dailyCredits > 0 && (
                            <span className="text-muted-foreground/40">+</span>
                        )}
                        {dailyCredits > 0 && (
                            <span className="text-muted-foreground/60">{dailyCredits} daily</span>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-muted-foreground/50 text-xs">
                        {totalCredits === 0 ? (
                            <span className="text-red-500 dark:text-red-400">
                                You're out of credits!
                            </span>
                        ) : totalCredits < 10 ? (
                            <span className="text-amber-600 dark:text-amber-400">
                                Running low on credits
                            </span>
                        ) : (
                            <span>Need more credits?</span>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant={totalCredits < 10 ? 'default' : 'outlined'}
                            onClick={handlePurchaseCredits}
                            className="h-7 text-xs"
                        >
                            Buy Credits
                        </Button>

                        <Button
                            size="sm"
                            variant="outlined"
                            onClick={() => {
                                setIsSettingsOpen(true);
                                setSettingTab('api-keys');
                            }}
                            className="h-7 text-xs"
                        >
                            Add API Key
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
