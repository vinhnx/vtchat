/**
 * Type definitions for AI SDK reasoning features
 * Based on Google Vertex AI and AI SDK provider documentation
 */

/**
 * Reasoning detail content types
 */
export type ReasoningDetailType = 'text' | 'redacted';

/**
 * Text reasoning detail
 */
export interface TextReasoningDetail {
    type: 'text';
    text: string;
    signature?: string;
}

/**
 * Redacted reasoning detail
 */
export interface RedactedReasoningDetail {
    type: 'redacted';
    data: string;
}

/**
 * Union type for reasoning details
 */
export type ReasoningDetail = TextReasoningDetail | RedactedReasoningDetail;

/**
 * Extended result type with reasoning support
 */
export interface GenerateTextWithReasoningResult {
    text: string;
    sources?: any[];
    groundingMetadata?: any;
    reasoning?: string;
    reasoningDetails?: ReasoningDetail[];
}

/**
 * Thinking mode configuration
 */
export interface ThinkingModeConfig {
    enabled: boolean;
    budget: number;
    includeThoughts: boolean;
}

/**
 * Provider-specific thinking config for Google models
 */
export interface GoogleThinkingConfig {
    includeThoughts?: boolean;
    maxOutputTokens?: number;
    thinkingBudget?: number;
}

/**
 * Extended provider options with reasoning support
 */
export interface ReasoningProviderOptions {
    google?: {
        thinkingConfig?: GoogleThinkingConfig;
    };
    anthropic?: {
        reasoning?: boolean;
    };
}
