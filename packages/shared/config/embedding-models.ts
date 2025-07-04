// Embedding model configuration
export const EMBEDDING_MODELS = {
    GEMINI_004: 'gemini-004',
    GEMINI_EXP: 'gemini-exp',
    GEMINI_001: 'gemini-001',
    OPENAI_LARGE_3: 'openai-large-3',
    OPENAI_SMALL_3: 'openai-small-3',
} as const;

export type EmbeddingModel = (typeof EMBEDDING_MODELS)[keyof typeof EMBEDDING_MODELS];

export const EMBEDDING_MODEL_CONFIG = {
    [EMBEDDING_MODELS.GEMINI_004]: {
        id: 'text-embedding-004',
        name: 'Gemini Text Embedding 004',
        dimensions: 768,
        description: "Google's latest text embedding model (recommended)",
        provider: 'Google',
    },
    [EMBEDDING_MODELS.GEMINI_EXP]: {
        id: 'gemini-embedding-exp-03-07',
        name: 'Gemini Embedding Experimental',
        dimensions: 3072,
        description:
            "Google's experimental embedding model with enhanced capabilities (3072 dimensions)",
        provider: 'Google',
    },
    [EMBEDDING_MODELS.GEMINI_001]: {
        id: 'embedding-001',
        name: 'Gemini Embedding 001',
        dimensions: 768,
        description: "Google's stable embedding model",
        provider: 'Google',
    },
    [EMBEDDING_MODELS.OPENAI_LARGE_3]: {
        id: 'text-embedding-3-large',
        name: 'OpenAI Text Embedding 3 Large',
        dimensions: 3072,
        description: "OpenAI's most capable embedding model",
        provider: 'OpenAI',
    },
    [EMBEDDING_MODELS.OPENAI_SMALL_3]: {
        id: 'text-embedding-3-small',
        name: 'OpenAI Text Embedding 3 Small',
        dimensions: 1536,
        description: "OpenAI's efficient embedding model",
        provider: 'OpenAI',
    },
} as const;

export const DEFAULT_EMBEDDING_MODEL = EMBEDDING_MODELS.GEMINI_004;
