import { Flex } from '@repo/ui';
import Link from 'next/link';

export const ChatFooter = () => {
    return (
        <Flex className="w-full p-2" justify="center" gap="sm">
            <div className="flex flex-col items-center gap-3">
                {/* Badges */}
                <div className="flex flex-row items-center justify-center gap-2 sm:gap-3">
                    <a
                        href="https://startupfa.me/s/vt-chat?utm_source=vtchat.io.vn"
                        target="_blank"
                        rel="noopener"
                    >
                        <img
                            src="https://startupfa.me/badges/featured-badge.webp"
                            alt="Featured on Startup Fame"
                            width="96"
                            height="30"
                            className="transition-opacity hover:opacity-80 sm:h-10 sm:w-32"
                        />
                    </a>

                    <a href="https://peerlist.io/vinhnx/project/vt" target="_blank" rel="noopener">
                        <img
                            src="/icons/peerlist_badge.svg"
                            alt="VT Chat on Peerlist"
                            width="221"
                            height="60"
                            className="w-28 h-8 sm:w-56 sm:h-15"
                        />
                    </a>
                </div>

                {/* Footer Links */}
                <div className="flex flex-col items-center gap-1 text-xs opacity-50 sm:flex-row sm:gap-3">
                    <span>© 2025 VT. All rights reserved.</span>
                    <div className="flex items-center gap-3">
                        <Link href="/About" className="hover:opacity-100">
                            About
                        </Link>
                        <span>•</span>
                        <Link href="/terms" className="hover:opacity-100">
                            Terms
                        </Link>
                        <span>•</span>
                        <Link href="/privacy" className="hover:opacity-100">
                            Privacy
                        </Link>
                        <span>•</span>
                        <Link href="/faq" className="hover:opacity-100">
                            Help Center
                        </Link>
                        <span>•</span>
                        <Link href="mailto:hello@vtchat.io.vn" className="hover:opacity-100">
                            Support
                        </Link>
                    </div>
                </div>
            </div>
        </Flex>
    );
};
