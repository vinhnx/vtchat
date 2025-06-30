import { Thread } from '@repo/common/components';
import { generateMetadata as genMeta } from '../../lib/seo/metadata-utils';

export const metadata = genMeta({
    title: 'VT',
    description: 'Minimal AI Chat',
    pathname: '/chat',
});

export default function ChatPage() {
    return (
        <div className="flex h-screen flex-col">
            <div className="flex-grow overflow-y-auto">
                <Thread />
            </div>
        </div>
    );
}
