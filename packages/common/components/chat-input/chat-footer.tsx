'use client';

import { useUser } from '@repo/shared/lib/auth-client';
import { Flex } from '@repo/ui';
import Link from 'next/link';

export const ChatFooter = () => {
    const user = useUser();
    const isLoggedIn = !!user;

    return (
        <Flex className="w-full p-2" gap="sm" justify="center">
            <div className="flex flex-col items-center gap-3">
                {/* Badges for non-logged in users only */}
                {!isLoggedIn && (
                    <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
                        <a href="https://startupfa.me/s/vt-chat?utm_source=vtchat.io.vn" target="_blank"><img src="https://startupfa.me/badges/featured/light-rounded.webp" alt="Featured on Startup Fame" width="171" height="54" /></a>
                        <Link
                            href="https://peerlist.io/vinhnx/project/vt"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:opacity-80 transition-opacity"
                        >
                            <img
                                src="/icons/peerlist_badge.svg"
                                alt="VT Chat on Peerlist"
                                width="221"
                                height="60"
                                className="w-28 h-8 sm:w-56 sm:h-15"
                            />
                        </Link>
                    </div>
                )}

                {/* Footer Links */}
                <div className="flex flex-col items-center gap-1 text-xs opacity-50 sm:flex-row sm:gap-3">
                    <span>© 2025 VT. All rights reserved.</span>
                    <div className="flex items-center gap-3">
                        <Link className="hover:opacity-100" href="/terms">
                            Terms
                        </Link>
                        <span>•</span>
                        <Link className="hover:opacity-100" href="/privacy">
                            Privacy
                        </Link>
                        <span>•</span>
                        <Link className="hover:opacity-100" href="/faq">
                            Help Center
                        </Link>
                        <span>•</span>
                        <Link className="hover:opacity-100" href="mailto:hello@vtchat.io.vn">
                            Support
                        </Link>
                    </div>
                </div>
            </div>
        </Flex>
    );
};
