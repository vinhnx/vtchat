import type { ItemStatus } from '@repo/shared/types';
import { motion } from 'framer-motion';

export const StepStatus = ({ status }: { status: ItemStatus; }) => {
    switch (status) {
        case 'PENDING':
            return (
                <motion.span
                    className='relative flex size-3 items-center justify-center overflow-hidden'
                    initial={{ scale: 0.93, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.125, ease: 'easeOut' }}
                >
                    {/* Enhanced shimmer effect for pending steps */}
                    <motion.span
                        className='absolute inset-0 -translate-x-full rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/15'
                        animate={{
                            x: ['-100%', '100%'],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: 'easeInOut',
                        }}
                        style={{
                            width: '200%',
                        }}
                    />
                    <motion.span
                        className='bg-foreground/20 absolute inline-flex h-full w-full rounded-full'
                        animate={{
                            scale: [1, 1.4, 1],
                            opacity: [0.5, 0.1, 0.5],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: 'easeInOut',
                        }}
                    />
                    <motion.span
                        className='bg-foreground relative inline-flex size-1.5 rounded-full'
                        animate={{
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: 'easeInOut',
                        }}
                    />
                </motion.span>
            );
        case 'COMPLETED':
            return (
                <motion.span
                    className='relative flex size-3 items-center justify-center'
                    initial={{ scale: 0.93, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        duration: 0.4,
                        ease: [0.23, 1, 0.32, 1],
                        delay: 0.1,
                    }}
                >
                    <motion.span
                        className='relative flex size-1.5'
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                            duration: 0.3,
                            delay: 0.2,
                            ease: [0.68, -0.55, 0.265, 1.55],
                        }}
                    >
                        <span className='bg-foreground/80 relative inline-flex size-1.5 rounded-full' />
                    </motion.span>
                </motion.span>
            );
        case 'ERROR':
            return (
                <motion.span
                    className='relative flex size-3 items-center justify-center'
                    initial={{ scale: 0.93, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.125, ease: 'easeOut' }}
                >
                    <motion.span
                        className='relative flex size-1.5'
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                            duration: 0.3,
                            delay: 0.1,
                            ease: [0.68, -0.55, 0.265, 1.55],
                        }}
                    >
                        <span className='relative inline-flex size-1.5 rounded-full bg-red-400/80' />
                    </motion.span>
                </motion.span>
            );
        default:
            return (
                <motion.span
                    className='relative flex size-3 items-center justify-center'
                    initial={{ scale: 0.8, opacity: 0.3 }}
                    animate={{ scale: 1, opacity: 0.6 }}
                    transition={{ duration: 0.125, ease: 'easeOut' }}
                >
                    <span className='relative flex size-1'>
                        <span className='bg-muted-foreground/40 relative inline-flex size-1 rounded-full' />
                    </span>
                </motion.span>
            );
    }
};

export const SpinnerIcon = ({ size = 24, ...props }: { size?: number; className?: string; }) => {
    return (
        <svg
            height={size}
            stroke='currentColor'
            viewBox='0 0 44 44'
            width={size}
            xmlns='http://www.w3.org/2000/svg'
            {...props}
        >
            <title>Loading...</title>
            <g fill='none' fillRule='evenodd' strokeWidth='3'>
                <circle cx='22' cy='22' r='3' strokeWidth={3}>
                    <animate
                        attributeName='r'
                        begin='0s'
                        calcMode='spline'
                        dur='1.8s'
                        keySplines='0.165, 0.84, 0.44, 1'
                        keyTimes='0; 1'
                        repeatCount='indefinite'
                        values='1; 20'
                    />
                    <animate
                        attributeName='stroke-opacity'
                        begin='0s'
                        calcMode='spline'
                        dur='1.8s'
                        keySplines='0.3, 0.61, 0.355, 1'
                        keyTimes='0; 1'
                        repeatCount='indefinite'
                        values='1; 0'
                    />
                </circle>
                <circle cx='22' cy='22' r='3' strokeWidth={3}>
                    <animate
                        attributeName='r'
                        begin='-0.9s'
                        calcMode='spline'
                        dur='1.8s'
                        keySplines='0.165, 0.84, 0.44, 1'
                        keyTimes='0; 1'
                        repeatCount='indefinite'
                        values='1; 20'
                    />
                    <animate
                        attributeName='stroke-opacity'
                        begin='-0.9s'
                        calcMode='spline'
                        dur='1.8s'
                        keySplines='0.3, 0.61, 0.355, 1'
                        keyTimes='0; 1'
                        repeatCount='indefinite'
                        values='1; 0'
                    />
                </circle>
            </g>
        </svg>
    );
};

export const DotSpinner = ({ size = 24, ...props }: { size?: number; className?: string; }) => {
    return (
        <svg
            height={size}
            viewBox='0 0 24 24'
            width={size}
            xmlns='http://www.w3.org/2000/svg'
            {...props}
        >
            <rect fill='currentColor' height='3' rx='1.5' ry='1.5' width='3' x='5' y='11'>
                <animate
                    attributeName='height'
                    begin='0;stretch3.end+0.25s'
                    calcMode='spline'
                    dur='0.6s'
                    id='stretch1'
                    keySplines='.33,.66,.66,1;.33,0,.66,.33'
                    values='3;8;3'
                />
                <animate
                    attributeName='y'
                    begin='0;stretch3.end+0.25s'
                    calcMode='spline'
                    dur='0.6s'
                    keySplines='.33,.66,.66,1;.33,0,.66,.33'
                    values='11;8;11'
                />
            </rect>
            <rect fill='currentColor' height='3' rx='1.5' ry='1.5' width='3' x='11' y='11'>
                <animate
                    attributeName='height'
                    begin='stretch1.begin+0.1s'
                    calcMode='spline'
                    dur='0.6s'
                    keySplines='.33,.66,.66,1;.33,0,.66,.33'
                    values='3;8;3'
                />
                <animate
                    attributeName='y'
                    begin='stretch1.begin+0.1s'
                    calcMode='spline'
                    dur='0.6s'
                    keySplines='.33,.66,.66,1;.33,0,.66,.33'
                    values='11;8;11'
                />
            </rect>
            <rect fill='currentColor' height='3' rx='1.5' ry='1.5' width='3' x='17' y='11'>
                <animate
                    attributeName='height'
                    begin='stretch1.begin+0.2s'
                    calcMode='spline'
                    dur='0.6s'
                    id='stretch3'
                    keySplines='.33,.66,.66,1;.33,0,.66,.33'
                    values='3;8;3'
                />
                <animate
                    attributeName='y'
                    begin='stretch1.begin+0.2s'
                    calcMode='spline'
                    dur='0.6s'
                    keySplines='.33,.66,.66,1;.33,0,.66,.33'
                    values='11;8;11'
                />
            </rect>
        </svg>
    );
};

const loadingContainer = {
    width: '1.2rem',
    height: '1.2rem',
    display: 'flex',
    alignItems: 'center',
};

const loadingCircle = {
    display: 'block',
    width: '0.2rem',
    height: '0.2rem',
    overflow: 'hidden',
    marginLeft: '0.1rem',
    marginRight: '0.1rem',
    backgroundColor: 'currentColor',
    borderRadius: '30%',
};

export const ThreeDotsWave = () => {
    return (
        <div style={loadingContainer}>
            <motion.span
                animate={{ y: [0, -4, 0] }}
                className='shrink-0'
                style={loadingCircle}
                transition={{
                    duration: 0.2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatDelay: 0.8,
                    ease: 'easeInOut',
                }}
            />
            <motion.span
                animate={{ y: [0, -4, 0] }}
                className='shrink-0'
                style={loadingCircle}
                transition={{
                    duration: 0.2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatDelay: 0.8,
                    ease: 'easeInOut',
                    delay: 0.2,
                }}
            />
            <motion.span
                animate={{ y: [0, -4, 0] }}
                className='shrink-0'
                style={loadingCircle}
                transition={{
                    duration: 0.2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatDelay: 0.8,
                    ease: 'easeInOut',
                    delay: 0.4,
                }}
            />
        </div>
    );
};
