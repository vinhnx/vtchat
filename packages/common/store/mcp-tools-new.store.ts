'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// User-specific storage key management for per-account MCP tools isolation
let currentStorageKey = 'mcp-tools-storage-anonymous';
let currentUserId: string | null = null;

/**
 * Get user-specific storage key for MCP tools isolation
 */
function getStorageKey(userId: string | null): string {
    return userId ? `mcp-tools-storage-${userId}` : 'mcp-tools-storage-anonymous';
}

type McpState = {
    mcpConfig: Record<string, string>;
    selectedMCP: string[];
};

type McpActions = {
    setMcpConfig: (mcpConfig: Record<string, string>) => void;
    addMcpConfig: (mcpConfig: Record<string, string>) => void;
    removeMcpConfig: (key: string) => void;
    getMcpConfig: () => Record<string, string>;
    getSelectedMCP: () => Record<string, string>;
    updateSelectedMCP: (updater: (prev: string[]) => string[]) => void;
    switchUserStorage: (userId: string | null) => void;
};

export const useMcpToolsStore = create<McpState & McpActions>()(
    persist(
        immer((set, get) => ({
            mcpConfig: {},
            selectedMCP: [],
            getSelectedMCP: () => {
                const selectedMCP = get().selectedMCP;
                const mcpConfig = get().mcpConfig;
                return selectedMCP.reduce(
                    (acc, mcp) => {
                        acc[mcp] = mcpConfig[mcp];
                        return acc;
                    },
                    {} as Record<string, string>
                );
            },

            updateSelectedMCP: (updater: (prev: string[]) => string[]) => {
                set(state => {
                    state.selectedMCP = updater(state.selectedMCP);
                });
            },

            setMcpConfig: (mcpConfig: Record<string, string>) => {
                set(state => {
                    state.mcpConfig = mcpConfig;
                });
            },

            addMcpConfig: (mcpConfig: Record<string, string>) => {
                set(state => {
                    state.mcpConfig = { ...state.mcpConfig, ...mcpConfig };
                });
            },

            removeMcpConfig: (key: string) => {
                set(state => {
                    const newMcpConfig = { ...state.mcpConfig };
                    delete newMcpConfig[key];
                    state.mcpConfig = newMcpConfig;
                });
            },

            getMcpConfig: () => {
                return get().mcpConfig;
            },

            switchUserStorage: (userId: string | null) => {
                const newUserId = userId || null;

                // Only switch if user changed
                if (currentUserId !== newUserId) {
                    console.log(
                        `[McpTools] Switching storage from user ${currentUserId || 'anonymous'} to ${newUserId || 'anonymous'}`
                    );

                    currentUserId = newUserId;
                    currentStorageKey = getStorageKey(newUserId);

                    // Load MCP tools for the new user from localStorage
                    const storedData = localStorage.getItem(currentStorageKey);
                    const userData = storedData
                        ? JSON.parse(storedData)
                        : { state: { mcpConfig: {}, selectedMCP: [] } };

                    set({
                        mcpConfig: userData.state?.mcpConfig || {},
                        selectedMCP: userData.state?.selectedMCP || [],
                    });

                    console.log(
                        `[McpTools] Loaded ${Object.keys(userData.state?.mcpConfig || {}).length} MCP configs for user: ${newUserId || 'anonymous'}`
                    );
                }
            },
        })),
        {
            name: currentStorageKey,
            storage: {
                getItem: (name: string) => {
                    const key = currentStorageKey || name;
                    const value = localStorage.getItem(key);
                    return value;
                },
                setItem: (name: string, value: string) => {
                    const key = currentStorageKey || name;
                    localStorage.setItem(key, value);
                },
                removeItem: (name: string) => {
                    const key = currentStorageKey || name;
                    localStorage.removeItem(key);
                },
            } as any, // Type assertion to handle Zustand storage interface complexities
        }
    )
);
