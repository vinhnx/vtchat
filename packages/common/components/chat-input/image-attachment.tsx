import { useChatStore } from "@repo/common/store";
import { Button, Flex } from "@repo/ui";
import { X } from "lucide-react";
import Image from "next/image";

export const ImageAttachment = () => {
    const attachment = useChatStore((state) => state.imageAttachment);
    const clearAttachment = useChatStore((state) => state.clearImageAttachment);
    if (!attachment?.base64) return null;

    return (
        <Flex className="pl-2 pr-2 pt-2 md:pl-3" gap="sm">
            <div className="relative h-[40px] w-[40px] rounded-lg border border-black/10 shadow-sm dark:border-white/10">
                <Image
                    alt="uploaded image"
                    className="h-full w-full overflow-hidden rounded-lg object-cover"
                    height={0}
                    src={attachment.base64}
                    width={0}
                />

                <Button
                    className="absolute right-[-4px] top-[-4px] z-10 h-4 w-4 flex-shrink-0"
                    onClick={clearAttachment}
                    size={"icon-xs"}
                    variant="default"
                >
                    <X size={12} strokeWidth={2} />
                </Button>
            </div>
        </Flex>
    );
};
