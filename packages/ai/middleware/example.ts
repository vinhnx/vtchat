/**
 * Example usage of VT Chat Middleware System
 * 
 * This file demonstrates how to use the middleware system in VT Chat.
 */

import { ModelEnum } from '../models';
import { getLanguageModel } from '../providers';
import { MiddlewarePresets } from '../middleware/config';

// Example 1: Using a middleware preset
const modelWithPreset = getLanguageModel(
  ModelEnum.GPT_4o_Mini,
  undefined, // No direct middleware
  undefined, // No BYOK keys
  undefined, // No search grounding
  undefined, // No cached content
  undefined, // No Claude 4 interleaved thinking
  true, // VT+ user
  MiddlewarePresets.DEVELOPMENT // Use development preset
);

// Example 2: Using custom middleware configuration
const modelWithCustomConfig = getLanguageModel(
  ModelEnum.GPT_4o_Mini,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  true,
  {
    enableLogging: true,
    enableCaching: true,
    enableGuardrails: false,
  }
);

// Example 3: Combining provided middleware with configured middleware
import { loggingMiddleware } from '../middleware';

const modelWithCombinedMiddleware = getLanguageModel(
  ModelEnum.GPT_4o_Mini,
  loggingMiddleware, // Provided middleware
  undefined,
  undefined,
  undefined,
  undefined,
  true,
  {
    enableCaching: true, // Configured middleware
  }
);

// Example 4: Using production preset for better performance
const productionModel = getLanguageModel(
  ModelEnum.GPT_4o_Mini,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  true,
  MiddlewarePresets.PRODUCTION
);

export {
  modelWithPreset,
  modelWithCustomConfig,
  modelWithCombinedMiddleware,
  productionModel
};