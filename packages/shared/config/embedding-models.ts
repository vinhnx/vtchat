// Embedding model configuration (Gemini models only)
export const EMBEDDING_MODELS = {
    GEMINI_001: "gemini-001",
} as const;

export type EmbeddingModel = (typeof EMBEDDING_MODELS)[keyof typeof EMBEDDING_MODELS];

export const EMBEDDING_MODEL_CONFIG = {
    [EMBEDDING_MODELS.GEMINI_001]: {
        id: "gemini-embedding-001",
        name: "Gemini Embedding 001",
        dimensions: 3072,
        description: "Google's stable embedding model",
        provider: "Google",
    },
} as const;

export const DEFAULT_EMBEDDING_MODEL = EMBEDDING_MODELS.GEMINI_001;
