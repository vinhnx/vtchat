"use client";

import { useChatStore } from "@repo/common/store";
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DropdownMenu,
    DropdownMenuTrigger,
} from "@repo/ui";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { chatOptions, modelOptions } from "../../chat-config";
import { getIconByName } from "../../config/icons";
import { useChatModeAccess } from "../../hooks/useChatModeAccess";
import { ChatModeOptions } from "./ChatModeOptions";

export function ChatModeButton() {
    const chatMode = useChatStore((state) => state.chatMode);
    const setChatMode = useChatStore((state) => state.setChatMode);
    const [isChatModeOpen, setIsChatModeOpen] = useState(false);
    const { push } = useRouter();
    const [showGateAlert, setShowGateAlert] = useState<{
        feature?: string;
        plan?: string;
        title: string;
        message: string;
    } | null>(null);

    const { isGated } = useChatModeAccess(chatMode);

    const selectedOption =
        [...chatOptions, ...modelOptions].find((option) => option.value === chatMode) ??
        modelOptions[0];

    // Get the icon for the selected option
    const selectedIcon =
        selectedOption && "iconName" in selectedOption
            ? getIconByName(selectedOption.iconName as string)
            : selectedOption?.icon;

    // Get the provider icon for the selected option
    const selectedProviderIcon = (selectedOption as any)?.providerIcon;

    const handleGatedFeature = React.useCallback(
        (gateInfo: { feature?: string; plan?: string; title: string; message: string }) => {
            setShowGateAlert(gateInfo);
            setIsChatModeOpen(false);
        },
        [],
    );

    return (
        <>
            <DropdownMenu onOpenChange={setIsChatModeOpen} open={isChatModeOpen}>
                <DropdownMenuTrigger asChild>
                    <Button
                        className="border-muted-foreground/30 border"
                        size="xs"
                        variant={"secondary"}
                    >
                        {selectedProviderIcon && <div className="mr-1">{selectedProviderIcon}</div>}
                        {selectedIcon}
                        {selectedOption?.label}
                        <ChevronDown size={14} strokeWidth={2} />
                    </Button>
                </DropdownMenuTrigger>
                <ChatModeOptions
                    chatMode={chatMode}
                    onGatedFeature={handleGatedFeature}
                    setChatMode={setChatMode}
                />
            </DropdownMenu>

            {/* Gated Feature Alert Modal */}
            {showGateAlert && (
                <Dialog
                    onOpenChange={(open) => !open && setShowGateAlert(null)}
                    open={!!showGateAlert}
                >
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>{showGateAlert.title}</DialogTitle>
                            <DialogDescription>{showGateAlert.message}</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => setShowGateAlert(null)}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => {
                                        push("/pricing");
                                        setShowGateAlert(null);
                                    }}
                                    className="flex-1"
                                >
                                    Upgrade to VT+
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
