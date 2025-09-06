import { CURRENCIES, VT_PLUS_PRICE } from '@repo/shared/constants';

// Pricing and product configuration
export const PRICING_CONFIG = {
    // Product information
    product: {
        name: 'VT+',
        description:
            'Professional AI toolkit: Enhanced Pro Search (50/day), Deep Research (25/day), advanced document processing, priority access, custom workflows, and premium export options',
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
                    name: 'Multi-Modal Chat + Gemini Nano Banana',
                    description:
                        'Upload and analyze images and PDF documents alongside text conversations using advanced AI models like GPT-4o, Claude, and Gemini. Plus unique Gemini Nano Banana conversational image editing - generate, edit, and refine images through natural conversation',
                },
                {
                    name: 'All Chat Input Tools + Nano Banana Image Editor',
                    description:
                        'Intelligent tool routing, mathematical calculator, chart generation, image analysis, document processing, web search, and the exclusive Gemini Nano Banana conversational image editor - create and modify images through natural language conversation',
                },
                {
                    name: '🍌 Gemini Nano Banana - Conversational Image Editing (Unique to VT)',
                    description:
                        'World\'s first conversational image editor! Generate an image, then iteratively edit it through natural conversation: "make the cat bigger", "change background to sunset", "add a party hat" - all while preserving your edits in chat history',
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
                    name: 'Access to Gemini Models + Enhanced Tools + Nano Banana',
                    description:
                        'Access all Gemini models (Gemini 2.5 Pro, Gemini 2.5 Flash, Gemini 2.5 Flash Lite) plus enhanced tools (web search, math calculator, charts) and the exclusive Gemini Nano Banana conversational image editor without needing your own API keys.',
                },
                {
                    name: 'Everything in Free Plan (All Premium AI Models Included)',
                    description:
                        'All premium AI models (Claude 4, GPT-4.1, O3, etc.) + all advanced features already available in free tier',
                },
                {
                    name: 'Pro Search (Exclusive) - 50 requests/day',
                    description:
                        'Lightning-fast web search with AI grounding for instant, accurate information retrieval - increased from 20 to 50 requests per day',
                },
                {
                    name: 'Deep Research (Exclusive) - 25 requests/day',
                    description:
                        'Comprehensive multi-step research with detailed analysis and thorough investigation of complex topics - increased from 10 to 25 requests per day',
                },
                {
                    name: 'Advanced Document Processing',
                    description:
                        'Enhanced document analysis with larger file size limits (up to 25MB), batch processing, and advanced extraction capabilities',
                },
                {
                    name: 'Priority AI Model Access',
                    description:
                        'Skip rate limits and get priority access to all AI models during high-traffic periods with dedicated server resources',
                },
                {
                    name: 'Extended Chat History',
                    description:
                        'Unlimited chat history storage with advanced search and organization features across all your conversations',
                },
                {
                    name: 'Priority Support & Daily Reset',
                    description:
                        'Priority customer support with daily quota reset for Pro Search and Deep Research features, plus dedicated support channel',
                },
                {
                    name: 'Support Development',
                    description:
                        'Your subscription directly supports the continued development and improvement of VT. Thank you for helping us build better AI tools for everyone!',
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
