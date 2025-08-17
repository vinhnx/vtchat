import { log } from '@repo/shared/logger';

/**
 * Debug utility to inspect warnings from AI SDK responses
 * Usage: Call this function with the result of generateText or generateObject
 * to check for any warnings about unsupported features
 */
export const inspectWarnings = (result: any, context: string = 'AI operation') => {
  if (result?.warnings && Array.isArray(result.warnings) && result.warnings.length > 0) {
    log.warn(`${context} returned warnings:`, {
      warnings: result.warnings,
      context,
    });
    
    // Log each warning individually for better visibility
    result.warnings.forEach((warning: any, index: number) => {
      log.warn(`Warning ${index + 1}/${result.warnings.length}:`, {
        warning,
        context,
      });
    });
    
    return true;
  }
  
  return false;
};

/**
 * Debug utility to inspect raw HTTP request bodies
 * Usage: Call this function with the result of generateText or generateObject
 * to inspect the exact payload sent to the model provider
 */
export const inspectRequestBody = (result: any, context: string = 'AI operation') => {
  if (result?.request?.body) {
    log.info(`${context} raw request body:`, {
      requestBody: result.request.body,
      context,
    });
    
    return true;
  }
  
  return false;
};

/**
 * Combined debug utility that inspects both warnings and request bodies
 * This is the recommended way to debug AI SDK operations
 */
export const debugAIResponse = (result: any, context: string = 'AI operation') => {
  const hasWarnings = inspectWarnings(result, context);
  const hasRequestBody = inspectRequestBody(result, context);
  
  if (!hasWarnings && !hasRequestBody) {
    log.debug(`${context} completed without warnings or request body data to inspect`);
  }
  
  return {
    hasWarnings,
    hasRequestBody,
  };
};