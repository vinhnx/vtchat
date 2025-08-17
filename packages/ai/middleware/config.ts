import type { LanguageModelV2Middleware } from '@ai-sdk/provider';
import { ModelEnum } from '../models';
import { 
  loggingMiddleware, 
  cachingMiddleware, 
  guardrailsMiddleware 
} from './index';

/**
 * Configuration for middleware selection based on context
 */

export interface MiddlewareConfig {
  enableLogging?: boolean;
  enableCaching?: boolean;
  enableGuardrails?: boolean;
  customMiddleware?: LanguageModelV2Middleware[];
}

/**
 * Get appropriate middleware based on model and user context
 */
export function getMiddlewareForContext(
  model: ModelEnum,
  config: MiddlewareConfig = {}
): LanguageModelV2Middleware[] {
  const middleware: LanguageModelV2Middleware[] = [];
  
  // Add custom middleware first if provided
  if (config.customMiddleware?.length) {
    middleware.push(...config.customMiddleware);
  }
  
  // Add logging middleware if enabled
  if (config.enableLogging) {
    middleware.push(loggingMiddleware);
  }
  
  // Add caching middleware if enabled
  if (config.enableCaching) {
    middleware.push(cachingMiddleware);
  }
  
  // Add guardrails middleware if enabled
  if (config.enableGuardrails) {
    middleware.push(guardrailsMiddleware);
  }
  
  return middleware;
}

/**
 * Default middleware configuration for different use cases
 */
export const MiddlewarePresets = {
  // Development/debugging preset
  DEVELOPMENT: {
    enableLogging: true,
    enableCaching: false,
    enableGuardrails: true,
  },
  
  // Production preset
  PRODUCTION: {
    enableLogging: false,
    enableCaching: true,
    enableGuardrails: true,
  },
  
  // High-performance preset (minimal middleware)
  PERFORMANCE: {
    enableLogging: false,
    enableCaching: true,
    enableGuardrails: false,
  },
  
  // Privacy-focused preset
  PRIVACY: {
    enableLogging: false,
    enableCaching: false, // No caching to avoid storing sensitive data
    enableGuardrails: true,
  },
} as const;

// Type for middleware presets
export type MiddlewarePreset = keyof typeof MiddlewarePresets;