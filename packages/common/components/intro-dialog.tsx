import { STORAGE_KEYS } from '@repo/shared/config';
import { useSession } from '@repo/shared/lib/auth-client';
import { cn, Dialog, DialogContent } from '@repo/ui';
import { IconCircleCheckFilled } from '@tabler/icons-react';
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

    const icon = (
        <IconCircleCheckFilled className="text-muted-foreground/50 mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full" />
    );

    const points = [
        {
            icon,
            text: `**Privacy-focused**: Your chat history never leaves your device.`,
        },
        {
            icon,
            text: `**Open source**: Fully transparent and modifiable. Easily deploy it yourself.`,
        },
        {
            icon,
            text: `**Research-friendly**: Leverage Web Search, Pro Search, and Deep Research features.`,
        },
        {
            icon,
            text: `**Comprehensive model support**: Compatible with all mainstream model providers.`,
        },
        {
            icon,
            text: `**BYOK (Bring Your Own Key)**: Use your own API key for unlimited chat.`,
        },
        {
            icon,
            text: `**MCP Compatibility**: Connect with any MCP servers/tools (coming soon).`,
        },
        {
            icon,
            text: `**Usage Tracking**: Monitor your model usage without paying (coming soon).`,
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
                ariaTitle="Introduction"
                className="flex max-w-[420px] flex-col gap-0 overflow-hidden p-0"
            >
                <div className="flex flex-col gap-8 p-5">
                    <div className="flex flex-col gap-2">
                        <div
                            className={cn(
                                'flex h-8 w-full cursor-pointer items-center justify-start gap-1.5 '
                            )}
                        >
                            <Logo className="text-brand size-5" />
                            <p className="font-clash text-foreground text-lg font-bold tracking-wide">
                                VT
                            </p>
                        </div>
                        <p className="text-base font-semibold">
                            Private, Open-Source, and Built for You
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <h3 className="text-sm font-semibold">Key benefits:</h3>

                        <div className="flex flex-col items-start gap-1.5">
                            {points.map((point, index) => (
                                <div key={index} className="flex-inline flex items-start gap-2">
                                    {point.icon}
                                    <ReactMarkdown
                                        className="text-sm"
                                        components={{
                                            p: ({ children }) => (
                                                <p className="text-muted-foreground text-sm">
                                                    {children}
                                                </p>
                                            ),
                                            strong: ({ children }) => (
                                                <span className="text-sm font-semibold">
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
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
