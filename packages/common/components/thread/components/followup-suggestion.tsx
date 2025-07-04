import { useChatStore } from '@repo/common/store';
import { Button } from '@repo/ui';
import type { Editor } from '@tiptap/react';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';

export const FollowupSuggestions = ({ suggestions }: { suggestions: string[] }) => {
    const editor: Editor | undefined = useChatStore(useShallow((state) => state.editor));

    if (!suggestions || suggestions?.length === 0) {
        return null;
    }

    return (
        <motion.div
            animate={{ opacity: 1 }}
            className="border-border my-4 flex flex-col items-start gap-2 border-t border-dashed py-4"
            initial={{ opacity: 0 }}
        >
            <div className="text-muted-foreground flex flex-row items-center gap-1.5 py-2 text-xs font-medium">
                <HelpCircle className="text-muted-foreground" size={16} strokeWidth={2} /> Ask
                Followup
            </div>
            <motion.div
                animate="show"
                className="flex flex-col gap-2"
                initial="hidden"
                variants={{
                    show: {
                        transition: {
                            staggerChildren: 0.1,
                        },
                    },
                }}
            >
                {suggestions?.map((suggestion) => (
                    <motion.div
                        key={suggestion}
                        variants={{
                            hidden: { opacity: 0, y: 10 },
                            show: { opacity: 1, y: 0 },
                        }}
                    >
                        <Button
                            className=" hover:text-brand group h-auto min-h-7 max-w-full cursor-pointer justify-start overflow-hidden whitespace-normal py-1.5 text-left"
                            onClick={() => {
                                editor?.commands.clearContent();
                                editor?.commands.insertContent(suggestion);
                            }}
                            rounded="lg"
                            size="default"
                            variant="bordered"
                        >
                            {suggestion}
                        </Button>
                    </motion.div>
                ))}
            </motion.div>
        </motion.div>
    );
};
