export { openaiWebSearchTool, openaiWebSearchWithModel, supportsOpenAIWebSearch, } from "./openai-web-search";
// Tool registry and management
export * from "./registry";
// Enhanced streaming utilities
export * from "./streaming-utils";
// Sandbox tools
export { openSandbox, startSandbox, stopSandbox, listSandboxes } from "./sandbox";
import { supportsOpenAIWebSearch as modelSupportsOpenAIWebSearch } from "../models";
import { openaiWebSearchTool } from "./openai-web-search";
/**
 * Get the appropriate web search tool based on the model
 * Returns null if the model doesn't support any web search tools
 */
export var getWebSearchTool = function (model) {
    // Check if model supports OpenAI web search
    if (modelSupportsOpenAIWebSearch(model)) {
        return {
            web_search: openaiWebSearchTool(),
        };
    }
    // For models that don't support native web search, return null
    // The application can fall back to other search implementations
    return null;
};
