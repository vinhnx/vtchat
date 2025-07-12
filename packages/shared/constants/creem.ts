/**
 * Creem.io API Configuration Constants
 * Centralized configuration for Creem payment integration
 */

/**
 * Check if environment is production (client-safe)
 */
const isProduction = () => {
    if (typeof window !== 'undefined') {
        return window.location.hostname !== 'localhost';
    }
    return process.env.NODE_ENV === 'production';
};

/**
 * Creem API endpoints based on environment
 */
export const CREEM_API_CONFIG = {
    get baseUrl() {
        return isProduction() ? 'https://api.creem.io' : 'https://test-api.creem.io';
    },

    getBaseUrl() {
        return this.baseUrl;
    },

    getCustomerBillingEndpoint() {
        return `${this.baseUrl}/v1/customers/billing`;
    },

    getApiKey() {
        return process.env.CREEM_API_KEY;
    },

    getWebhookSecret() {
        return process.env.CREEM_WEBHOOK_SECRET;
    },

    getProductId() {
        return process.env.CREEM_PRODUCT_ID;
    },
};

/**
 * Creem API response types
 */
export interface CreemCustomerBillingRequest {
    customer_id: string;
}

export interface CreemCustomerBillingResponse {
    url?: string;
    portalUrl?: string;
    link?: string;
    customer_portal_link?: string; // Creem API specific field
    error?: string;
    message?: string;
}

/**
 * Creem API error types
 */
export class CreemApiError extends Error {
    constructor(
        message: string,
        public status?: number
    ) {
        super(message);
        this.name = 'CreemApiError';
    }
}
