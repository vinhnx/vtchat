import { Thread } from '@repo/common/components';
import { generateMetadata as genMeta } from '../../lib/seo/metadata-utils';

export const metadata = genMeta({
    title: 'Chat',
    description: 'Minimalist AI Chat',
    pathname: '/chat',
});

export default function ChatPage() {
    return (
        <div className="flex h-full flex-col">
            <div className="flex-1 overflow-y-auto">
                <Thread />
            </div>
        </div>
    );
}
