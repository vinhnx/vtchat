import { CURRENCIES, VT_PLUS_PRICE } from '@repo/shared/constants';

// Pricing and product configuration
export const PRICING_CONFIG = {
    // Product information
    product: {
        name: 'VT+',
        description: 'Pro research and AI memory - exclusively for deep work',
        id: process.env.CREEM_PRODUCT_ID || '',
    },

    // Pricing details
    pricing: {
        free: {
            price: 0,
            currency: CURRENCIES.USD,
            interval: 'month',
            features: [
                {
                    name: 'All Advanced AI Features',
                    description:
                        'Complete access to dark mode, thinking mode, structured output, document parsing, reasoning chain, Gemini caching, and chart visualization - all free for logged-in users',
                },
                {
                    name: 'Multi-Modal Chat',
                    description:
                        'Upload and analyze images and PDF documents alongside text conversations using advanced AI models like GPT-4o, Claude, and Gemini',
                },
                {
                    name: 'All Chat Input Tools',
                    description:
                        'Mathematical calculator, image analysis, document processing, and all productivity tools included',
                },
                {
                    name: 'Free Gemini 2.5 Flash Lite Preview',
                    description: "10 requests per day with VT's server API key - no setup required",
                },
                {
                    name: 'Unlimited BYOK Access',
                    description:
                        'Use your own API keys for unlimited access to OpenAI, Anthropic, Google, and other AI providers',
                },
            ],
        },
        plus: {
            price: VT_PLUS_PRICE,
            currency: CURRENCIES.USD,
            interval: 'month',
            features: [
                {
                    name: 'Everything in Free Plan',
                    description:
                        'All advanced AI features, multi-modal chat, productivity tools, and unlimited BYOK access',
                },
                {
                    name: 'Premium AI Models (Exclusive)',
                    description:
                        'Access to the most powerful AI models: Claude 4 Sonnet & Opus, GPT-4.1, O3 series, O1 series, Gemini 2.5 Pro, DeepSeek R1, and Grok 3',
                },
                {
                    name: 'Pro Search (Exclusive)',
                    description:
                        'Lightning-fast web search with AI grounding for instant, accurate information retrieval',
                },
                {
                    name: 'Deep Research (Exclusive)',
                    description:
                        'Comprehensive multi-step research with detailed analysis and thorough investigation of complex topics',
                },
                {
                    name: 'AI Memory (Exclusive)',
                    description:
                        'Personal AI assistant that remembers everything you share. Build your knowledge base for truly personalized conversations.',
                },
                {
                    name: 'Priority Support & No Limits',
                    description:
                        'Priority customer support with unlimited usage of all VT+ exclusive features',
                },
            ],
        },
    },
} as const;

// Export individual values for convenience
export const PRODUCT_NAME = PRICING_CONFIG.product.name;
export const PRODUCT_ID = PRICING_CONFIG.product.id;
// VT_PLUS_PRICE now imported from @repo/shared/constants - removed duplicate export
// FREE_TIER_LIMIT removed
