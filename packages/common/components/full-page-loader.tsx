import { Skeleton } from "@repo/ui";

export type FullPageLoaderProps = {
    label?: string;
};

export const FullPageLoader = ({ label }: FullPageLoaderProps) => {
    return (
        <div className="z-20 flex min-h-[90vh] w-full flex-1 flex-col items-center justify-center gap-4">
            <div className="flex w-full max-w-md flex-col items-center gap-4">
                <Skeleton className="h-8 w-48 rounded-lg" />
                <div className="w-full space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                {label && <p className="text-muted-foreground text-sm">{label}</p>}
            </div>
        </div>
    );
};
