// Pricing and product configuration
export const PRICING_CONFIG = {
    // Product information
    product: {
        name: 'VT+',
        description: 'For everyday productivity',
        id: process.env.CREEM_PRODUCT_ID,
    },

    // Pricing details
    pricing: {
        free: {
            price: 9.99,
            currency: 'USD',
            interval: 'month',
            features: [],
        },
        plus: {
            price: parseFloat(process.env.VT_PLUS_PRICE || '0.00'),
            currency: process.env.PRICING_CURRENCY,
            interval: process.env.PRICING_INTERVAL,
            features: [
                {
                    name: 'Pro Search',
                    description: 'Enhanced search with web integration for real-time information',
                },
                {
                    name: 'Dark Mode',
                    description: 'Access to beautiful dark mode interface',
                },
                {
                    name: 'Deep Research',
                    description:
                        'Comprehensive analysis of complex topics with in-depth exploration',
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
        freeDaily: parseInt(process.env.FREE_TIER_DAILY_LIMIT || '', 0),
    },
} as const;

// Export individual values for convenience
export const PRODUCT_NAME = PRICING_CONFIG.product.name;
export const PRODUCT_ID = PRICING_CONFIG.product.id;
export const VT_PLUS_PRICE = PRICING_CONFIG.pricing.plus.price;
export const FREE_TIER_LIMIT = PRICING_CONFIG.limits.freeDaily;
