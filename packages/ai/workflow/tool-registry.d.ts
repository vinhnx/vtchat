import { type UserTierType } from "@repo/shared/constants/user-tiers";
export type ToolTier = UserTierType;
export interface ToolMeta {
    id: string;
    name: string;
    description: string;
    tier: ToolTier;
    activate: (context: any) => void;
    keywords: string[];
    examples: string[];
}
export declare const TOOL_REGISTRY: ToolMeta[];
/**
 * Get tool by ID
 */
export declare function getToolById(id: string): ToolMeta | undefined;
/**
 * Get available tools for user tier
 */
export declare function getAvailableTools(userTier?: ToolTier): ToolMeta[];
/**
 * Check if user has access to a specific tool
 */
export declare function hasToolAccess(toolId: string, userTier?: ToolTier): boolean;
/**
 * Get all tool descriptions for embedding generation
 */
export declare function getAllToolDescriptions(): {
    id: string;
    text: string;
}[];
//# sourceMappingURL=tool-registry.d.ts.map