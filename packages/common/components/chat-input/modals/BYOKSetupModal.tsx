"use client";

import { type ApiKeys, useApiKeysStore } from "@repo/common/store";
import { log } from "@repo/shared/logger";
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, Input } from "@repo/ui";
import { useState } from "react";
import { BYOKIcon } from "../../icons";
import { getProviderInfo } from "../config/providers";

interface BYOKSetupModalProps {
    isOpen: boolean;
    onClose: () => void;
    requiredApiKey: keyof ApiKeys;
    modelName: string;
    onApiKeySaved: () => void;
}

export function BYOKSetupModal({
    isOpen,
    onClose,
    requiredApiKey,
    modelName,
    onApiKeySaved,
}: BYOKSetupModalProps) {
    const setApiKey = useApiKeysStore((state) => state.setKey);
    const getAllKeys = useApiKeysStore((state) => state.getAllKeys);
    const [apiKeyValue, setApiKeyValue] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const provider = getProviderInfo(requiredApiKey);

    const handleSave = async () => {
        if (!apiKeyValue.trim()) return;

        setIsSaving(true);
        try {
            // Save the API key
            setApiKey(requiredApiKey, apiKeyValue.trim());

            // Verify the key was saved by checking storage immediately
            setTimeout(() => {
                const savedKeys = getAllKeys();
                if (savedKeys[requiredApiKey] === apiKeyValue.trim()) {
                    // Key saved successfully
                } else {
                    log.error({ requiredApiKey }, "[BYOK Modal] API key verification failed");
                }
            }, 200);

            setApiKeyValue("");
            onApiKeySaved();
            onClose();
        } catch (error) {
            log.error({ error }, "Failed to save API key");
            alert("Failed to save API key. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        setApiKeyValue("");
        onClose();
    };

    return (
        <Dialog onOpenChange={handleClose} open={isOpen}>
            <DialogContent className="mx-4 max-w-[95vw] rounded-xl sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BYOKIcon />
                        Setup API Key Required
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 p-6">
                    <div className="space-y-2">
                        <p className="text-muted-foreground text-sm">
                            To use <span className="font-medium">{modelName}</span>, you need to
                            provide your own {provider.name} API key.
                        </p>
                        <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950/20">
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                Your API key is stored locally and never sent to our servers.
                            </p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{provider.name} API Key</label>
                            <Input
                                className="font-sans"
                                onChange={(e) => setApiKeyValue(e.target.value)}
                                placeholder={provider.placeholder}
                                type="password"
                                value={apiKeyValue}
                            />
                        </div>
                        <a
                            className="inline-flex items-center gap-1 text-xs text-blue-500 underline-offset-2 hover:text-blue-600 hover:underline"
                            href={provider.url}
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            Get {provider.name} API key →
                        </a>
                    </div>
                    <div className="flex gap-2">
                        <Button className="flex-1" onClick={handleClose} variant="outline">
                            Cancel
                        </Button>
                        <Button
                            className="flex-1"
                            disabled={!apiKeyValue.trim() || isSaving}
                            onClick={handleSave}
                        >
                            {isSaving ? "Saving..." : "Save & Continue"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
