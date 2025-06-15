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
            features: [],
        },
        plus: {
            price: parseFloat(process.env.VT_PLUS_PRICE || '9.99'),
            currency: process.env.PRICING_CURRENCY || 'USD',
            interval: process.env.PRICING_INTERVAL || 'month',
            features: [
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
                    name: 'Priority Support',
                    description: 'Get priority customer support',
                },
                {
                    name: 'Unlimited Usage',
                    description: 'No daily limits on usage',
                },
                {
                    name: 'Advanced AI Capabilities',
                    description: 'Access to the latest AI features and models',
                },
            ],
        },
    },

    // Rate limiting
    limits: {
        freeDaily: parseInt(process.env.FREE_TIER_DAILY_LIMIT || '10', 10),
    },
} as const;

// Export individual values for convenience
export const PRODUCT_NAME = PRICING_CONFIG.product.name;
export const PRODUCT_ID = PRICING_CONFIG.product.id;
export const VT_PLUS_PRICE = PRICING_CONFIG.pricing.plus.price;
export const FREE_TIER_LIMIT = PRICING_CONFIG.limits.freeDaily;
