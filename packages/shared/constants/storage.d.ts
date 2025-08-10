/**
 * Constants for localStorage and storage keys used throughout the application
 */
export declare const STORAGE_KEYS: {
    /**
     * Key for storing user preferences like showExamplePrompts
     */
    readonly USER_PREFERENCES: "vtchat-preferences";
    /**
     * Key for storing chat configuration
     */
    readonly CHAT_CONFIG: "chat-config";
    /**
     * Key for storing API keys
     */
    readonly API_KEYS: "api-keys-storage";
    /**
     * Key for storing MCP tools configuration
     */
    readonly MCP_TOOLS: "mcp-tools-storage";
    /**
     * Key for storing draft messages
     */
    readonly DRAFT_MESSAGE: "draft-message";
    /**
     * Key for tab synchronization events
     */
    readonly SYNC_EVENT: "chat-store-sync-event";
    /**
     * Key for tab synchronization data
     */
    readonly SYNC_DATA: "chat-store-sync-data";
    /**
     * Key for tracking if user has seen the intro dialog
     */
    readonly HAS_SEEN_INTRO: "hasSeenIntro";
};
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
//# sourceMappingURL=storage.d.ts.map