import { log } from '@repo/shared/logger'

// In-memory cache for embeddings to avoid duplicate API calls
const embeddingCache = new Map<string, number[]>()

// Pre-computed tool embeddings cache to avoid re-computing on every request
const toolEmbeddingCache = new Map<string, number[]>()

/**
 * Generate text embeddings using OpenAI's text-embedding-3-small model
 */
export async function getEmbedding(
    text: string, 
    apiKeys?: Record<string, string>
): Promise<number[]> {
    const cacheKey = `${text.trim()}`
    
    // Check cache first
    if (embeddingCache.has(cacheKey)) {
        return embeddingCache.get(cacheKey)!
    }

    const apiKey = apiKeys?.openai || process.env.OPENAI_API_KEY
    if (!apiKey) {
        log.error('OPENAI_API_KEY missing – semantic router disabled')
        throw new Error('OPENAI_API_KEY missing – semantic router disabled')
    }

    try {
        const response = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'text-embedding-3-small',
                input: text.trim(),
                encoding_format: 'float'
            })
        })

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        const embedding = data.data[0].embedding as number[]
        
        // Cache the result
        embeddingCache.set(cacheKey, embedding)
        
        log.debug({ textLength: text.length, embeddingLength: embedding.length }, 'Generated embedding')
        
        return embedding
    } catch (error) {
        log.error({ error, text: text.substring(0, 100) }, 'Failed to generate embedding')
        throw error
    }
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosine(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) {
        throw new Error('Vectors must have the same length for cosine similarity')
    }

    const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0)
    const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a * a, 0))
    const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b * b, 0))

    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0
    }

    return dotProduct / (magnitudeA * magnitudeB)
}

/**
 * Batch generate embeddings for multiple texts (for tool registry initialization)
 */
export async function getBatchEmbeddings(
    texts: string[],
    apiKeys?: Record<string, string>
): Promise<number[][]> {
    // For now, process sequentially to avoid rate limits
    // Could be optimized with OpenAI's batch API in the future
    const embeddings: number[][] = []
    
    for (const text of texts) {
        const embedding = await getEmbedding(text, apiKeys)
        embeddings.push(embedding)
    }
    
    return embeddings
}

/**
 * Clear the embedding cache (useful for testing)
 */
export function clearEmbeddingCache(): void {
    embeddingCache.clear()
}

/**
 * Get cache statistics
 */
export function getEmbeddingCacheStats(): { size: number; keys: string[] } {
    return {
        size: embeddingCache.size,
        keys: Array.from(embeddingCache.keys())
    }
}

/**
 * Get tool embedding with caching - optimized for pre-computed tool embeddings
 */
export async function getToolEmbedding(
    toolId: string, 
    text: string, 
    apiKeys?: Record<string, string>
): Promise<number[]> {
    // Check tool-specific cache first
    if (toolEmbeddingCache.has(toolId)) {
        return toolEmbeddingCache.get(toolId)!
    }
    
    // Generate and cache
    const embedding = await getEmbedding(text, apiKeys)
    toolEmbeddingCache.set(toolId, embedding)
    
    return embedding
}

/**
 * Pre-warm cache with tool embeddings (legacy - kept for compatibility)
 * @deprecated Use getToolEmbedding() instead for better performance
 */
export async function preWarmToolEmbeddings(
    toolDescriptions: { id: string; text: string }[],
    apiKeys?: Record<string, string>
): Promise<Record<string, number[]>> {
    log.info({ toolCount: toolDescriptions.length }, 'Pre-warming tool embeddings')
    
    const embeddings: Record<string, number[]> = {}
    
    for (const { id, text } of toolDescriptions) {
        try {
            const embedding = await getToolEmbedding(id, text, apiKeys)
            embeddings[id] = embedding
        } catch (error) {
            log.error({ error, toolId: id }, 'Failed to generate tool embedding')
        }
    }
    
    log.info({ generatedCount: Object.keys(embeddings).length }, 'Tool embeddings pre-warmed')
    
    return embeddings
}

/**
 * Pre-compute tool embeddings at module initialization for better performance
 * This runs once when the module is first loaded
 */
export async function initializeToolEmbeddings(): Promise<void> {
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
        return // Skip in test environment
    }
    
    try {
        // Import here to avoid circular dependency
        const { getAllToolDescriptions } = await import('../tool-registry')
        const toolDescriptions = getAllToolDescriptions()
        
        log.info({ toolCount: toolDescriptions.length }, 'Initializing tool embeddings at startup')
        
        // Pre-compute all tool embeddings
        await Promise.all(
            toolDescriptions.map(async ({ id, text }) => {
                try {
                    await getToolEmbedding(id, text)
                } catch (error) {
                    log.warn({ error, toolId: id }, 'Failed to pre-compute tool embedding')
                }
            })
        )
        
        log.info({ cachedCount: toolEmbeddingCache.size }, 'Tool embeddings initialized')
    } catch (error) {
        log.warn({ error }, 'Tool embedding initialization failed - will compute on demand')
    }
}

// Auto-initialize tool embeddings when module loads (in non-test environments)
if (typeof process === 'undefined' || process.env.NODE_ENV !== 'test') {
    initializeToolEmbeddings().catch(error => {
        log.warn({ error }, 'Background tool embedding initialization failed')
    })
}
