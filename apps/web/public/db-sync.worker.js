// This is a shared worker that handles database synchronization across tabs
// SharedWorkers are accessible from multiple browser contexts (tabs, windows)

const connections = new Set();
const broadcastChannel = new BroadcastChannel('chat-sync-channel');

// State management for the worker
let isInitialized = false;
let dbInstance = null;

// Simple logger for SharedWorker context (can't use pino directly in web workers)
// Only logs in development mode
// Check for production flag via URL query param since process.env is not available in browser workers
const IS_PRODUCTION = self.location.search.includes('prod=true');

const workerLog = {
    info: (message, data) => {
        if (IS_PRODUCTION) return;
        console.log(`[SharedWorker] ${message}`, data || '');
    },
    error: (message, data) => {
        // Always log errors even in production
        console.error(`[SharedWorker] ${message}`, data || '');
    },
    warn: (message, data) => {
        // Always log warnings even in production
        console.warn(`[SharedWorker] ${message}`, data || '');
    },
    debug: (message, data) => {
        if (IS_PRODUCTION) return;
        console.debug(`[SharedWorker] ${message}`, data || '');
    },
};

// Initialize IndexedDB in the worker context
async function initializeDatabase() {
    if (isInitialized && dbInstance) return dbInstance;

    try {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('ThreadDatabase', 1);

            request.onerror = () => {
                workerLog.error('Database connection failed', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                dbInstance = request.result;
                isInitialized = true;
                workerLog.info('Database initialized successfully');
                resolve(dbInstance);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create object stores if they don't exist
                if (!db.objectStoreNames.contains('threads')) {
                    const threadsStore = db.createObjectStore('threads', {
                        keyPath: 'id',
                    });
                    threadsStore.createIndex('createdAt', 'createdAt');
                    threadsStore.createIndex('pinned', 'pinned');
                    threadsStore.createIndex('pinnedAt', 'pinnedAt');
                }

                if (!db.objectStoreNames.contains('threadItems')) {
                    const itemsStore = db.createObjectStore('threadItems', {
                        keyPath: 'id',
                    });
                    itemsStore.createIndex('threadId', 'threadId');
                    itemsStore.createIndex('parentId', 'parentId');
                    itemsStore.createIndex('createdAt', 'createdAt');
                }
            };
        });
    } catch (error) {
        workerLog.error('Failed to initialize database', error);
        throw error;
    }
}

// Handle database operations in the worker
async function performDatabaseOperation(operation, data) {
    try {
        const db = await initializeDatabase();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([operation.store], operation.mode || 'readwrite');
            const store = transaction.objectStore(operation.store);

            let request;

            switch (operation.type) {
                case 'put':
                    request = store.put(data);
                    break;
                case 'add':
                    request = store.add(data);
                    break;
                case 'delete':
                    request = store.delete(data.id);
                    break;
                case 'get':
                    request = store.get(data.id);
                    break;
                case 'getAll':
                    if (data.index) {
                        const index = store.index(data.index);
                        request = index.getAll(data.value);
                    } else {
                        request = store.getAll();
                    }
                    break;
                case 'bulkPut': {
                    // Handle bulk operations
                    const promises = data.items.map((item) => {
                        return new Promise((res, rej) => {
                            const req = store.put(item);
                            req.onsuccess = () => res(req.result);
                            req.onerror = () => rej(req.error);
                        });
                    });
                    Promise.all(promises).then(resolve).catch(reject);
                    return;
                }
                default:
                    reject(new Error(`Unknown operation type: ${operation.type}`));
                    return;
            }

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);

            transaction.onerror = () => reject(transaction.error);
        });
    } catch (error) {
        workerLog.error('Database operation failed', error);
        throw error;
    }
}

// Handle messages from individual tabs
self.onconnect = (event) => {
    const port = event.ports[0];
    connections.add(port);

    port.onmessage = async (e) => {
        await handleMessage(e.data, port);
    };

    port.start();

    // Remove connection when tab closes
    port.addEventListener('close', () => {
        connections.delete(port);
    });

    // Send initial connection confirmation
    port.postMessage({ type: 'connected', workerId: Math.random().toString(36) });
};

// Handle broadcast channel messages (alternative approach)
broadcastChannel.onmessage = (event) => {
    // Forward messages to all connected tabs
    for (const port of Array.from(connections)) {
        try {
            port.postMessage(event.data);
        } catch (error) {
            workerLog.error('Failed to post message to port', error);
            connections.delete(port); // Remove failed connections
        }
    }
};

// Enhanced message handler with database operations
async function handleMessage(message, sourcePort) {
    try {
        // Log the action for debugging
        if (message.type) {
            workerLog.info(`Received ${message.type} event`);
        }

        // Handle database operations directly in the worker
        if (message.dbOperation) {
            try {
                const result = await performDatabaseOperation(message.dbOperation, message.data);

                // Send result back to the requesting tab
                sourcePort.postMessage({
                    type: 'db-operation-result',
                    requestId: message.requestId,
                    result,
                    success: true,
                });

                // Also broadcast the change to other tabs
                const broadcastMessage = {
                    type: message.type,
                    data: message.data,
                    timestamp: Date.now(),
                    fromWorker: true,
                };

                for (const port of Array.from(connections)) {
                    if (port !== sourcePort) {
                        try {
                            port.postMessage(broadcastMessage);
                        } catch (error) {
                            workerLog.error('Failed to broadcast to port', error);
                            connections.delete(port);
                        }
                    }
                }
            } catch (error) {
                workerLog.error('Database operation failed', error);
                sourcePort.postMessage({
                    type: 'db-operation-result',
                    requestId: message.requestId,
                    error: error.message,
                    success: false,
                });
            }

            return;
        }

        // Regular message broadcasting (fallback for non-DB operations)
        const broadcastMessage = {
            ...message,
            timestamp: Date.now(),
            fromWorker: true,
        };

        for (const port of Array.from(connections)) {
            if (port !== sourcePort) {
                try {
                    port.postMessage(broadcastMessage);
                } catch (error) {
                    workerLog.error('Failed to broadcast message', error);
                    connections.delete(port); // Remove failed connections
                }
            }
        }

        // Also use BroadcastChannel as backup
        try {
            broadcastChannel.postMessage(broadcastMessage);
        } catch (error) {
            workerLog.error('Failed to broadcast via BroadcastChannel', error);
        }
    } catch (error) {
        workerLog.error('Error handling message', error);

        // Send error back to source
        try {
            sourcePort.postMessage({
                type: 'worker-error',
                error: error.message,
                originalMessage: message,
            });
        } catch (postError) {
            workerLog.error('Failed to send error message', postError);
        }
    }
}
