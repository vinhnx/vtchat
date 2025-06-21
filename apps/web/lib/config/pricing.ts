// Pricing and product configuration
export const PRICING_CONFIG = {
    // Product information
    product: {
        name: process.env.PRODUCT_NAME || 'VT+',
        description: process.env.PRODUCT_DESCRIPTION || 'For everyday productivity',
        id: process.env.CREEM_PRODUCT_ID || '',
    },

    // Pricing details
    pricing: {
        free: {
            price: 0,
            currency: 'USD',
            interval: 'month',
            features: [
                {
                    name: 'Access to Free Models',
                    description:
                        'Access to free AI models including Gemini 2.0 Flash Lite, Gemini 2.5 Flash Lite, Gemini 2.5 Flash Preview, Gemini 2.5 Pro, Gemini 2.5 Pro Preview, DeepSeek V3, DeepSeek R1, and Qwen3 14B',
                },
                {
                    name: 'Mathematical Calculator Tools',
                    description:
                        'Mathematical calculation tools providing essential mathematical operations including trigonometric functions, logarithms, exponentials, and basic arithmetic calculations',
                },
                {
                    name: 'Access to Base Features',
                    description:
                        'Access to base features including local storage privacy, basic AI interactions, and core functionality',
                },
                {
                    name: 'Perfect for Getting Started',
                    description:
                        'Perfect for getting started with VT and exploring AI capabilities',
                },
            ],
        },
        plus: {
            price: parseFloat(process.env.VT_PLUS_PRICE || '9.99'),
            currency: process.env.PRICING_CURRENCY || 'USD',
            interval: process.env.PRICING_INTERVAL || 'month',
            features: [
                {
                    name: 'All Benefits from Base Plan',
                    description:
                        'Includes all free model access, mathematical calculator tools, and base features',
                },
                {
                    name: 'Grounding Web Search',
                    description:
                        'Enhanced search with web integration and comprehensive analysis for real-time information',
                },
                {
                    name: 'Dark Mode',
                    description: 'Access to beautiful dark mode interface',
                },
                {
                    name: 'Thinking Mode',
                    description:
                        'Enhanced AI reasoning with visible thought processes for Gemini models',
                },
                {
                    name: 'Document Parsing',
                    description:
                        'AI-powered parsing and analysis of PDFs, Word documents, and various file formats',
                },
                {
                    name: 'Structured Outputs',
                    description:
                        'Advanced structured data extraction and formatted output capabilities',
                },
                {
                    name: 'Thinking Mode Toggle',
                    description:
                        'Full control over thinking mode activation for customized AI experience',
                },
                {
                    name: 'Reasoning Chain',
                    description:
                        'Advanced chain-of-thought reasoning for complex problem solving and analysis',
                },
                {
                    name: 'Gemini Explicit Caching',
                    description:
                        'Cost-effective caching for Gemini 2.5 and 2.0 models to reduce API costs through context reuse',
                },
                {
                    name: 'Priority Support',
                    description: 'Get priority customer support',
                },
                {
                    name: 'Unlimited Usage',
                    description: 'No daily limits on usage',
                },
                {
                    name: 'Interactive Chart Generation',
                    description:
                        'AI-powered interactive chart creation including bar charts, line charts, area charts, pie charts, and radar charts with beautiful visualizations',
                },
                {
                    name: 'Advanced AI Capabilities',
                    description: 'Access to the latest AI features and models',
                },
                {
                    name: 'More features coming soon',
                    description: 'Continuous improvements and new additions',
                },
            ],
        },
    },
} as const;

// Export individual values for convenience
export const PRODUCT_NAME = PRICING_CONFIG.product.name;
export const PRODUCT_ID = PRICING_CONFIG.product.id;
export const VT_PLUS_PRICE = PRICING_CONFIG.pricing.plus.price;
// FREE_TIER_LIMIT removed
