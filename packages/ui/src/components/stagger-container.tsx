import { motion } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

export const StaggerContainer = ({ children }: { children: React.ReactNode; }) => {
    return (
        <motion.div
            animate='visible'
            className='w-full'
            exit='hidden'
            initial='hidden'
            variants={containerVariants}
        >
            {children}
        </motion.div>
    );
};
