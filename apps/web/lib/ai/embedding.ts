
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '../database';
import { cosineDistance, desc, gt, sql } from 'drizzle-orm';
import { embeddings } from '../database/schema';
import { 
    EMBEDDING_MODELS, 
    EMBEDDING_MODEL_CONFIG, 
    DEFAULT_EMBEDDING_MODEL,
    type EmbeddingModel 
} from '@repo/shared/config/embedding-models';
import { type ApiKeys } from '@repo/common/store';

// Helper function to check if a model is a Gemini model
function isGeminiModel(model: EmbeddingModel): boolean {
    return model === EMBEDDING_MODELS.GEMINI_004 || 
           model === EMBEDDING_MODELS.GEMINI_EXP || 
           model === EMBEDDING_MODELS.GEMINI_001;
}

// Get embedding model from user preference, environment, or use default
export function getEmbeddingModel(userPreference?: EmbeddingModel): EmbeddingModel {
    if (userPreference && Object.values(EMBEDDING_MODELS).includes(userPreference)) {
        return userPreference;
    }
    
    const envModel = process.env.EMBEDDING_MODEL as EmbeddingModel;
    return envModel && Object.values(EMBEDDING_MODELS).includes(envModel) 
        ? envModel 
        : DEFAULT_EMBEDDING_MODEL;
}

const generateChunks = (input: string): string[] => {
    return input
        .trim()
        .split('.')
        .filter(i => i !== '');
};

async function generateEmbeddingWithProvider(
    text: string, 
    model: EmbeddingModel,
    apiKeys: ApiKeys
): Promise<number[]> {
    const input = text.replaceAll('\\n', ' ');
    
    // Only support Gemini models for now
    const geminiApiKey = apiKeys?.GEMINI_API_KEY;
    if (!geminiApiKey) {
        throw new Error('Gemini API key is required for RAG embeddings. Please add it in Settings → API Keys.');
    }
    
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const modelConfig = EMBEDDING_MODEL_CONFIG[model];
    const geminiModel = genAI.getGenerativeModel({ 
        model: modelConfig.id 
    });
    const result = await geminiModel.embedContent(input);
    const embedding = result.embedding.values || [];
    
    console.log('🔍 Embedding Debug:', {
        model: modelConfig.id,
        expectedDimensions: modelConfig.dimensions,
        actualDimensions: embedding.length,
        inputLength: input.length
    });
    
    return embedding;
}

export const generateEmbeddings = async (
    value: string,
    apiKeys: ApiKeys,
    userModel?: EmbeddingModel
): Promise<Array<{ embedding: number[]; content: string }>> => {
    const chunks = generateChunks(value);
    const embeddingModel = getEmbeddingModel(userModel);
    
    console.log('🔍 RAG Debug:', {
        userModel,
        resolvedModel: embeddingModel,
        isGemini: isGeminiModel(embeddingModel),
        hasGeminiKey: !!apiKeys?.GEMINI_API_KEY,
        availableKeys: Object.keys(apiKeys || {})
    });

    // For now, only support Gemini models - simplify logic
    const geminiApiKey = apiKeys?.GEMINI_API_KEY;
    if (!geminiApiKey) {
        const availableKeys = Object.keys(apiKeys || {}).filter(key => key.endsWith('_API_KEY'));
        throw new Error(`RAG Knowledge Chat requires a Google Gemini API key.

🔧 To fix this:
1. Go to Settings → API Keys
2. Add your Google Gemini API key 
   - Get free key: https://ai.google.dev/api

You currently have: ${availableKeys.length > 0 ? availableKeys.join(', ') : 'no API keys configured'}

Selected embedding model: ${EMBEDDING_MODEL_CONFIG[embeddingModel].name}`);
    }
    
    // Process chunks with rate limiting to avoid API overwhelm
    const results = [];
    for (const chunk of chunks) {
        try {
            const embedding = await generateEmbeddingWithProvider(chunk, embeddingModel, apiKeys);
            results.push({ content: chunk, embedding });
            // Small delay to avoid rate limiting
            if (chunks.length > 1) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        } catch (error) {
            console.error('Error generating embedding for chunk:', error);
            throw error;
        }
    }
    return results;
};

export const generateEmbedding = async (
    value: string,
    apiKeys: ApiKeys,
    userModel?: EmbeddingModel
): Promise<number[]> => {
    const embeddingModel = getEmbeddingModel(userModel);
    return generateEmbeddingWithProvider(value, embeddingModel, apiKeys);
};

export const findRelevantContent = async (userQuery: string, apiKeys: ApiKeys, userModel?: EmbeddingModel) => {
    const userQueryEmbedded = await generateEmbedding(userQuery, apiKeys, userModel);
    const similarity = sql<number>`1 - (${cosineDistance(
        embeddings.embedding,
        userQueryEmbedded,
    )})`;
    const similarGuides = await db
        .select({ name: embeddings.content, similarity })
        .from(embeddings)
        .where(gt(similarity, 0.5))
        .orderBy(t => desc(t.similarity))
        .limit(4);
    return similarGuides;
};
