import { cn, Skeleton } from "@repo/ui";

export type InlineLoaderProps = {
    size?: "xs" | "sm" | "md" | "lg";
    variant?: "subtle" | "normal";
    className?: string;
};

export const InlineLoader = ({ size = "sm", variant = "normal", className }: InlineLoaderProps) => {
    const skeletonSizes = {
        xs: "h-3 w-16",
        sm: "h-4 w-20",
        md: "h-5 w-24",
        lg: "h-6 w-32",
    };

    return (
        <div
            className={cn(
                "flex items-center justify-center",
                variant === "subtle" && "opacity-60",
                className,
            )}
        >
            <Skeleton className={cn("rounded-md", skeletonSizes[size])} />
        </div>
    );
};
