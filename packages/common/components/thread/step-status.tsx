import type { ItemStatus } from '@repo/shared/types';
import { motion } from 'framer-motion';

export const StepStatus = ({ status }: { status: ItemStatus }) => {
    switch (status) {
        case 'PENDING':
            return (
                <span className="relative flex size-3 items-center justify-center">
                    <span className="bg-brand/50 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                    <span className="bg-brand relative inline-flex size-1 rounded-full" />
                </span>
            );
        case 'COMPLETED':
            return (
                <span className="relative flex size-3 items-center justify-center">
                    <span className="relative flex size-1">
                        <span className="bg-brand relative inline-flex size-1 rounded-full" />
                    </span>
                </span>
            );
        case 'ERROR':
            return (
                <span className="relative flex size-3 items-center justify-center">
                    <span className="relative flex size-1">
                        <span className="relative inline-flex size-1 rounded-full bg-rose-400" />
                    </span>
                </span>
            );
        default:
            return (
                <span className="relative flex size-3 items-center justify-center">
                    <span className="relative flex size-1">
                        <span className="bg-tertiary relative inline-flex size-1 rounded-full" />
                    </span>
                </span>
            );
    }
};

export const SpinnerIcon = ({ size = 24, ...props }: { size?: number; className?: string }) => {
    return (
        <svg
            height={size}
            stroke="currentColor"
            viewBox="0 0 44 44"
            width={size}
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <title>Loading...</title>
            <g fill="none" fillRule="evenodd" strokeWidth="3">
                <circle cx="22" cy="22" r="3" strokeWidth={3}>
                    <animate
                        attributeName="r"
                        begin="0s"
                        calcMode="spline"
                        dur="1.8s"
                        keySplines="0.165, 0.84, 0.44, 1"
                        keyTimes="0; 1"
                        repeatCount="indefinite"
                        values="1; 20"
                    />
                    <animate
                        attributeName="stroke-opacity"
                        begin="0s"
                        calcMode="spline"
                        dur="1.8s"
                        keySplines="0.3, 0.61, 0.355, 1"
                        keyTimes="0; 1"
                        repeatCount="indefinite"
                        values="1; 0"
                    />
                </circle>
                <circle cx="22" cy="22" r="3" strokeWidth={3}>
                    <animate
                        attributeName="r"
                        begin="-0.9s"
                        calcMode="spline"
                        dur="1.8s"
                        keySplines="0.165, 0.84, 0.44, 1"
                        keyTimes="0; 1"
                        repeatCount="indefinite"
                        values="1; 20"
                    />
                    <animate
                        attributeName="stroke-opacity"
                        begin="-0.9s"
                        calcMode="spline"
                        dur="1.8s"
                        keySplines="0.3, 0.61, 0.355, 1"
                        keyTimes="0; 1"
                        repeatCount="indefinite"
                        values="1; 0"
                    />
                </circle>
            </g>
        </svg>
    );
};

export const DotSpinner = ({ size = 24, ...props }: { size?: number; className?: string }) => {
    return (
        <svg
            height={size}
            viewBox="0 0 24 24"
            width={size}
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <rect fill="currentColor" height="3" rx="1.5" ry="1.5" width="3" x="5" y="11">
                <animate
                    attributeName="height"
                    begin="0;stretch3.end+0.25s"
                    calcMode="spline"
                    dur="0.6s"
                    id="stretch1"
                    keySplines=".33,.66,.66,1;.33,0,.66,.33"
                    values="3;8;3"
                />
                <animate
                    attributeName="y"
                    begin="0;stretch3.end+0.25s"
                    calcMode="spline"
                    dur="0.6s"
                    keySplines=".33,.66,.66,1;.33,0,.66,.33"
                    values="11;8;11"
                />
            </rect>
            <rect fill="currentColor" height="3" rx="1.5" ry="1.5" width="3" x="11" y="11">
                <animate
                    attributeName="height"
                    begin="stretch1.begin+0.1s"
                    calcMode="spline"
                    dur="0.6s"
                    keySplines=".33,.66,.66,1;.33,0,.66,.33"
                    values="3;8;3"
                />
                <animate
                    attributeName="y"
                    begin="stretch1.begin+0.1s"
                    calcMode="spline"
                    dur="0.6s"
                    keySplines=".33,.66,.66,1;.33,0,.66,.33"
                    values="11;8;11"
                />
            </rect>
            <rect fill="currentColor" height="3" rx="1.5" ry="1.5" width="3" x="17" y="11">
                <animate
                    attributeName="height"
                    begin="stretch1.begin+0.2s"
                    calcMode="spline"
                    dur="0.6s"
                    id="stretch3"
                    keySplines=".33,.66,.66,1;.33,0,.66,.33"
                    values="3;8;3"
                />
                <animate
                    attributeName="y"
                    begin="stretch1.begin+0.2s"
                    calcMode="spline"
                    dur="0.6s"
                    keySplines=".33,.66,.66,1;.33,0,.66,.33"
                    values="11;8;11"
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
                className="shrink-0"
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
                className="shrink-0"
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
                className="shrink-0"
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
