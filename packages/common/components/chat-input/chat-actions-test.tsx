'use client';

import { ChatMode } from '@repo/shared/config';
import { Alert, AlertDescription, Button, DropdownMenu, DropdownMenuTrigger } from '@repo/ui';
import { IconAlertCircle } from '@tabler/icons-react';
import { useState } from 'react';
import { ChatModeButton, ChatModeOptions } from './chat-actions';

/**
 * Test component to verify the gated feature integration in chat actions
 */
export const ChatActionsTest = () => {
    const [chatMode, setChatMode] = useState(ChatMode.GEMINI_2_0_FLASH);
    const [alertInfo, setAlertInfo] = useState<{
        title: string;
        message: string;
    } | null>(null);

    const handleGatedFeature = (gateInfo: {
        feature?: string;
        plan?: string;
        title: string;
        message: string;
    }) => {
        console.log('Gated feature accessed:', gateInfo);
        setAlertInfo({ title: gateInfo.title, message: gateInfo.message });
    };

    return (
        <div className="space-y-6 p-6">
            <div>
                <h2 className="mb-4 text-lg font-semibold">Chat Actions Gating Test</h2>
                <p className="text-muted-foreground mb-6 text-sm">
                    This component tests the integration of gated features in chat mode selection.
                </p>
            </div>

            <div className="space-y-4">
                <div>
                    <h3 className="mb-2 text-sm font-medium">Chat Mode Button</h3>
                    <ChatModeButton />
                </div>

                <div>
                    <h3 className="mb-2 text-sm font-medium">Chat Mode Options</h3>
                    <div className="rounded-lg border p-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outlined">Test Chat Mode Options</Button>
                            </DropdownMenuTrigger>
                            <ChatModeOptions
                                chatMode={chatMode}
                                setChatMode={setChatMode}
                                onGatedFeature={handleGatedFeature}
                            />
                        </DropdownMenu>
                    </div>
                </div>

                <div>
                    <h3 className="mb-2 text-sm font-medium">Current Mode</h3>
                    <p className="text-muted-foreground text-sm">Selected: {chatMode}</p>
                </div>

                {alertInfo && (
                    <Alert variant="destructive">
                        <IconAlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            <strong>{alertInfo.title}:</strong> {alertInfo.message}
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        </div>
    );
};
