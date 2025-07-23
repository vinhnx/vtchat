import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ApiKeys } from "@repo/common/store";
import {
    DEFAULT_EMBEDDING_MODEL,
    EMBEDDING_MODEL_CONFIG,
    EMBEDDING_MODELS,
    type EmbeddingModel,
} from "@repo/shared/config/embedding-models";
import { API_KEY_NAMES } from "@repo/shared/constants/api-keys";
import { log } from "@repo/shared/logger";
// Import the unified function for better consistency
import { isGeminiModel as isGeminiModelUnified } from "@repo/shared/utils";
import { and, cosineDistance, desc, eq, gt, sql } from "drizzle-orm";
import { db } from "../database";
import { embeddings, resources } from "../database/schema";
import { maskPII } from "../utils/content-security";

// Helper function to check if a model is a Gemini model
function isGeminiModel(model: EmbeddingModel): boolean {
    return isGeminiModelUnified(model);
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
        .split(".")
        .filter((i) => i !== "");
};

async function generateEmbeddingWithProvider(
    text: string,
    model: EmbeddingModel,
    apiKeys: ApiKeys,
): Promise<number[]> {
    try {
        const input = text.replaceAll("\\n", " ");

        // Only support Gemini models for now
        // VT+ users can use server API key, free users need their own
        const geminiApiKey = apiKeys?.[API_KEY_NAMES.GOOGLE] || process.env.GEMINI_API_KEY;
        if (!geminiApiKey) {
            throw new Error(
                "Gemini API key is required for RAG embeddings. Please add it in Settings → API Keys or upgrade to VT+.",
            );
        }

        log.info(
            {
                model,
                hasApiKey: !!geminiApiKey,
                apiKeySource: apiKeys?.[API_KEY_NAMES.GOOGLE] ? "user" : "server",
                inputLength: input.length,
            },
            "RAG Embedding - generateEmbeddingWithProvider start",
        );

        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const modelConfig = EMBEDDING_MODEL_CONFIG[model];

        if (!modelConfig) {
            throw new Error(`Unsupported embedding model: ${model}`);
        }

        const geminiModel = genAI.getGenerativeModel({
            model: modelConfig.id,
        });

        log.info(
            {
                modelId: modelConfig.id,
                dimensions: modelConfig.dimensions,
            },
            "RAG Embedding - calling embedContent",
        );

        const result = await geminiModel.embedContent(input);
        const embedding = result.embedding.values || [];

        log.info(
            {
                model: modelConfig.id,
                expectedDimensions: modelConfig.dimensions,
                actualDimensions: embedding.length,
                inputLength: input.length,
            },
            "RAG Embedding - embedContent success",
        );

        return embedding;
    } catch (error) {
        log.error(
            {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                model,
                hasApiKeys: !!apiKeys && Object.keys(apiKeys || {}).length > 0,
                textLength: text.length,
            },
            "RAG Embedding - generateEmbeddingWithProvider failed",
        );
        throw error;
    }
}

export const generateEmbeddings = async (
    value: string,
    apiKeys: ApiKeys,
    userModel?: EmbeddingModel,
): Promise<Array<{ embedding: number[]; content: string }>> => {
    const chunks = generateChunks(value);
    const embeddingModel = getEmbeddingModel(userModel);

    log.info(
        {
            userModel,
            resolvedModel: embeddingModel,
            isGemini: isGeminiModel(embeddingModel),
            hasGeminiKey: !!apiKeys?.[API_KEY_NAMES.GOOGLE],
            availableKeys: Object.keys(apiKeys || {}),
        },
        "🔍 RAG Debug",
    );

    // For now, only support Gemini models - simplify logic
    // VT+ users can use server API key, free users need their own
    const geminiApiKey = apiKeys?.[API_KEY_NAMES.GOOGLE] || process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
        // SECURITY: Don't expose available API key names in error messages
        throw new Error(`RAG Knowledge Chat requires a Google Gemini API key.

🔧 To fix this:
1. Go to Settings → API Keys
2. Add your Google Gemini API key
   - Get free key: https://ai.google.dev/api

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
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
        } catch (error) {
            log.error({ error }, "Error generating embedding for chunk");
            throw error;
        }
    }
    return results;
};

export const generateEmbedding = async (
    value: string,
    apiKeys: ApiKeys,
    userModel?: EmbeddingModel,
): Promise<number[]> => {
    const embeddingModel = getEmbeddingModel(userModel);
    return generateEmbeddingWithProvider(value, embeddingModel, apiKeys);
};

export const findRelevantContent = async (
    userQuery: string,
    apiKeys: ApiKeys,
    userModel?: EmbeddingModel,
    userId?: string,
) => {
    // CRITICAL: Must have userId to ensure user isolation
    if (!userId) {
        throw new Error("User ID is required for knowledge base search to ensure data isolation");
    }

    // SECURITY: Validate userId format to prevent injection
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
        throw new Error("Invalid user ID format");
    }

    // SECURITY: Validate and sanitize user query
    if (!userQuery || typeof userQuery !== "string") {
        throw new Error("Invalid query format");
    }

    // Limit query length to prevent abuse
    const sanitizedQuery = userQuery.trim().substring(0, 1000);
    if (sanitizedQuery.length === 0) {
        return [];
    }

    const userQueryEmbedded = await generateEmbedding(sanitizedQuery, apiKeys, userModel);

    // SECURITY: Use parameterized similarity threshold
    const similarityThreshold = 0.5;
    const similarity = sql<number>`1 - (${cosineDistance(
        embeddings.embedding,
        userQueryEmbedded,
    )})`;

    // SECURITY: Explicit user isolation with parameterized queries
    const similarGuides = await db
        .select({
            name: embeddings.content,
            similarity: similarity,
        })
        .from(embeddings)
        .innerJoin(resources, eq(embeddings.resourceId, resources.id))
        .where(
            and(
                gt(similarity, similarityThreshold),
                eq(resources.userId, userId), // Explicit user filtering
            ),
        )
        .orderBy(desc(similarity))
        .limit(4);

    // SECURITY: Apply additional PII masking to retrieved content as a safety net
    return similarGuides.map((guide) => ({
        ...guide,
        name: maskPII(guide.name),
    }));
};
