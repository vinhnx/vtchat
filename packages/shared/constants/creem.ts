/**
 * Creem.io API Configuration Constants
 * Centralized configuration for Creem payment integration
 */

import { isProductionEnvironment } from '../utils/env';

/**
 * Creem API endpoints based on environment
 */
export const CREEM_API_CONFIG = {
    /**
     * Get the appropriate Creem API base URL
     */
    getBaseUrl(): string {
        return isProductionEnvironment() ? 'https://api.creem.io' : 'https://test-api.creem.io';
    },

    /**
     * Get the customer billing portal endpoint
     */
    getCustomerBillingEndpoint(): string {
        return `${this.getBaseUrl()}/v1/customers/billing`;
    },

    /**
     * Get the API key from environment
     */
    getApiKey(): string | undefined {
        return process.env.CREEM_API_KEY;
    },

    /**
     * Get the webhook secret from environment
     */
    getWebhookSecret(): string | undefined {
        return process.env.CREEM_WEBHOOK_SECRET;
    },

    /**
     * Get the product ID from environment
     */
    getProductId(): string | undefined {
        return process.env.CREEM_PRODUCT_ID;
    },
} as const;

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
