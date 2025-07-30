import { cn, Skeleton } from "@repo/ui";
import { motion } from "framer-motion";
import {
    getOptimizedTransition,
    HARDWARE_ACCELERATION_CLASSES,
    prefersReducedMotion,
} from "../utils/animation-optimization";

export const MotionSkeleton = ({ className }: { className?: string }) => {
    // Use transform-based animation instead of width to avoid layout thrashing
    const skeletonVariants = {
        initial: {
            opacity: 0,
            scaleX: 0,
            transformOrigin: "left center",
        },
        animate: {
            opacity: 1,
            scaleX: 1,
            transformOrigin: "left center",
        },
        exit: {
            opacity: 0,
            scaleX: 0,
            transformOrigin: "left center",
        },
    };

    // Reduced animation duration and optimized for mobile
    const transition = prefersReducedMotion() ? { duration: 0 } : getOptimizedTransition("smooth");

    return (
        <motion.div
            variants={skeletonVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
            className={HARDWARE_ACCELERATION_CLASSES.transformAccelerated}
        >
            <Skeleton
                className={cn(
                    "from-muted-foreground/90 via-muted-foreground/60 to-muted-foreground/10 h-5 w-full rounded-sm bg-gradient-to-r",
                    className,
                )}
            />
        </motion.div>
    );
};
