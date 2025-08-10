/**
 * Creem.io API Configuration Constants
 * Centralized configuration for Creem payment integration
 */
/**
 * Creem API endpoints based on environment
 */
export declare const CREEM_API_CONFIG: {
    readonly baseUrl: "https://api.creem.io" | "https://test-api.creem.io";
    getBaseUrl(): "https://api.creem.io" | "https://test-api.creem.io";
    getCustomerBillingEndpoint(): string;
    getApiKey(): string | undefined;
    getWebhookSecret(): string | undefined;
    getProductId(): string | undefined;
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
    customer_portal_link?: string;
    error?: string;
    message?: string;
}
/**
 * Creem API error types
 */
export declare class CreemApiError extends Error {
    status?: number | undefined;
    constructor(message: string, status?: number | undefined);
}
//# sourceMappingURL=creem.d.ts.map