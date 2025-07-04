import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
export type TLabelDivider = {
    label: string;
    className?: string;
    transitionDuration?: number;
};
export const LabelDivider = ({ label, className, transitionDuration = 1 }: TLabelDivider) => {
    return (
        <motion.div
            animate={{ opacity: 1, transition: { duration: transitionDuration } }}
            className={cn('flex w-full flex-row items-center py-4', className)}
            initial={{ opacity: 0 }}
        >
            <div className="from-border/50 to-transaprent h-[1px] w-full bg-gradient-to-l" />
            <p className="text-muted-foreground flex-shrink-0 px-2 text-sm md:text-base">{label}</p>
            <div className="from-border/50 h-[1px] w-full bg-gradient-to-r to-transparent" />
        </motion.div>
    );
};
