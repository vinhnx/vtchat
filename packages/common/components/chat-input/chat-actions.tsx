// Main orchestration file for chat actions
// This file exports all chat action components after refactoring

// Basic Action Components
export { AttachmentButton } from './actions/AttachmentButton';
export { NewLineIndicator } from './actions/NewLineIndicator';
export { GeneratingStatus } from './actions/GeneratingStatus';
export { SendStopButton } from './actions/SendStopButton';

// Feature Toggle Components
export { WebSearchButton } from './actions/WebSearchButton';
export { MathCalculatorButton } from './actions/MathCalculatorButton';
export { ChartsButton } from './actions/ChartsButton';

// Chat Mode Components
export { ChatModeButton } from './actions/ChatMode/ChatModeButton';
export { ChatModeOptions } from './actions/ChatMode/ChatModeOptions';

// Modal Components
export { BYOKSetupModal } from './modals/BYOKSetupModal';

// Hooks (for advanced usage)
export { useLoginPrompt } from './hooks/useLoginPrompt';
export { useIsChatPage } from './hooks/useIsChatPage';
export { useSubscriptionGate } from './hooks/useSubscriptionGate';
export { useFeatureToggle } from './hooks/useFeatureToggle';
export { useChatModeAccess } from './hooks/useChatModeAccess';

// Generic Components (for extensibility)
export { FeatureToggleButton } from './actions/FeatureToggleButton';
export type { FeatureToggleButtonProps } from './actions/FeatureToggleButton';

// Config (for advanced usage)
export { COLOUR_CLASSES, ICON_SIZES } from './config/constants';
export { PROVIDERS, getProviderInfo } from './config/providers';
