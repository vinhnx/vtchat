import { InlineLoader } from '@repo/common/components';

export default function Loading() {
    return (
        <div className="flex h-full items-center justify-center">
            <InlineLoader />
        </div>
    );
}
