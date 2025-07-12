# Reasoning Mode Implementation

## Overview

This document details the complete implementation of AI SDK reasoning tokens support in VTChat, providing advanced AI reasoning capabilities with a magical user experience.

## Features Implemented

### 🧠 Core Reasoning Support

- **AI SDK Integration**: Full support for reasoning tokens from multiple providers
- **Model Compatibility**: Works with Gemini 2.5, DeepSeek R1, Anthropic Claude 4, and OpenAI o-series models
- **Reasoning Types**: Supports text reasoning, redacted content, and structured reasoning details
- **Message Parts**: Handles AI SDK message parts format with reasoning and text components

### 🎨 Visual Design

- **Color Scheme**: Custom palette using #262626 (dark), #BFB38F (gold), #D99A4E (amber)
- **Magical Animations**: Framer Motion powered transitions and hover effects
- **Gradient Backgrounds**: Sophisticated glass-morphism design
- **Interactive Elements**: Sparkles, rotating icons, and smooth scaling effects

### 🔧 Technical Architecture

#### Type System

```typescript
// packages/ai/types/reasoning.ts
export interface ReasoningDetail {
    type: 'text' | 'redacted';
    text?: string;
    data?: string;
    signature?: string;
}

export interface GenerateTextWithReasoningResult {
    text: string;
    reasoning?: string;
    reasoningDetails?: ReasoningDetail[];
}
```

#### Shared Types Extended

```typescript
// packages/shared/types.ts
export type ThreadItem = {
    // ... existing fields
    reasoning?: string;
    reasoningDetails?: Array<{
        type: 'text' | 'redacted';
        text?: string;
        data?: string;
        signature?: string;
    }>;
    parts?: Array<{
        type: 'text' | 'reasoning';
        text?: string;
        details?: Array<{
            type: 'text' | 'redacted';
            text?: string;
        }>;
    }>;
};
```

### 🎯 Model Support Detection

```typescript
// packages/ai/models.ts
export const supportsReasoning = (model: ModelEnum): boolean => {
    const supportedModels = [
        // Gemini 2.5 series
        ModelEnum.GEMINI_2_5_FLASH,
        ModelEnum.GEMINI_2_5_PRO,
        // DeepSeek reasoning
        ModelEnum.Deepseek_R1,
        ModelEnum.DEEPSEEK_R1,
        // Anthropic Claude 4
        ModelEnum.CLAUDE_4_SONNET,
        ModelEnum.CLAUDE_4_OPUS,
        // OpenAI o-series (future)
        ModelEnum.O4_Mini,
    ];
    return supportedModels.includes(model);
};
```

### 🔄 Workflow Integration

#### Reasoning Extraction in Utils

```typescript
// packages/ai/workflow/utils.ts
export const generateText = async ({
    // ... params
    onReasoningDetails?: (details: ReasoningDetail[]) => void;
}) => {
    const streamResult = streamText(streamConfig);

    // Extract reasoning details if available
    try {
        if (streamResult?.reasoningDetails) {
            const reasoningDetails = await streamResult.reasoningDetails;
            onReasoningDetails?.(reasoningDetails);
        }
    } catch (error) {
        console.warn('Failed to resolve reasoningDetails:', error);
    }
};
```

#### Task Integration

```typescript
// packages/ai/workflow/tasks/completion.ts
const response = await generateText({
    // ... config
    onReasoningDetails: details => {
        events?.update('steps', prev => ({
            ...prev,
            0: {
                ...prev?.[0],
                steps: {
                    ...prev?.[0]?.steps,
                    reasoningDetails: {
                        data: details,
                        status: 'COMPLETED',
                    },
                },
            },
        }));
    },
});
```

### 🖥️ UI Components

#### ThinkingLog Component

- **Markdown Rendering**: Full markdown support with custom styling
- **Animated Expansions**: Smooth reveal animations
- **Multi-format Support**: Handles legacy reasoning, AI SDK parts, and structured details
- **Redacted Content**: Special styling for sensitive reasoning content

```typescript
// packages/common/components/thinking-log.tsx
export const ThinkingLog = ({ threadItem }: ThinkingLogProps) => {
    // Supports all reasoning formats:
    // 1. Legacy reasoning text
    // 2. AI SDK reasoning parts
    // 3. Structured reasoning details
};
```

#### Reasoning Mode Settings

- **VT+ Gated**: Requires subscription for access
- **Budget Control**: Slider for reasoning token allocation (1K-50K)
- **Model Compatibility**: Shows warnings for incompatible models
- **Real-time Updates**: Instant feedback on configuration changes

```typescript
// packages/common/components/reasoning-mode-settings.tsx
export const ReasoningModeSettings = () => {
    // Comprehensive settings panel with magical UI
};
```

#### Interactive Thinking Mode Indicator

- **Clickable Badge**: Opens reasoning settings when clicked
- **Model Awareness**: Only shows for compatible models
- **Magical Styling**: Gradient backgrounds with hover effects
- **Settings Integration**: Directly links to reasoning mode panel

```typescript
// packages/common/components/chat-input/thinking-mode-indicator.tsx
const handleClick = () => {
    setSettingTab(SETTING_TABS.REASONING_MODE);
    setIsSettingsOpen(true);
};
```

### ⚙️ Settings Integration

#### New Settings Tab

```typescript
// packages/common/store/app.store.ts
export const SETTING_TABS = {
    // ... existing tabs
    REASONING_MODE: 'reasoning-mode',
};
```

#### Settings Menu Item

```typescript
// packages/common/components/settings-modal.tsx
{
    icon: <Brain size={16} strokeWidth={2} className="text-[#D99A4E]" />,
    title: 'Reasoning Mode',
    description: 'AI reasoning and thinking',
    key: SETTING_TABS.REASONING_MODE,
    component: <ReasoningModeSettings />,
}
```

### 🧪 Testing

#### Model Support Tests

```typescript
// packages/ai/__tests__/reasoning.test.ts
describe('Reasoning Support', () => {
    it('should return true for supported models', () => {
        expect(supportsReasoning(ModelEnum.GEMINI_2_5_PRO)).toBe(true);
        expect(supportsReasoning(ModelEnum.CLAUDE_4_SONNET)).toBe(true);
    });
});
```

#### Component Tests

```typescript
// packages/common/__tests__/thinking-log.test.tsx
describe('ThinkingLog', () => {
    it('should render reasoning content with markdown', () => {
        // Tests for all reasoning formats
    });
});
```

## Design Decisions

### Color Palette Choice

- **#262626**: Primary dark background for depth and sophistication
- **#BFB38F**: Warm gold for primary text and accents
- **#D99A4E**: Vibrant amber for interactive elements and highlights

### Animation Strategy

- **Micro-interactions**: Subtle hover effects and scaling
- **Staggered Animations**: Delayed reveals for content sections
- **Physics-based**: Natural easing and spring animations
- **Performance**: GPU-accelerated transforms only

### Accessibility

- **Keyboard Navigation**: Full keyboard support for reasoning panel
- **Screen Readers**: Proper ARIA labels and semantic markup
- **Color Contrast**: High contrast ratios for all text
- **Reduced Motion**: Respects user motion preferences

## Future Enhancements

### Planned Features

1. **Real-time Reasoning Streaming**: Show reasoning as it's generated
2. **Reasoning History**: Save and review past reasoning processes
3. **Reasoning Analytics**: Insights into AI thinking patterns
4. **Custom Reasoning Prompts**: User-defined reasoning strategies

### Provider Expansions

1. **Google Vertex AI**: Direct vertex provider support
2. **Azure OpenAI**: Enterprise reasoning capabilities
3. **Custom Models**: Support for fine-tuned reasoning models

## Performance Considerations

- **Lazy Loading**: Reasoning content loaded on demand
- **Memory Management**: Proper cleanup of reasoning data
- **Streaming**: Chunked reasoning content for large responses
- **Caching**: Intelligent caching of reasoning configurations

## Security & Privacy

- **Redacted Content**: Proper handling of sensitive reasoning data
- **VT+ Gating**: Secure access control for premium features
- **Data Isolation**: User reasoning data remains private
- **Audit Trail**: Tracking of reasoning feature usage

## Conclusion

The reasoning mode implementation provides a comprehensive, magical, and production-ready solution for AI reasoning visualization in VTChat. The system is designed for scalability, maintainability, and an exceptional user experience.
