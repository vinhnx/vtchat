import { Flex } from '@repo/ui';
import Link from 'next/link';

export const ChatFooter = () => {
    return (
        <Flex className="w-full p-2" justify="center" gap="sm">
            <div className="flex items-center gap-3 text-xs opacity-50">
                <span>VT</span>
                <span>•</span>
                <Link href="/terms" className="hover:opacity-100">
                    Terms
                </Link>
                <span>•</span>
                <Link href="/privacy" className="hover:opacity-100">
                    Privacy
                </Link>
            </div>
        </Flex>
    );
};
