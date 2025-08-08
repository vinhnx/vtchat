"use client";

import { ChatMode, ChatModeConfig } from "@repo/shared/config";
import { log } from "@repo/shared/logger";
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Input,
    Label,
} from "@repo/ui";
import { useState } from "react";
import { useApiKeysStore } from "../store/api-keys.store";

type ProviderKeyMapping = {
    [K in ChatMode]: keyof ReturnType<typeof useApiKeysStore.getState>["keys"] | null;
};

const CHAT_MODE_TO_API_KEY: ProviderKeyMapping = {
    // OpenAI models
    [ChatMode.GPT_5]: "OPENAI_API_KEY",
    [ChatMode.O3]: "OPENAI_API_KEY",
    [ChatMode.O3_Mini]: "OPENAI_API_KEY",
    [ChatMode.O4_Mini]: "OPENAI_API_KEY",
    [ChatMode.O1]: "OPENAI_API_KEY",
    [ChatMode.O1_MINI]: "OPENAI_API_KEY",
    [ChatMode.GPT_4o_Mini]: "OPENAI_API_KEY",
    [ChatMode.GPT_4o]: "OPENAI_API_KEY",
    [ChatMode.GPT_4_1_Mini]: "OPENAI_API_KEY",
    [ChatMode.GPT_4_1_Nano]: "OPENAI_API_KEY",
    [ChatMode.GPT_4_1]: "OPENAI_API_KEY",
    // Gemini models
    [ChatMode.Deep]: "GEMINI_API_KEY",
    [ChatMode.Pro]: "GEMINI_API_KEY",
    [ChatMode.GEMINI_2_5_PRO]: "GEMINI_API_KEY",
    [ChatMode.GEMINI_2_5_FLASH]: "GEMINI_API_KEY",
    [ChatMode.GEMINI_2_5_FLASH_LITE]: "GEMINI_API_KEY",
    // Anthropic models
    [ChatMode.CLAUDE_4_1_OPUS]: "ANTHROPIC_API_KEY",
    [ChatMode.CLAUDE_4_SONNET]: "ANTHROPIC_API_KEY",
    [ChatMode.CLAUDE_4_OPUS]: "ANTHROPIC_API_KEY",
    // Fireworks models
    [ChatMode.DEEPSEEK_R1_FIREWORKS]: "FIREWORKS_API_KEY",
    [ChatMode.KIMI_K2_INSTRUCT_FIREWORKS]: "FIREWORKS_API_KEY",
    // xAI models
    [ChatMode.GROK_3]: "XAI_API_KEY",
    [ChatMode.GROK_3_MINI]: "XAI_API_KEY",
    [ChatMode.GROK_4]: "XAI_API_KEY",
    // OpenRouter models
    [ChatMode.DEEPSEEK_V3_0324]: "OPENROUTER_API_KEY",
    [ChatMode.DEEPSEEK_R1]: "OPENROUTER_API_KEY",
    [ChatMode.QWEN3_235B_A22B]: "OPENROUTER_API_KEY",
    [ChatMode.QWEN3_32B]: "OPENROUTER_API_KEY",
    [ChatMode.MISTRAL_NEMO]: "OPENROUTER_API_KEY",
    [ChatMode.QWEN3_14B]: "OPENROUTER_API_KEY",
    [ChatMode.KIMI_K2]: "OPENROUTER_API_KEY",
    [ChatMode.GPT_OSS_120B]: "OPENROUTER_API_KEY",
    [ChatMode.GPT_OSS_20B]: "OPENROUTER_API_KEY",
} as const;

const PROVIDER_NAMES = {
    OPENAI_API_KEY: "OpenAI",
    ANTHROPIC_API_KEY: "Anthropic",
    GEMINI_API_KEY: "Google Gemini",
    FIREWORKS_API_KEY: "Fireworks AI",
    XAI_API_KEY: "xAI",
    OPENROUTER_API_KEY: "OpenRouter",
    JINA_API_KEY: "Jina AI",
    TOGETHER_API_KEY: "Together AI",
} as const;

interface BYOKValidationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    chatMode: ChatMode;
    onApiKeySet: () => void;
}

export function BYOKValidationDialog({
    isOpen,
    onClose,
    chatMode,
    onApiKeySet,
}: BYOKValidationDialogProps) {
    const { setKey } = useApiKeysStore();
    const [apiKey, setApiKey] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const requiredKeyType = CHAT_MODE_TO_API_KEY[chatMode];
    const providerName = requiredKeyType ? PROVIDER_NAMES[requiredKeyType] : "Provider";
    const chatModeDisplayName = ChatModeConfig[chatMode]?.name || chatMode;

    const handleSave = async () => {
        if (!(apiKey.trim() && requiredKeyType)) return;

        setIsLoading(true);
        try {
            // Save the API key
            setKey(requiredKeyType, apiKey.trim());

            // Clear the input
            setApiKey("");

            // Call the callback to continue with the message
            onApiKeySet();

            // Close the dialog
            onClose();
        } catch {
            // SECURITY: Never log error details that might contain API key information
            log.error({ context: "BYOKValidation" }, "Failed to save API key");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setApiKey("");
        onClose();
    };

    if (!requiredKeyType) {
        return null;
    }

    return (
        <Dialog onOpenChange={onClose} open={isOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>API Key Required</DialogTitle>
                    <DialogDescription>
                        To use <strong>{chatModeDisplayName}</strong>, you need to provide your{" "}
                        <strong>{providerName}</strong> API key. This key will be stored securely in
                        your browser.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="api-key">{providerName} API Key</Label>
                        <Input
                            autoFocus
                            id="api-key"
                            onChange={(e) => setApiKey(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && apiKey.trim()) {
                                    handleSave();
                                }
                            }}
                            placeholder={`Enter your ${providerName} API key`}
                            type="password"
                            value={apiKey}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button disabled={isLoading} onClick={handleCancel} variant="outline">
                        Cancel
                    </Button>
                    <Button
                        className="min-w-[80px]"
                        disabled={!apiKey.trim() || isLoading}
                        onClick={handleSave}
                    >
                        {isLoading ? "Saving..." : "Save & Continue"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
