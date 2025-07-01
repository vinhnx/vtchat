import { Flex } from '@repo/ui';
import Link from 'next/link';
import Image from 'next/image';

export const ChatFooter = () => {
    return (
        <Flex className="w-full p-2" justify="center" gap="sm">
            <div className="flex flex-col items-center gap-3">
                {/* Badges */}
                <div className="flex flex-row items-center justify-center gap-2 sm:gap-3">
                    <Link
                        href="https://startupfa.me/s/vt-chat?utm_source=vtchat.io.vn"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Image
                            src="https://startupfa.me/badges/featured-badge.webp"
                            alt="Featured on Startup Fame"
                            width={96}
                            height={30}
                            unoptimized
                            className="transition-opacity hover:opacity-80 sm:w-32 sm:h-10"
                        />
                    </Link>
                    <Link
                        href="https://magicbox.tools"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Image
                            src="https://magicbox.tools/badge.svg"
                            alt="Featured on MagicBox.tools"
                            width={96}
                            height={30}
                            unoptimized
                            className="transition-opacity hover:opacity-80 sm:w-32 sm:h-10"
                        />
                    </Link>
                </div>
                
                {/* Footer Links */}
                <div className="flex flex-col items-center gap-1 text-xs opacity-50 sm:flex-row sm:gap-3">
                    <span>© 2025 VT. All rights reserved.</span>
                    <div className="flex items-center gap-3">
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
