import { CURRENCIES, VT_PLUS_PRICE } from '@repo/shared/constants';

// Pricing and product configuration
export const PRICING_CONFIG = {
    // Product information
    product: {
        name: 'VT+',
        description: 'Research-focused exclusives: Pro Search, Deep Research, and AI Memory',
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
                        'Complete access to intelligent tool routing, chart visualization, web search, dark mode, thinking mode, structured output, document parsing, reasoning chain, and Gemini caching - all free for logged-in users',
                },
                {
                    name: 'Multi-Modal Chat',
                    description:
                        'Upload and analyze images and PDF documents alongside text conversations using advanced AI models like GPT-4o, Claude, and Gemini',
                },
                {
                    name: 'All Chat Input Tools',
                    description:
                        'Intelligent tool routing, mathematical calculator, chart generation, image analysis, document processing, web search, and all productivity tools included',
                },
                {
                    name: 'All Premium AI Models (Free with BYOK)',
                    description:
                        'Access to ALL premium AI models including Claude 4, GPT-4.1, O3, Gemini 2.5 Pro, DeepSeek R1, Grok 3 with your own API keys - completely free for logged-in users',
                },
                {
                    name: '9 Free Server Models',
                    description:
                        "Gemini and OpenRouter models with VT's server API keys - no setup required",
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
                    name: 'Everything in Free Plan (All Premium AI Models Included)',
                    description:
                        'All premium AI models (Claude 4, GPT-4.1, O3, etc.) + all advanced features already available in free tier',
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
