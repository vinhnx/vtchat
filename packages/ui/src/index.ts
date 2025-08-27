export * from './chart-renderer';
export * from './components';
export * from './dynamic-chart-renderer';
export * from './lib/utils';

// 12 Principles of Animation utilities
export * from './lib/animation-constants';
// Export animation utilities with specific named exports to avoid conflicts
export {
    ANIMATION_MOTION_VARIANTS,
    createAnimationSequence,
    createAnticipation,
    createAppeal,
    createExaggeration,
    createFollowThrough,
    createListAnimation,
    createSecondaryAction,
    createSmoothPath,
    createSquashStretch,
    createStaging,
    getAccessibleVariants,
    getTimingForContext,
} from './lib/animation-utils';
