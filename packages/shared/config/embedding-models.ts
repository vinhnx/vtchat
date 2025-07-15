// Embedding model configuration (Gemini models only)
export const EMBEDDING_MODELS = {
    GEMINI_004: "gemini-004",
    GEMINI_EXP: "gemini-exp",
    GEMINI_001: "gemini-001",
} as const;

export type EmbeddingModel = (typeof EMBEDDING_MODELS)[keyof typeof EMBEDDING_MODELS];

export const EMBEDDING_MODEL_CONFIG = {
    [EMBEDDING_MODELS.GEMINI_004]: {
        id: "text-embedding-004",
        name: "Gemini Text Embedding 004",
        dimensions: 768,
        description: "Google's latest text embedding model (recommended)",
        provider: "Google",
    },
    [EMBEDDING_MODELS.GEMINI_EXP]: {
        id: "gemini-embedding-exp-03-07",
        name: "Gemini Embedding Experimental",
        dimensions: 3072,
        description:
            "Google's experimental embedding model with enhanced capabilities (3072 dimensions)",
        provider: "Google",
    },
    [EMBEDDING_MODELS.GEMINI_001]: {
        id: "embedding-001",
        name: "Gemini Embedding 001",
        dimensions: 768,
        description: "Google's stable embedding model",
        provider: "Google",
    },
} as const;

export const DEFAULT_EMBEDDING_MODEL = EMBEDDING_MODELS.GEMINI_001;
