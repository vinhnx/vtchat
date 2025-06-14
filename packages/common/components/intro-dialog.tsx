import { STORAGE_KEYS } from '@repo/shared/config';
import { useSession } from '@repo/shared/lib/auth-client';
import { Badge, Button, Dialog, DialogContent } from '@repo/ui';
import {
    IconCircleCheckFilled,
    IconCode,
    IconShield,
    IconSparkles,
    IconX,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useIsClient } from '../hooks';
import { Logo } from './logo';

export const IntroDialog = () => {
    const [isOpen, setIsOpen] = useState(false);
    const isClient = useIsClient();
    const { data: session } = useSession();
    const isSignedIn = !!session;

    useEffect(() => {
        // Only check localStorage after component has mounted
        if (isClient && typeof window !== 'undefined') {
            const hasSeenIntro = localStorage.getItem(STORAGE_KEYS.HAS_SEEN_INTRO);
            if (!hasSeenIntro) {
                setIsOpen(true);
            }
        }
    }, [isClient]);

    const handleClose = () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.HAS_SEEN_INTRO, 'true');
        }
        setIsOpen(false);
    };

    // Don't render until after hydration to prevent SSR mismatch
    if (!isClient) {
        return null;
    }

    const checkIcon = (
        <IconCircleCheckFilled className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full text-emerald-500" />
    );

    const points = [
        {
            icon: <IconShield className="mt-0.5 flex size-4 shrink-0 text-blue-500" />,
            text: `**Privacy-first**: Your conversations stay on your device - we never see your data.`,
        },
        {
            icon: <IconCode className="mt-0.5 flex size-4 shrink-0 text-purple-500" />,
            text: `**Open source**: Transparent, auditable, and self-hostable code.`,
        },
        {
            icon: <IconSparkles className="mt-0.5 flex size-4 shrink-0 text-orange-500" />,
            text: `**AI-powered**: Web search, deep research, and comprehensive model support.`,
        },
        {
            icon: checkIcon,
            text: `**BYOK**: Use your own API keys for unlimited, cost-effective conversations.`,
        },
        {
            icon: checkIcon,
            text: `**MCP tools**: Extensible with Model Context Protocol integrations.`,
        },
    ];

    if (isSignedIn) {
        return null;
    }

    return (
        <Dialog
            open={isOpen}
            onOpenChange={open => {
                if (open) {
                    setIsOpen(true);
                } else {
                    handleClose();
                }
            }}
        >
            <DialogContent
                ariaTitle="Welcome to VT"
                className="flex max-w-[480px] flex-col gap-0 overflow-hidden p-0"
            >
                {/* Header */}
                <div className="relative flex flex-col gap-4 p-6 pb-0">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="absolute right-2 top-2"
                        onClick={handleClose}
                    >
                        <IconX size={16} />
                    </Button>

                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <Logo className="text-brand size-6" />
                            <p className="font-clash text-foreground text-xl font-bold tracking-wide">
                                VT
                            </p>
                            <Badge variant="secondary" className="ml-2">
                                Free & Open Source
                            </Badge>
                        </div>
                        <div>
                            <p className="text-lg font-semibold">
                                Welcome to the future of AI chat
                            </p>
                            <p className="text-muted-foreground text-sm">
                                Private, powerful, and completely under your control
                            </p>
                        </div>
                    </div>
                </div>

                {/* Features */}
                <div className="flex flex-col gap-4 p-6">
                    <div className="flex flex-col gap-3">
                        {points.map((point, index) => (
                            <div key={index} className="flex items-start gap-3">
                                {point.icon}
                                <ReactMarkdown
                                    className="flex-1 text-sm"
                                    components={{
                                        p: ({ children }) => (
                                            <p className="text-muted-foreground text-sm leading-relaxed">
                                                {children}
                                            </p>
                                        ),
                                        strong: ({ children }) => (
                                            <span className="text-foreground font-semibold">
                                                {children}
                                            </span>
                                        ),
                                    }}
                                >
                                    {point.text}
                                </ReactMarkdown>
                            </div>
                        ))}
                    </div>

                    {/* Call to Action */}
                    <div className="mt-4 flex flex-col gap-2">
                        <Button onClick={handleClose} className="w-full" size="sm">
                            Start Chatting
                        </Button>
                        <p className="text-muted-foreground text-center text-xs">
                            No signup required • Your data stays private
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
