/**
 * Constants for localStorage and storage keys used throughout the application
 */
export const STORAGE_KEYS = {
    /**
     * Key for storing user preferences like showExamplePrompts
     */
    USER_PREFERENCES: 'vtchat-preferences',

    /**
     * Key for storing chat configuration
     */
    CHAT_CONFIG: 'chat-config',

    /**
     * Key for storing API keys
     */
    API_KEYS: 'api-keys-storage',

    /**
     * Key for storing MCP tools configuration
     */
    MCP_TOOLS: 'mcp-tools-storage',

    /**
     * Key for storing draft messages
     */
    DRAFT_MESSAGE: 'draft-message',

    /**
     * Key for tab synchronization events
     */
    SYNC_EVENT: 'chat-store-sync-event',

    /**
     * Key for tab synchronization data
     */
    SYNC_DATA: 'chat-store-sync-data',

    /**
     * Key for tracking if user has seen the intro dialog
     */
    HAS_SEEN_INTRO: 'hasSeenIntro',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
