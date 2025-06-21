'use client';

import { Model, models } from '@repo/ai/models';
import { ChatMode } from '@repo/shared/config';
import { THINKING_MODE } from '@repo/shared/constants';
import { MessageGroup, Thread, ThreadItem } from '@repo/shared/types';
import Dexie, { Table } from 'dexie';
import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { safeJsonParse } from '../utils/storage-cleanup';
import { useAppStore } from './app.store';

class ThreadDatabase extends Dexie {
    threads!: Table<Thread>;
    threadItems!: Table<ThreadItem>;

    constructor(userId?: string) {
        // Create user-specific database name for per-account isolation
        const dbName = userId ? `ThreadDatabase_${userId}` : 'ThreadDatabase_anonymous';
        super(dbName);
        this.version(1).stores({
            threads: 'id, createdAt, pinned, pinnedAt',
            threadItems: 'id, threadId, parentId, createdAt',
        });
    }
}

let db: ThreadDatabase | null = null;
let CONFIG_KEY = 'chat-config';
let currentUserId: string | null = null;

/**
 * Get the current database instance, ensuring it's initialized
 */
function getDatabase(): ThreadDatabase | null {
    if (typeof window === 'undefined') {
        return null;
    }

    if (!db) {
        // Auto-initialize if not already done
        initializeUserDatabase(null);
    }

    return db;
}

/**
 * Initialize or switch to a user-specific database
 */
function initializeUserDatabase(userId: string | null) {
    // Only initialize on client side
    if (typeof window === 'undefined') {
        console.warn('[ThreadDB] Database initialization skipped on server side');
        return null;
    }

    const newUserId = userId || null;

    // Only create new database if user changed
    if (currentUserId !== newUserId) {
        currentUserId = newUserId;
        db = new ThreadDatabase(newUserId || undefined);

        // Update config key to be user-specific for better isolation
        CONFIG_KEY = newUserId ? `chat-config-${newUserId}` : 'chat-config-anonymous';

        console.log(`[ThreadDB] Initialized database for user: ${newUserId || 'anonymous'}`);
    }

    return db;
}

if (typeof window !== 'undefined') {
    // Initialize with anonymous database by default
    initializeUserDatabase(null);
    CONFIG_KEY = 'chat-config-anonymous';
}

const loadInitialData = async () => {
    // Ensure database is initialized (client-side only)
    const database = getDatabase();
    if (!database) {
        // Return default state for SSR or when db is not initialized
        return {
            threads: [],
            currentThreadId: null,
            config: {
                customInstructions: undefined,
                model: models[0].id,
                useWebSearch: false,
                useMathCalculator: false,
                useCharts: false,
                showSuggestions: true,
                chatMode: ChatMode.GEMINI_2_0_FLASH,
            },
            useWebSearch: false,
            useMathCalculator: false,
            useCharts: false,
            chatMode: ChatMode.GEMINI_2_0_FLASH,
            customInstructions: '',
            showSuggestions: false,
        };
    }

    const threads = await database.threads.toArray();

    // Safe JSON parsing for config data
    const configStr = localStorage.getItem(CONFIG_KEY);
    const config = safeJsonParse(configStr, {
        customInstructions: undefined,
        model: models[0].id,
        useWebSearch: false,
        useMathCalculator: false,
        useCharts: false,
        showSuggestions: true,
        chatMode: ChatMode.GEMINI_2_0_FLASH,
        currentThreadId: null,
        thinkingMode: {
            enabled: THINKING_MODE.DEFAULT_ENABLED,
            budget: THINKING_MODE.DEFAULT_BUDGET,
            includeThoughts: THINKING_MODE.DEFAULT_INCLUDE_THOUGHTS,
        },
    });

    const chatMode = config.chatMode || ChatMode.GEMINI_2_0_FLASH;
    
    // Get settings from app store
    const appStore = useAppStore.getState();
    const useWebSearch = appStore.useWebSearch;
    const useMathCalculator = appStore.useMathCalculator;
    const useCharts = appStore.useCharts;
    const customInstructions = appStore.customInstructions;
    const thinkingMode = appStore.thinkingMode;
    const geminiCaching = appStore.geminiCaching;

    // Load and validate the persisted model
    const persistedModelId = config.model;
    const persistedModel = persistedModelId ? models.find(m => m.id === persistedModelId) : null;
    const model = persistedModel || models[0];

    const initialThreads = threads.length ? threads : [];

    return {
        threads: initialThreads.sort((a, b) => b.createdAt?.getTime() - a.createdAt?.getTime()),
        currentThreadId: config.currentThreadId || initialThreads[0]?.id,
        config,
        useWebSearch,
        useMathCalculator,
        useCharts,
        chatMode,
        model,
        customInstructions,
        thinkingMode,
        geminiCaching,
        showSuggestions: false, // Always disable suggestions
    };
};

type ActiveButtonType = 'webSearch' | 'mathCalculator' | 'charts' | 'structuredOutput' | null;

type State = {
    model: Model;
    isGenerating: boolean;
    useWebSearch: boolean;
    useMathCalculator: boolean;
    useCharts: boolean;
    customInstructions: string;
    showSuggestions: boolean;
    editor: any;
    chatMode: ChatMode;
    context: string;
    imageAttachment: { base64?: string; file?: File };
    documentAttachment: { base64?: string; file?: File; mimeType?: string; fileName?: string };
    structuredData: {
        data?: any;
        type?: string;
        fileName?: string;
        extractedAt?: string;
        confidence?: number;
    } | null;
    abortController: AbortController | null;
    threads: Thread[];
    threadItems: ThreadItem[];
    currentThreadId: string | null;
    activeThreadItemView: string | null;
    currentThread: Thread | null;
    currentThreadItem: ThreadItem | null;
    messageGroups: MessageGroup[];
    isLoadingThreads: boolean;
    isLoadingThreadItems: boolean;
    currentSources: string[];
    activeButton: ActiveButtonType;
    // Thinking mode settings (VT+ feature)
    thinkingMode: {
        enabled: boolean;
        budget: number; // 0-24576 for Gemini 2.5 Flash
        includeThoughts: boolean;
    };
    // Gemini explicit caching settings (VT+ feature)
    geminiCaching: {
        enabled: boolean;
        ttlSeconds: number; // Cache time-to-live in seconds
        maxCaches: number; // Maximum number of cached conversations
    };
    // Internal cache for selector results to prevent infinite loops
    _cache?: Record<string, { result: any; length: number }>;
};

type Actions = {
    setModel: (model: Model) => void;
    setEditor: (editor: any) => void;
    setContext: (context: string) => void;
    setImageAttachment: (imageAttachment: { base64?: string; file?: File }) => void;
    clearImageAttachment: () => void;
    setDocumentAttachment: (documentAttachment: {
        base64?: string;
        file?: File;
        mimeType?: string;
        fileName?: string;
    }) => void;
    clearDocumentAttachment: () => void;
    setStructuredData: (structuredData: {
        data?: any;
        type?: string;
        fileName?: string;
        extractedAt?: string;
        confidence?: number;
    }) => void;
    clearStructuredData: () => void;
    setIsGenerating: (isGenerating: boolean) => void;
    stopGeneration: () => void;
    setAbortController: (abortController: AbortController) => void;
    createThread: (optimisticId: string, thread?: Pick<Thread, 'title'>) => Promise<Thread>;
    setChatMode: (chatMode: ChatMode) => void;
    updateThread: (thread: Pick<Thread, 'id' | 'title'>) => Promise<void>;
    getThread: (threadId: string) => Promise<Thread | null>;
    pinThread: (threadId: string) => Promise<void>;
    unpinThread: (threadId: string) => Promise<void>;
    createThreadItem: (threadItem: ThreadItem) => Promise<void>;
    updateThreadItem: (threadId: string, threadItem: Partial<ThreadItem>) => Promise<void>;
    switchThread: (threadId: string) => void;
    setActiveThreadItemView: (threadItemId: string) => void;
    setCustomInstructions: (customInstructions: string) => void;
    deleteThreadItem: (threadItemId: string) => Promise<void>;
    deleteThread: (threadId: string) => Promise<void>;
    getPreviousThreadItems: (threadId?: string) => ThreadItem[];
    getCurrentThreadItem: (threadId?: string) => ThreadItem | null;
    getCurrentThread: () => Thread | null;
    removeFollowupThreadItems: (threadItemId: string) => Promise<void>;
    getThreadItems: (threadId: string) => Promise<ThreadItem[]>;
    loadThreadItems: (threadId: string) => Promise<void>;
    setCurrentThreadItem: (threadItem: ThreadItem) => void;
    clearAllThreads: () => void;
    setCurrentSources: (sources: string[]) => void;
    setUseWebSearch: (useWebSearch: boolean) => void;
    setUseMathCalculator: (useMathCalculator: boolean) => void;
    setUseCharts: (useCharts: boolean) => void;
    setShowSuggestions: (showSuggestions: boolean) => void;
    // Button selection management
    setActiveButton: (button: ActiveButtonType) => void;
    // Thinking mode management (VT+ feature)
    setThinkingMode: (config: {
        enabled: boolean;
        budget?: number;
        includeThoughts?: boolean;
    }) => void;
    // Gemini caching management (VT+ feature)
    setGeminiCaching: (config: {
        enabled: boolean;
        ttlSeconds?: number;
        maxCaches?: number;
    }) => void;
    // Add user-specific database management
    switchUserDatabase: (userId: string | null) => Promise<void>;
};

// Add these utility functions at the top level
const debounce = <T extends (...args: any[]) => any>(
    fn: T,
    delay: number
): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
};

const throttle = <T extends (...args: any[]) => any>(
    fn: T,
    limit: number
): ((...args: Parameters<T>) => void) => {
    let inThrottle = false;
    let lastArgs: Parameters<T> | null = null;

    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            fn(...args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
                if (lastArgs) {
                    fn(...lastArgs);
                    lastArgs = null;
                }
            }, limit);
        } else {
            lastArgs = args;
        }
    };
};

// Add batch update functionality
const DB_UPDATE_THROTTLE = 1000; // 1 second between updates for the same item
const BATCH_PROCESS_INTERVAL = 500; // Process batches every 500ms

// Track the last time each item was updated
const lastItemUpdateTime: Record<string, number> = {};

// Enhanced batch update queue
type BatchUpdateQueue = {
    items: Map<string, ThreadItem>; // Use Map to ensure uniqueness by ID
    timeoutId: NodeJS.Timeout | null;
};

const batchUpdateQueue: BatchUpdateQueue = {
    items: new Map(),
    timeoutId: null,
};

// Process all queued updates as a batch
const processBatchUpdate = async () => {
    if (batchUpdateQueue.items.size === 0) return;

    const itemsToUpdate = Array.from(batchUpdateQueue.items.values());
    batchUpdateQueue.items.clear();

    try {
        await withDatabaseAsync(async database => {
            await database.threadItems.bulkPut(itemsToUpdate);
            return true;
        });
        // Update last update times for all processed items
        itemsToUpdate.forEach(item => {
            lastItemUpdateTime[item.id] = Date.now();
        });
    } catch (error) {
        console.error('Failed to batch update thread items:', error);
        // If bulk update fails, try individual updates to salvage what we can
        for (const item of itemsToUpdate) {
            try {
                await withDatabaseAsync(async database => {
                    await database.threadItems.put(item);
                    return true;
                });
                lastItemUpdateTime[item.id] = Date.now();
            } catch (innerError) {
                console.error(`Failed to update item ${item.id}:`, innerError);
            }
        }
    }
};

// Queue an item for batch update
const queueThreadItemForUpdate = (threadItem: ThreadItem) => {
    // Always update the in-memory Map with the latest version
    batchUpdateQueue.items.set(threadItem.id, threadItem);

    // Schedule batch processing if not already scheduled
    if (!batchUpdateQueue.timeoutId) {
        batchUpdateQueue.timeoutId = setTimeout(() => {
            processBatchUpdate();
            batchUpdateQueue.timeoutId = null;
        }, BATCH_PROCESS_INTERVAL);
    }
};

// Add this near the top of your file after other imports
let dbWorker: SharedWorker | null = null;

// Extend Window interface to include notifyTabSync
declare global {
    interface Window {
        notifyTabSync?: (type: string, data: any) => void;
    }
}

// Function to initialize the shared worker
const initializeWorker = () => {
    if (typeof window === 'undefined') return;

    try {
        // Create a shared worker using the public JS file
        dbWorker = new SharedWorker('/db-sync.worker.js', {
            type: 'module',
        });

        // Set up message handler with enhanced error handling
        dbWorker.port.onmessage = async event => {
            const message = event.data;

            if (!message || !message.type) return;

            try {
                // Handle different message types
                switch (message.type) {
                    case 'connected':
                        console.log('[ChatStore] Connected to SharedWorker:', message.workerId);
                        break;

                    case 'db-operation-result':
                        // Handle database operation results
                        if (message.success) {
                            console.log(
                                '[ChatStore] Database operation succeeded:',
                                message.requestId
                            );
                        } else {
                            console.error('[ChatStore] Database operation failed:', message.error);
                        }
                        break;

                    case 'worker-error':
                        console.error('[ChatStore] Worker error:', message.error);
                        // Fallback to localStorage sync on worker errors
                        initializeTabSync();
                        break;

                    case 'thread-update':
                        // Refresh threads list with better error handling
                        try {
                            const threads = await withDatabaseAsync(async database => {
                                return await database.threads.toArray();
                            });
                            if (threads) {
                                useChatStore.setState({
                                    threads: threads.sort(
                                        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
                                    ),
                                });
                            }
                        } catch (error) {
                            console.error('[ChatStore] Failed to refresh threads:', error);
                        }
                        break;

                    case 'thread-item-update':
                        // Refresh thread items if we're on the same thread with better error handling
                        try {
                            const currentThreadId = useChatStore.getState().currentThreadId;
                            if (message.data?.threadId === currentThreadId) {
                                await useChatStore
                                    .getState()
                                    .loadThreadItems(message.data.threadId);
                            }
                        } catch (error) {
                            console.error('[ChatStore] Failed to refresh thread items:', error);
                        }
                        break;

                    case 'thread-delete':
                        // Handle thread deletion with error handling
                        try {
                            useChatStore.setState(state => {
                                const newState = { ...state };
                                newState.threads = state.threads.filter(
                                    t => t.id !== message.data.threadId
                                );

                                // Update current thread if the deleted one was active
                                if (state.currentThreadId === message.data.threadId) {
                                    newState.currentThreadId = newState.threads[0]?.id || null;
                                    newState.currentThread = newState.threads[0] || null;
                                }

                                return newState;
                            });
                        } catch (error) {
                            console.error('[ChatStore] Failed to handle thread deletion:', error);
                        }
                        break;

                    case 'thread-item-delete':
                        // Handle thread item deletion with error handling
                        try {
                            if (
                                message.data?.threadId === useChatStore.getState().currentThreadId
                            ) {
                                useChatStore.setState(state => ({
                                    threadItems: state.threadItems.filter(
                                        item => item.id !== message.data.id
                                    ),
                                }));
                            }
                        } catch (error) {
                            console.error(
                                '[ChatStore] Failed to handle thread item deletion:',
                                error
                            );
                        }
                        break;

                    default:
                        // Handle unknown message types
                        if (message.fromWorker) {
                            console.log(
                                '[ChatStore] Received unknown message from worker:',
                                message.type
                            );
                        }
                        break;
                }
            } catch (error) {
                console.error('[ChatStore] Error processing worker message:', error);
            }
        };

        // Start the connection
        dbWorker.port.start();

        // Handle worker errors with proper fallback
        dbWorker.onerror = err => {
            console.warn(
                '[ChatStore] SharedWorker connection failed, falling back to localStorage sync:',
                err
            );
            // Fallback to localStorage method
            initializeTabSync();
        };

        // Handle worker port errors (using addEventListener instead of onerror)
        dbWorker.port.addEventListener('error', (err: Event) => {
            console.warn(
                '[ChatStore] SharedWorker port error, falling back to localStorage sync:',
                err
            );
            initializeTabSync();
        });
    } catch (error) {
        console.error('[ChatStore] Failed to initialize SharedWorker:', error);
        // Fallback to localStorage method if SharedWorker isn't supported
        initializeTabSync();
    }
};

// Function to initialize tab synchronization using localStorage
const initializeTabSync = () => {
    if (typeof window === 'undefined') return;

    const SYNC_EVENT_KEY = 'chat-store-sync-event';
    const SYNC_DATA_KEY = 'chat-store-sync-data';

    // Listen for storage events from other tabs
    window.addEventListener('storage', event => {
        if (event.key !== SYNC_EVENT_KEY) return;

        try {
            const syncData = safeJsonParse(localStorage.getItem(SYNC_DATA_KEY), {
                type: null,
                data: { threadId: null, id: null },
            }) as any;

            if (!syncData || !syncData.type) return;

            switch (syncData.type) {
                case 'thread-update':
                    // Refresh threads list
                    withDatabaseAsync(async database => {
                        const threads = await database.threads.toArray();
                        useChatStore.setState({
                            threads: threads.sort(
                                (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
                            ),
                        });
                        return true;
                    });
                    break;

                case 'thread-item-update':
                    // Refresh thread items if we're on the same thread
                    const currentThreadId = useChatStore.getState().currentThreadId;
                    if (syncData.data?.threadId === currentThreadId) {
                        useChatStore.getState().loadThreadItems(syncData.data.threadId);
                    }
                    break;

                case 'thread-delete':
                    // Handle thread deletion
                    useChatStore.setState(state => {
                        const newState = { ...state };
                        newState.threads = state.threads.filter(
                            t => t.id !== syncData.data.threadId
                        );

                        // Update current thread if the deleted one was active
                        if (state.currentThreadId === syncData.data.threadId) {
                            newState.currentThreadId = newState.threads[0]?.id || null;
                            newState.currentThread = newState.threads[0] || null;
                        }

                        return newState;
                    });
                    break;

                case 'thread-item-delete':
                    // Handle thread item deletion
                    if (syncData.data?.threadId === useChatStore.getState().currentThreadId) {
                        useChatStore.setState(state => ({
                            threadItems: state.threadItems.filter(
                                item => item.id !== syncData.data.id
                            ),
                        }));
                    }
                    break;
            }
        } catch (error) {
            console.error('Error processing sync data:', error);
        }
    });

    // Function to notify other tabs about a change
    const notifyOtherTabs = (type: string, data: any) => {
        try {
            // Store the sync data
            localStorage.setItem(
                SYNC_DATA_KEY,
                JSON.stringify({
                    type,
                    data,
                    timestamp: Date.now(),
                })
            );

            // Trigger the storage event in other tabs
            localStorage.setItem(SYNC_EVENT_KEY, Date.now().toString());
        } catch (error) {
            console.error('Error notifying other tabs:', error);
        }
    };

    // Replace the worker notification with localStorage notification
    window.notifyTabSync = notifyOtherTabs;
};

// Function to notify the worker about a change with enhanced database operation support
const notifyWorker = (type: string, data: any, dbOperation?: any) => {
    if (!dbWorker || !dbWorker.port) {
        // Use localStorage fallback if worker isn't available
        if (typeof window !== 'undefined' && window.notifyTabSync) {
            window.notifyTabSync(type, data);
        }
        return;
    }

    try {
        const message = {
            type,
            data,
            timestamp: Date.now(),
            requestId: Math.random().toString(36),
            dbOperation: dbOperation || null,
        };

        dbWorker.port.postMessage(message);
    } catch (error) {
        console.error('[ChatStore] Error notifying worker:', error);

        // Fallback to localStorage if worker communication fails
        if (typeof window !== 'undefined' && window.notifyTabSync) {
            window.notifyTabSync(type, data);
        }
    }
};

// Enhanced function for database operations through worker
const performWorkerDatabaseOperation = async (
    operation: any,
    data: any,
    fallbackFn: () => Promise<any>
) => {
    if (!dbWorker || !dbWorker.port) {
        // Use direct database operation if worker isn't available
        return await fallbackFn();
    }

    try {
        return new Promise((resolve, reject) => {
            const requestId = Math.random().toString(36);
            const timeout = setTimeout(() => {
                reject(new Error('Worker database operation timeout'));
            }, 5000); // 5 second timeout

            // Listen for the result
            const handleMessage = (event: MessageEvent) => {
                if (
                    event.data.type === 'db-operation-result' &&
                    event.data.requestId === requestId
                ) {
                    clearTimeout(timeout);
                    dbWorker!.port.removeEventListener('message', handleMessage);

                    if (event.data.success) {
                        resolve(event.data.result);
                    } else {
                        reject(new Error(event.data.error));
                    }
                }
            };

            if (dbWorker?.port) {
                dbWorker.port.addEventListener('message', handleMessage);

                // Send the operation request
                dbWorker.port.postMessage({
                    type: 'db-operation',
                    requestId,
                    dbOperation: operation,
                    data,
                });
            } else {
                throw new Error('SharedWorker port not available');
            }
        });
    } catch (error) {
        console.error('[ChatStore] Worker database operation failed, using fallback:', error);
        return await fallbackFn();
    }
};

/**
 * Helper function to safely execute database operations
 */
function withDatabase<T>(operation: (db: ThreadDatabase) => T): T | null {
    const database = getDatabase();
    if (!database) {
        console.warn('[ThreadDB] Database not available, skipping operation');
        return null;
    }
    return operation(database);
}

/**
 * Async version of withDatabase for async operations
 */
async function withDatabaseAsync<T>(
    operation: (db: ThreadDatabase) => Promise<T>
): Promise<T | null> {
    const database = getDatabase();
    if (!database) {
        console.warn('[ThreadDB] Database not available, skipping async operation');
        return null;
    }
    try {
        return await operation(database);
    } catch (error) {
        console.error('[ThreadDB] Database operation failed:', error);
        return null;
    }
}

// Create a debounced version of the notification function
const debouncedNotify = debounce(notifyWorker, 300);

export const useChatStore = create(
    immer<State & Actions>((set, get) => ({
        model: models[0],
        isGenerating: false,
        editor: undefined,
        context: '',
        threads: [],
        chatMode: ChatMode.GEMINI_2_0_FLASH,
        threadItems: [],
        useWebSearch: false,
        useMathCalculator: false,
        customInstructions: '',
        currentThreadId: null,
        activeThreadItemView: null,
        currentThread: null,
        currentThreadItem: null,
        imageAttachment: { base64: undefined, file: undefined },
        documentAttachment: {
            base64: undefined,
            file: undefined,
            mimeType: undefined,
            fileName: undefined,
        },
        structuredData: null,
        messageGroups: [],
        abortController: null,
        isLoadingThreads: false,
        isLoadingThreadItems: false,
        currentSources: [],
        activeButton: null,
        showSuggestions: false, // Always disabled
        // Thinking mode defaults (VT+ feature)
        thinkingMode: {
            enabled: THINKING_MODE.DEFAULT_ENABLED,
            budget: THINKING_MODE.DEFAULT_BUDGET,
            includeThoughts: THINKING_MODE.DEFAULT_INCLUDE_THOUGHTS,
        },
        // Gemini caching defaults (VT+ feature)
        geminiCaching: {
            enabled: false,
            ttlSeconds: 300,
            maxCaches: 10,
        },

        setCustomInstructions: (customInstructions: string) => {
            // Save to simple settings
            useAppStore.getState().setCustomInstructions(customInstructions);
            
            // Also maintain backwards compatibility with localStorage
            const existingConfig = safeJsonParse(localStorage.getItem(CONFIG_KEY), {});
            localStorage.setItem(
                CONFIG_KEY,
                JSON.stringify({ ...existingConfig, customInstructions })
            );
            
            set(state => {
                state.customInstructions = customInstructions;
            });
        },

        setImageAttachment: (imageAttachment: { base64?: string; file?: File }) => {
            set(state => {
                state.imageAttachment = imageAttachment;
            });
        },

        clearImageAttachment: () => {
            set(state => {
                state.imageAttachment = { base64: undefined, file: undefined };
            });
        },

        setDocumentAttachment: (documentAttachment: {
            base64?: string;
            file?: File;
            mimeType?: string;
            fileName?: string;
        }) => {
            set(state => {
                state.documentAttachment = documentAttachment;
            });
        },

        clearDocumentAttachment: () => {
            set(state => {
                state.documentAttachment = {
                    base64: undefined,
                    file: undefined,
                    mimeType: undefined,
                    fileName: undefined,
                };
            });
        },

        setStructuredData: (structuredData: {
            data?: any;
            type?: string;
            fileName?: string;
            extractedAt?: string;
        }) => {
            set(state => {
                state.structuredData = structuredData;
            });
        },

        clearStructuredData: () => {
            set(state => {
                state.structuredData = null;
            });
        },

        setActiveThreadItemView: (threadItemId: string) => {
            set(state => {
                state.activeThreadItemView = threadItemId;
            });
        },

        setShowSuggestions: (showSuggestions: boolean) => {
            // Always disable suggestions regardless of input value
            const disabledSuggestions = false;
            
            // Save to simple settings
            useAppStore.getState().setShowSuggestions(!disabledSuggestions);
            
            // Also maintain backwards compatibility with localStorage
            const existingConfig = safeJsonParse(localStorage.getItem(CONFIG_KEY), {});
            localStorage.setItem(
                CONFIG_KEY,
                JSON.stringify({ ...existingConfig, showSuggestions: disabledSuggestions })
            );
            set(state => {
                state.showSuggestions = disabledSuggestions;
            });
        },

        setUseWebSearch: (useWebSearch: boolean) => {
            // Save to simple settings
            useAppStore.getState().setUseWebSearch(useWebSearch);
            
            // Also maintain backwards compatibility with localStorage
            const existingConfig = safeJsonParse(localStorage.getItem(CONFIG_KEY), {});
            localStorage.setItem(CONFIG_KEY, JSON.stringify({ ...existingConfig, useWebSearch }));
            set(state => {
                state.useWebSearch = useWebSearch;
            });
        },

        setUseMathCalculator: (useMathCalculator: boolean) => {
            // Save to simple settings
            useAppStore.getState().setUseMathCalculator(useMathCalculator);
            
            // Also maintain backwards compatibility with localStorage
            const existingConfig = safeJsonParse(localStorage.getItem(CONFIG_KEY), {});
            localStorage.setItem(
                CONFIG_KEY,
                JSON.stringify({ ...existingConfig, useMathCalculator })
            );
            set(state => {
                state.useMathCalculator = useMathCalculator;
            });
        },

        setUseCharts: (useCharts: boolean) => {
            // Save to simple settings
            useAppStore.getState().setUseCharts(useCharts);
            
            // Also maintain backwards compatibility with localStorage
            const existingConfig = safeJsonParse(localStorage.getItem(CONFIG_KEY), {});
            localStorage.setItem(CONFIG_KEY, JSON.stringify({ ...existingConfig, useCharts }));
            set(state => {
                state.useCharts = useCharts;
            });
        },

        setActiveButton: (button: ActiveButtonType) => {
            set(state => {
                // When setting a new active button, deactivate other buttons
                if (button === 'webSearch') {
                    state.activeButton = state.useWebSearch ? null : 'webSearch';
                    state.useWebSearch = !state.useWebSearch;
                    if (state.useWebSearch) {
                        state.useMathCalculator = false;
                        state.useCharts = false;
                    }
                } else if (button === 'mathCalculator') {
                    state.activeButton = state.useMathCalculator ? null : 'mathCalculator';
                    state.useMathCalculator = !state.useMathCalculator;
                    if (state.useMathCalculator) {
                        state.useWebSearch = false;
                        state.useCharts = false;
                    }
                } else if (button === 'charts') {
                    // Ensure useCharts is properly initialized
                    if (state.useCharts === undefined) {
                        console.log('🔧 useCharts was undefined, initializing to false');
                        state.useCharts = false;
                    }
                    console.log('🔧 Before toggle - useCharts:', state.useCharts);
                    state.activeButton = state.useCharts ? null : 'charts';
                    state.useCharts = !state.useCharts;
                    console.log('🔧 After toggle - useCharts:', state.useCharts);
                    if (state.useCharts) {
                        state.useWebSearch = false;
                        state.useMathCalculator = false;
                    }
                } else if (button === 'structuredOutput') {
                    // For structured output, we'll just set it as active
                    // The actual logic is handled in the StructuredOutputButton component
                    state.activeButton =
                        state.activeButton === 'structuredOutput' ? null : 'structuredOutput';
                    if (state.activeButton === 'structuredOutput') {
                        state.useWebSearch = false;
                        state.useMathCalculator = false;
                        state.useCharts = false;
                    }
                } else {
                    state.activeButton = button;
                }

                // Update localStorage for persistent states
                const existingConfig = safeJsonParse(localStorage.getItem(CONFIG_KEY), {});
                localStorage.setItem(
                    CONFIG_KEY,
                    JSON.stringify({
                        ...existingConfig,
                        useWebSearch: state.useWebSearch,
                        useMathCalculator: state.useMathCalculator,
                        useCharts: state.useCharts,
                    })
                );
            });
        },

        setChatMode: (chatMode: ChatMode) => {
            try {
                // Get existing config and merge with new chat mode
                const existingConfig = safeJsonParse(localStorage.getItem(CONFIG_KEY), {});
                const updatedConfig = { ...existingConfig, chatMode };

                // Immediately save to localStorage
                localStorage.setItem(CONFIG_KEY, JSON.stringify(updatedConfig));

                // Verify the save was successful - warn only, don't throw
                const verification = localStorage.getItem(CONFIG_KEY);
                const verifiedConfig = safeJsonParse(verification, {}) as any;
                if (verifiedConfig.chatMode !== chatMode) {
                    console.warn(
                        '[ChatStore] Chat mode persistence verification failed, but continuing'
                    );
                }

                console.log(
                    `[ChatStore] Successfully persisted chat mode: ${chatMode} to ${CONFIG_KEY}`
                );

                // Update state and reset button selections when chat mode changes
                set(state => {
                    state.chatMode = chatMode;
                    // Reset button states when changing chat mode
                    state.activeButton = null;
                    state.useWebSearch = false;
                    state.useMathCalculator = false;
                });
            } catch (error) {
                console.error('[ChatStore] Failed to persist chat mode:', error);
                // Still update state even if persistence fails
                set(state => {
                    state.chatMode = chatMode;
                    state.activeButton = null;
                    state.useWebSearch = false;
                    state.useMathCalculator = false;
                });
                throw error; // Propagate error for handling by caller
            }
        },

        setThinkingMode: (config: {
            enabled: boolean;
            budget?: number;
            includeThoughts?: boolean;
        }) => {
            const thinkingMode = {
                enabled: config.enabled,
                budget: config.budget ?? 2048, // Default budget
                includeThoughts: config.includeThoughts ?? true,
            };

            // Save to simple settings
            useAppStore.getState().setThinkingMode(thinkingMode);

            // Also maintain backwards compatibility with localStorage
            const existingConfig = safeJsonParse(localStorage.getItem(CONFIG_KEY), {});
            localStorage.setItem(CONFIG_KEY, JSON.stringify({ ...existingConfig, thinkingMode }));

            set(state => {
                state.thinkingMode = thinkingMode;
            });
        },

        setGeminiCaching: (config: {
            enabled: boolean;
            ttlSeconds?: number;
            maxCaches?: number;
        }) => {
            const geminiCaching = {
                enabled: config.enabled,
                ttlSeconds: config.ttlSeconds ?? 300, // 5 minutes default
                maxCaches: config.maxCaches ?? 10,
            };

            // Save to simple settings
            useAppStore.getState().setGeminiCaching(geminiCaching);

            // Also maintain backwards compatibility with localStorage
            const existingConfig = safeJsonParse(localStorage.getItem(CONFIG_KEY), {});
            localStorage.setItem(CONFIG_KEY, JSON.stringify({ ...existingConfig, geminiCaching }));

            set(state => {
                state.geminiCaching = geminiCaching;
            });
        },

        pinThread: async (threadId: string) => {
            await withDatabaseAsync(async database => {
                await database.threads.update(threadId, { pinned: true, pinnedAt: new Date() });
                return true;
            });
            set(state => {
                state.threads = state.threads.map(thread =>
                    thread.id === threadId
                        ? { ...thread, pinned: true, pinnedAt: new Date() }
                        : thread
                );
            });
        },

        unpinThread: async (threadId: string) => {
            await withDatabaseAsync(async database => {
                await database.threads.update(threadId, { pinned: false, pinnedAt: new Date() });
                return true;
            });
            set(state => {
                state.threads = state.threads.map(thread =>
                    thread.id === threadId
                        ? { ...thread, pinned: false, pinnedAt: new Date() }
                        : thread
                );
            });
        },

        getPinnedThreads: async () => {
            return (
                (await withDatabaseAsync(async database => {
                    const threads = await database.threads.where('pinned').equals('true').toArray();
                    return threads.sort((a, b) => b.pinnedAt.getTime() - a.pinnedAt.getTime());
                })) || []
            );
        },

        removeFollowupThreadItems: async (threadItemId: string) => {
            const result = await withDatabaseAsync(async database => {
                const threadItem = await database.threadItems.get(threadItemId);
                if (!threadItem) return null;
                const threadItems = await database.threadItems
                    .where('createdAt')
                    .above(threadItem.createdAt)
                    .and(item => item.threadId === threadItem.threadId)
                    .toArray();
                for (const threadItem of threadItems) {
                    await database.threadItems.delete(threadItem.id);
                }
                return threadItem;
            });

            if (!result) return;

            set(state => {
                state.threadItems = state.threadItems.filter(
                    t => t.createdAt <= result.createdAt || t.threadId !== result.threadId
                );
            });

            // Notify other tabs
            debouncedNotify('thread-item-delete', {
                threadId: result.threadId,
                id: threadItemId,
                isFollowupRemoval: true,
            });
        },

        getThreadItems: async (threadId: string) => {
            const threadItems = await withDatabaseAsync(async database => {
                return await database.threadItems.where('threadId').equals(threadId).toArray();
            });
            return threadItems || [];
        },

        setCurrentSources: (sources: string[]) => {
            set(state => {
                state.currentSources = sources;
            });
        },

        setCurrentThreadItem: threadItem =>
            set(state => {
                state.currentThreadItem = threadItem;
            }),

        setEditor: editor =>
            set(state => {
                state.editor = editor;
            }),

        setContext: context =>
            set(state => {
                state.context = context;
            }),

        setIsGenerating: isGenerating => {
            useAppStore.getState().dismissSideDrawer();
            set(state => {
                state.isGenerating = isGenerating;
            });
        },

        stopGeneration: () => {
            set(state => {
                state.isGenerating = false;
                state.abortController?.abort();
            });
        },

        setAbortController: abortController =>
            set(state => {
                state.abortController = abortController;
            }),

        loadThreadItems: async (threadId: string) => {
            const threadItems = await withDatabaseAsync(async database => {
                return await database.threadItems.where('threadId').equals(threadId).toArray();
            });
            set(state => {
                state.threadItems = threadItems || [];
            });
        },

        clearAllThreads: async () => {
            await withDatabaseAsync(async database => {
                await database.threads.clear();
                await database.threadItems.clear();
                return true;
            });
            set(state => {
                state.threads = [];
                state.threadItems = [];
            });
        },

        getThread: async (threadId: string) => {
            return await withDatabaseAsync(async database => {
                const thread = await database.threads.get(threadId);
                return thread || null;
            });
        },

        createThread: async (optimisticId: string, thread?: Pick<Thread, 'title'>) => {
            const threadId = optimisticId || nanoid();
            const newThread = {
                id: threadId,
                title: thread?.title || 'New Thread',
                updatedAt: new Date(),
                createdAt: new Date(),
                pinned: false,
                pinnedAt: new Date(),
            };
            await withDatabaseAsync(async database => {
                await database.threads.add(newThread);
                return true;
            });
            set(state => {
                state.threads.push(newThread);
                state.currentThreadId = newThread.id;
                state.currentThread = newThread;
            });

            // Notify other tabs through the worker
            debouncedNotify('thread-update', { threadId });

            return newThread;
        },

        setModel: async (model: Model) => {
            try {
                // Get existing config and merge with new model
                const existingConfig = safeJsonParse(localStorage.getItem(CONFIG_KEY), {}) as any;
                const updatedConfig = { ...existingConfig, model: model.id };

                // Immediately save to localStorage
                localStorage.setItem(CONFIG_KEY, JSON.stringify(updatedConfig));

                // Verify the save was successful - warn only, don't throw
                const verification = localStorage.getItem(CONFIG_KEY);
                const verifiedConfig = safeJsonParse(verification, {}) as any;
                if (verifiedConfig.model !== model.id) {
                    console.warn(
                        '[ChatStore] Model persistence verification failed, but continuing'
                    );
                }

                console.log(
                    `[ChatStore] Successfully persisted model: ${model.id} to ${CONFIG_KEY}`
                );

                // Update state
                set(state => {
                    state.model = model;
                });
            } catch (error) {
                console.error('[ChatStore] Failed to persist model:', error);
                // Still update state even if persistence fails
                set(state => {
                    state.model = model;
                });
            }
        },

        updateThread: async thread => {
            const existingThread = get().threads.find(t => t.id === thread.id);
            if (!existingThread) return;

            const updatedThread: Thread = {
                ...existingThread,
                ...thread,
                updatedAt: new Date(),
            };

            set(state => {
                const index = state.threads.findIndex((t: Thread) => t.id === thread.id);
                if (index !== -1) {
                    state.threads[index] = updatedThread;
                }
                if (state.currentThreadId === thread.id) {
                    state.currentThread = updatedThread;
                }
            });

            try {
                await withDatabaseAsync(async database => {
                    await database.threads.put(updatedThread);
                    return true;
                });

                // Notify other tabs about the update
                debouncedNotify('thread-update', { threadId: thread.id });
            } catch (error) {
                console.error('Failed to update thread in database:', error);
            }
        },

        createThreadItem: async threadItem => {
            const threadId = get().currentThreadId;
            if (!threadId) return;
            try {
                withDatabase(database => {
                    if (database) {
                        database.threadItems.put(threadItem);
                    }
                });
                set(state => {
                    // Clear cache since we're modifying threadItems
                    state._cache = {};
                    
                    if (state.threadItems.find(t => t.id === threadItem.id)) {
                        state.threadItems = state.threadItems.map(t =>
                            t.id === threadItem.id ? threadItem : t
                        );
                    } else {
                        state.threadItems.push({ ...threadItem, threadId });
                    }
                });

                // Notify other tabs
                debouncedNotify('thread-item-update', {
                    threadId,
                    id: threadItem.id,
                });
            } catch (error) {
                console.error('Failed to create thread item:', error);
                // Handle error appropriately
            }
        },

        updateThreadItem: async (threadId, threadItem) => {
            if (!threadItem.id) return;
            if (!threadId) return;

            try {
                // // Fetch the existing item
                // let existingItem: ThreadItem | undefined;
                // try {
                //     db.threadItems.get(threadItem.id);
                // } catch (error) {
                //     console.warn(`Couldn't fetch existing item ${threadItem.id}:`, error);
                // }

                const existingItem = get().threadItems.find(t => t.id === threadItem.id);

                // Create or update the item
                const updatedItem = existingItem
                    ? { ...existingItem, ...threadItem, threadId, updatedAt: new Date() }
                    : ({
                          id: threadItem.id,
                          threadId,
                          createdAt: new Date(),
                          updatedAt: new Date(),
                          ...threadItem,
                      } as ThreadItem);

                // Update UI state immediately
                set(state => {
                    // Clear cache since we're modifying threadItems
                    state._cache = {};
                    
                    const index = state.threadItems.findIndex(t => t.id === threadItem.id);
                    if (index !== -1) {
                        state.threadItems[index] = updatedItem;
                    } else {
                        state.threadItems.push(updatedItem);
                    }
                });

                // // Determine if this is a critical update that should bypass throttling
                // const isCriticalUpdate =
                //     !existingItem || // New items
                //     threadItem.status === 'COMPLETED' || // Final updates
                //     threadItem.status === 'ERROR' || // Error states
                //     threadItem.status === 'ABORTED' || // Aborted states
                //     threadItem.error !== undefined; // Any error information

                // // Always persist final updates - this fixes the issue with missing updates at stream completion
                // if (
                //     threadItem.persistToDB === true ||
                //     isCriticalUpdate ||
                //     timeSinceLastUpdate > DB_UPDATE_THROTTLE
                // ) {
                //     // For critical updates or if enough time has passed, queue for immediate update
                //     queueThreadItemForUpdate(updatedItem);

                queueThreadItemForUpdate(updatedItem);

                // Notify other tabs about the update
                debouncedNotify('thread-item-update', {
                    threadId,
                    id: threadItem.id,
                });

                // if (isCriticalUpdate) {
                //     lastItemUpdateTime[threadItem.id] = now;
                // }
                // }
                // Non-critical updates that are too soon after the last update
                // won't be persisted yet, but will be in the UI state
            } catch (error) {
                console.error('Error in updateThreadItem:', error);

                // Safety fallback - try to persist directly in case of errors in the main logic
                try {
                    const fallbackItem = {
                        id: threadItem.id,
                        threadId,
                        query: threadItem.query || '',
                        mode: threadItem.mode || ChatMode.GEMINI_2_0_FLASH,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        ...threadItem,
                        error: threadItem.error || `Something went wrong`,
                    };
                    await withDatabaseAsync(async database => {
                        await database.threadItems.put(fallbackItem);
                        return true;
                    });
                } catch (fallbackError) {
                    console.error(
                        'Critical: Failed even fallback thread item update:',
                        fallbackError
                    );
                }
            }
        },

        switchThread: async (threadId: string) => {
            const thread = get().threads.find(t => t.id === threadId);

            // Safely get existing config to preserve other settings
            const existingConfig = safeJsonParse(localStorage.getItem(CONFIG_KEY), {});
            const currentModel = get().model;

            // Only update config if model is available
            if (currentModel?.id) {
                const updatedConfig = {
                    ...existingConfig,
                    model: currentModel.id,
                    currentThreadId: threadId,
                };
                localStorage.setItem(CONFIG_KEY, JSON.stringify(updatedConfig));
            } else {
                // If model is not available yet, just update thread ID
                const updatedConfig = {
                    ...existingConfig,
                    currentThreadId: threadId,
                };
                localStorage.setItem(CONFIG_KEY, JSON.stringify(updatedConfig));
            }

            set(state => {
                state.currentThreadId = threadId;
                state.currentThread = thread || null;
            });
            get().loadThreadItems(threadId);
        },

        deleteThreadItem: async threadItemId => {
            const threadId = get().currentThreadId;
            if (!threadId) return;

            await withDatabaseAsync(async database => {
                await database.threadItems.delete(threadItemId);
                return true;
            });

            set(state => {
                state.threadItems = state.threadItems.filter(
                    (t: ThreadItem) => t.id !== threadItemId
                );
            });

            // Notify other tabs
            debouncedNotify('thread-item-delete', { id: threadItemId, threadId });

            // Check if there are any thread items left for this thread
            const remainingItems = await withDatabaseAsync(async database => {
                return await database.threadItems.where('threadId').equals(threadId).count();
            });

            // If no items remain, delete the thread and redirect
            if (remainingItems === 0) {
                await withDatabaseAsync(async database => {
                    await database.threads.delete(threadId);
                    return true;
                });
                set(state => {
                    state.threads = state.threads.filter((t: Thread) => t.id !== threadId);
                    state.currentThreadId = state.threads[0]?.id;
                    state.currentThread = state.threads[0] || null;
                });

                // Redirect to /chat page
                if (typeof window !== 'undefined') {
                    window.location.href = '/chat';
                }
            }
        },

        deleteThread: async threadId => {
            await withDatabaseAsync(async database => {
                await database.threads.delete(threadId);
                await database.threadItems.where('threadId').equals(threadId).delete();
                return true;
            });
            set(state => {
                state.threads = state.threads.filter((t: Thread) => t.id !== threadId);
                state.currentThreadId = state.threads[0]?.id;
                state.currentThread = state.threads[0] || null;
            });

            // Notify other tabs
            debouncedNotify('thread-delete', { threadId });
        },

        getPreviousThreadItems: threadId => {
            const state = get();
            const cacheKey = `prev_${threadId}`;
            
            // Simple cache to prevent infinite loops
            if (state._cache?.[cacheKey]) {
                const cached = state._cache[cacheKey];
                // Check if thread items for this thread have changed
                const currentItems = state.threadItems.filter(item => item.threadId === threadId);
                if (cached.length === currentItems.length) {
                    return cached.result;
                }
            }

            const allThreadItems = state.threadItems
                .filter(item => item.threadId === threadId)
                .sort((a, b) => {
                    return a.createdAt.getTime() - b.createdAt.getTime();
                });

            const result = allThreadItems.length > 1 ? allThreadItems.slice(0, -1) : [];
            
            // Cache the result
            set(state => {
                if (!state._cache) state._cache = {};
                state._cache[cacheKey] = { result, length: allThreadItems.length };
            });

            return result;
        },

        getCurrentThreadItem: () => {
            const state = get();
            const cacheKey = `current_${state.currentThreadId}`;
            
            // Simple cache to prevent infinite loops
            if (state._cache?.[cacheKey]) {
                const cached = state._cache[cacheKey];
                const currentItems = state.threadItems.filter(item => item.threadId === state.currentThreadId);
                if (cached.length === currentItems.length) {
                    return cached.result;
                }
            }

            const allThreadItems = state.threadItems
                .filter(item => item.threadId === state.currentThreadId)
                .sort((a, b) => {
                    return a.createdAt.getTime() - b.createdAt.getTime();
                });
            
            const result = allThreadItems[allThreadItems.length - 1] || null;
            
            // Cache the result
            set(state => {
                if (!state._cache) state._cache = {};
                state._cache[cacheKey] = { result, length: allThreadItems.length };
            });

            return result;
        },

        getCurrentThread: () => {
            const state = get();
            return state.threads.find(t => t.id === state.currentThreadId) || null;
        },

        // User-specific database management for per-account thread isolation
        switchUserDatabase: async (userId: string | null) => {
            try {
                console.log(`[ThreadDB] Switching to database for user: ${userId || 'anonymous'}`);

                // Initialize the new user-specific database
                initializeUserDatabase(userId);

                // Load data from the new database
                const newData = await loadInitialData();

                // Update the store with data from the new user's database
                set({
                    threads: newData.threads,
                    threadItems: [],
                    currentThreadId: newData.currentThreadId,
                    currentThread:
                        newData.threads.find(t => t.id === newData.currentThreadId) ||
                        newData.threads?.[0] ||
                        null,
                    chatMode: newData.chatMode,
                    useWebSearch: newData.useWebSearch,
                    showSuggestions: newData.showSuggestions,
                    customInstructions: newData.customInstructions,
                });

                // Ensure the new config is immediately persisted
                try {
                    const configToSave = {
                        chatMode: newData.chatMode,
                        useWebSearch: newData.useWebSearch,
                        showSuggestions: newData.showSuggestions,
                        customInstructions: newData.customInstructions,
                        currentThreadId: newData.currentThreadId,
                    };
                    localStorage.setItem(CONFIG_KEY, JSON.stringify(configToSave));
                    console.log(
                        `[ThreadDB] Persisted config for user ${userId || 'anonymous'} to ${CONFIG_KEY}`
                    );
                } catch (configError) {
                    console.error(
                        '[ThreadDB] Failed to persist config after user switch:',
                        configError
                    );
                }

                console.log(
                    `[ThreadDB] Successfully switched to user database with ${newData.threads.length} threads`
                );
            } catch (error) {
                console.error('[ThreadDB] Error switching user database:', error);
                // On error, ensure we have a clean state
                set({
                    threads: [],
                    threadItems: [],
                    currentThreadId: null,
                    currentThread: null,
                });
            }
        },
    }))
);

if (typeof window !== 'undefined') {
    // Initialize store with data from IndexedDB
    loadInitialData().then(
        ({
            threads,
            currentThreadId,
            chatMode,
            model,
            useWebSearch,
            useMathCalculator,
            showSuggestions,
            customInstructions,
        }) => {
            useChatStore.setState({
                threads,
                currentThreadId,
                currentThread: threads.find(t => t.id === currentThreadId) || threads?.[0],
                chatMode,
                model,
                useWebSearch,
                useMathCalculator,
                showSuggestions,
                customInstructions,
            });

            // Initialize the shared worker for tab synchronization
            if ('SharedWorker' in window) {
                initializeWorker();
            } else {
                // Fallback to localStorage method
                initializeTabSync();
            }
        }
    );
}
