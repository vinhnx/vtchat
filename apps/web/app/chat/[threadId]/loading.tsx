import { MotionSkeleton } from '@repo/common/components';

export default function Loading() {
    return (
        <div className="scrollbar-default flex w-full flex-1 flex-col items-center overflow-y-auto px-4 md:px-8">
            <div className="mx-auto w-[95%] max-w-3xl px-4 pb-[200px] pt-16 md:w-full">
                <div className="flex w-full flex-col items-start gap-2 opacity-10">
                    <MotionSkeleton className="bg-muted-foreground/40 mb-2 h-4 !w-[100px] rounded-sm" />
                    <MotionSkeleton className="w-full bg-gradient-to-r" />
                    <MotionSkeleton className="w-[70%] bg-gradient-to-r" />
                    <MotionSkeleton className="w-[50%] bg-gradient-to-r" />
                </div>
            </div>
        </div>
    );
}
