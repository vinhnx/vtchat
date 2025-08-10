export type { ToolCall, ToolResult } from "@repo/shared/types";
export { openaiWebSearchTool, openaiWebSearchWithModel, supportsOpenAIWebSearch, } from "./openai-web-search";
export * from "./registry";
export * from "./streaming-utils";
export { openSandbox, startSandbox, stopSandbox, listSandboxes } from "./sandbox";
import { type ModelEnum } from "../models";
/**
 * Get the appropriate web search tool based on the model
 * Returns null if the model doesn't support any web search tools
 */
export declare const getWebSearchTool: (model: ModelEnum) => {
    web_search: import("ai").Tool<import("zod").ZodObject<{
        query: import("zod").ZodString;
    }, "strip", import("zod").ZodTypeAny, {
        query: string;
    }, {
        query: string;
    }>, any> & {
        execute: (args: {
            query: string;
        }, options: import("ai").ToolExecutionOptions) => PromiseLike<any>;
    };
} | null;
//# sourceMappingURL=index.d.ts.map