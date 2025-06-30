import { Flex } from '@repo/ui';
import Link from 'next/link';

export const ChatFooter = () => {
    return (
        <Flex className="w-full p-2" justify="center" gap="sm">
            <div className="flex items-center gap-3 text-xs opacity-50">
                <span>© 2025 VT. All rights reserved.</span>
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
        </Flex>
    );
};
