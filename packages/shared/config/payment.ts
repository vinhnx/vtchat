/**
 * Payment Configuration for VT Chat
 *
 * Centralized configuration for VT+ subscription
 * using the proper PlanSlug enum
 */

import { log } from '@repo/shared/lib/logger';
import { Creem } from 'creem';
import {
    CREEM_API_CONFIG,
    CreemApiError,
    type CreemCustomerBillingRequest,
} from '../constants/creem';
import { PlanSlug } from '../types/subscription';
import { isProductionEnvironment } from '../utils/env';
import { VT_PLUS_PRODUCT_INFO, type VTPlusFeature } from './vt-plus-features';

// Types for payment integration
export interface PaymentProduct {
    id: string;
    name: string;
    description?: string;
    prices: PaymentPrice[];
}

export interface PaymentPrice {
    id: string;
    price_amount: number;
    price_currency: string;
}

// Unified Product Type
export interface Product {
    planSlug: PlanSlug;
    name: string;
    description: string;
    price: number; // e.g., 5.99
    currency: string; // e.g., CURRENCIES.USD
    // interval: 'month' | 'year'; // Assuming monthly for now, can be added if tiers differ
    features: VTPlusFeature[];
    paymentProviderProductId: string; // Specific ID for the payment provider
    // popular?: boolean; // Optional: if we need to highlight a plan
}

export interface CheckoutRequest {
    productId: string; // This will likely be PlanSlug or paymentProviderProductId
    successUrl?: string;
    customerEmail?: string;
    quantity?: number;
}

export interface CheckoutResponse {
    checkoutId: string;
    url: string;
    success: boolean;
}

export interface PortalResponse {
    url: string;
    success: boolean;
}

// Subscription package interface
export interface SubscriptionPackage {
    id: string;
    planSlug?: PlanSlug;
    name: string;
    price: number;
    description: string;
    popular?: boolean;
}

// Single, unified product instance for VT_PLUS
export const VT_PLUS_PRODUCT: Product = {
    planSlug: PlanSlug.VT_PLUS,
    name: VT_PLUS_PRODUCT_INFO.name,
    description: VT_PLUS_PRODUCT_INFO.description,
    price: VT_PLUS_PRODUCT_INFO.pricing.amount,
    currency: VT_PLUS_PRODUCT_INFO.pricing.currency,
    features: VT_PLUS_PRODUCT_INFO.features,
    paymentProviderProductId: VT_PLUS_PRODUCT_INFO.productId || '', // Ensure it's a string
};

export const VT_PLUS_PRODUCT_ID = process.env.CREEM_PRODUCT_ID;

export const VT_BASE_PRODUCT_INFO = {
    id: 'FREE_TIER', // Placeholder ID, as free tier might not have a Creem product ID
    name: 'VT Base',
    slug: PlanSlug.VT_BASE,
    features: [
        'Free access to Gemini 2.5 Flash Lite Preview (10 requests/day)',
        'Dark Mode interface',
        'Structured Output extraction',
        'Thinking Mode with reasoning display',
        'Document Processing (PDF, DOC, images)',
        'Chart Visualization',
        'Gemini Explicit Caching',
        'Mathematical calculation tools',
        'Unlimited usage with BYOK',
        'Perfect for getting started with VT',
    ],
    prices: [], // Free tier has no prices in the same way paid tiers do
};

// Unified Product Definitions keyed by PlanSlug
// Only VT_PLUS is a purchasable product.
export const PRODUCTS_BY_PLAN_SLUG: Record<PlanSlug.VT_PLUS, Product> = {
    [PlanSlug.VT_PLUS]: VT_PLUS_PRODUCT,
};

// Price mapping for API routes
// The key from the client (priceId) is expected to be a PlanSlug.
// This maps the incoming priceId (which should be a PlanSlug) to the PlanSlug itself.
// This might be redundant if priceId is always a PlanSlug.
// Only VT_PLUS is expected as a priceId for a purchasable plan.
export const PRICE_ID_MAPPING: Record<PlanSlug.VT_PLUS, PlanSlug.VT_PLUS> = {
    [PlanSlug.VT_PLUS]: PlanSlug.VT_PLUS,
} as const;

/**
 * Payment Service Class
 */
export class PaymentService {
    // Configure payment client for sandbox/production
    private static client = new Creem({
        serverIdx: isProductionEnvironment() ? 0 : 1,
    });

    // API Key from environment
    private static readonly API_KEY = process.env.CREEM_API_KEY;

    // Product ID from environment
    private static readonly PRODUCT_ID = process.env.CREEM_PRODUCT_ID;

    /**
     * Get base URL for the application
     */
    private static getBaseUrl(): string {
        return (
            process.env.NEXT_PUBLIC_APP_URL ||
            process.env.NEXTAUTH_URL ||
            process.env.VERCEL_URL ||
            (typeof window !== 'undefined' ? window.location.origin : null) ||
            'https://vtchat.io.vn'
        );
    }

    /**
     * Create a checkout session for VT+ subscriptions
     */
    static async createCheckout(request: CheckoutRequest): Promise<CheckoutResponse> {
        try {
            if (!PaymentService.API_KEY) {
                throw new Error('CREEM_API_KEY not configured');
            }

            log.info(
                {
                    productId: request.productId,
                    quantity: request.quantity || 1,
                    hasEmail: !!request.customerEmail,
                    hasSuccessUrl: !!request.successUrl,
                },
                '[PaymentService] Creating checkout session'
            );

            // Determine if this is for VT+ subscription
            const isSubscription =
                request.productId === PlanSlug.VT_PLUS ||
                request.successUrl?.includes(`plan=${PlanSlug.VT_PLUS}`);

            // Get the base URL for success redirect
            const baseUrl = PaymentService.getBaseUrl();
            const normalizedBaseUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;

            // Create success URL
            const successUrl = request.successUrl
                ? request.successUrl.startsWith('http')
                    ? request.successUrl
                    : `${normalizedBaseUrl}${request.successUrl}`
                : isSubscription
                  ? `${normalizedBaseUrl}/success?plan=${PlanSlug.VT_PLUS}`
                  : `${normalizedBaseUrl}/success?package=${request.productId}&quantity=${request.quantity || 1}`;

            log.info({ successUrl }, '[PaymentService] Using success URL');

            const result = await PaymentService.client.createCheckout({
                xApiKey: PaymentService.API_KEY,
                createCheckoutRequest: {
                    productId: PaymentService.PRODUCT_ID || '',
                    units: request.quantity || 1,
                    successUrl,
                    customer: request.customerEmail ? { email: request.customerEmail } : undefined,
                    metadata: {
                        packageId: request.productId || '',
                        successUrl,
                        isSubscription: isSubscription ? 'true' : 'false',
                        source: 'vtchat-app',
                        timestamp: new Date().toISOString(),
                    },
                },
            });

            log.info(
                {
                    checkoutId: result.id,
                    hasCheckoutUrl: !!result.checkoutUrl,
                },
                '[PaymentService] Checkout session created successfully'
            );

            if (result && typeof result === 'object' && 'checkoutUrl' in result) {
                return {
                    checkoutId: result.id || '',
                    url: result.checkoutUrl || '',
                    success: true,
                };
            }

            throw new Error('Invalid checkout response - missing checkout URL');
        } catch (error: any) {
            log.error(
                { error: error.message || 'Unknown error' },
                '[PaymentService] Checkout creation failed'
            );
            throw new CheckoutError(
                `Failed to create checkout session: ${error.message || 'Unknown error'}`
            );
        }
    }

    /**
     * Get customer portal URL for managing subscriptions
     */
    static async getPortalUrl(_customerEmail?: string, userId?: string): Promise<PortalResponse> {
        try {
            if (!PaymentService.API_KEY) {
                throw new Error('CREEM_API_KEY not configured');
            }

            // Try to get customer ID from database if userId provided
            let customerId: string | null = null;

            if (userId && typeof require !== 'undefined') {
                try {
                    const { db, schema } = require('@repo/shared/lib/database');
                    const { eq } = require('drizzle-orm');

                    // First, check users table for creem_customer_id
                    const userResults = await db
                        .select()
                        .from(schema.users)
                        .where(eq(schema.users.id, userId))
                        .limit(1);

                    if (userResults.length > 0 && userResults[0].creemCustomerId) {
                        customerId = userResults[0].creemCustomerId;
                        log.info({ hasUserId: !!userId }, 'Found customer ID in users table');
                    } else {
                        // Fallback: check user_subscriptions table for creem_customer_id
                        const subscriptionResults = await db
                            .select()
                            .from(schema.userSubscriptions)
                            .where(eq(schema.userSubscriptions.userId, userId))
                            .limit(1);

                        if (
                            subscriptionResults.length > 0 &&
                            subscriptionResults[0].creemCustomerId
                        ) {
                            customerId = subscriptionResults[0].creemCustomerId;
                            log.info(
                                { hasUserId: !!userId },
                                'Found customer ID in user_subscriptions table'
                            );
                        }
                    }
                } catch (dbError) {
                    log.info(
                        {
                            error: dbError instanceof Error ? dbError.message : 'Unknown error',
                        },
                        'Database lookup failed, proceeding with fallback'
                    );
                }
            }

            // If we have a customer ID, call Creem API directly
            if (customerId) {
                try {
                    const apiEndpoint = CREEM_API_CONFIG.getCustomerBillingEndpoint();

                    log.info({ endpoint: apiEndpoint }, '[PaymentService] Calling Creem API');

                    const requestBody: CreemCustomerBillingRequest = {
                        customer_id: customerId,
                    };

                    const response = await fetch(apiEndpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-api-key': PaymentService.API_KEY!,
                        },
                        body: JSON.stringify(requestBody),
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new CreemApiError(
                            `Creem API error: ${response.status} ${response.statusText} - ${errorText}`,
                            response.status
                        );
                    }

                    const result = await response.json();

                    if (result && typeof result === 'string') {
                        // If the response is directly a URL string
                        log.info({}, '[PaymentService] Generated customer portal URL successfully');
                        return {
                            url: result,
                            success: true,
                        };
                    }
                    if (
                        result &&
                        (result.url ||
                            result.portalUrl ||
                            result.link ||
                            result.customer_portal_link)
                    ) {
                        // If the response contains a url property (including customer_portal_link from Creem API)
                        const portalUrl =
                            result.url ||
                            result.portalUrl ||
                            result.link ||
                            result.customer_portal_link;
                        log.info({}, 'Generated customer portal URL successfully');
                        return {
                            url: portalUrl,
                            success: true,
                        };
                    }
                    throw new CreemApiError(
                        'Invalid response format from Creem API - no URL found'
                    );
                } catch (apiError) {
                    log.error(
                        {
                            error: apiError instanceof Error ? apiError.message : 'Unknown error',
                        },
                        'Creem API call failed'
                    );
                    if (apiError instanceof CreemApiError) {
                        throw apiError; // Re-throw Creem API errors
                    }
                    // For other errors, continue to fallback logic
                }
            }

            // Fallback logic when no customer ID is found or API call fails
            const baseUrl = PaymentService.getBaseUrl();
            const normalizedBaseUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;

            if (!isProductionEnvironment()) {
                return {
                    url: `https://www.creem.io/test/billing?product=${PaymentService.PRODUCT_ID || ''}`,
                    success: true,
                };
            }

            return {
                url: `${normalizedBaseUrl}/plus`,
                success: true,
            };
        } catch (error) {
            log.error(
                { error: error instanceof Error ? error.message : 'Unknown error' },
                'Payment portal error'
            );
            const baseUrl = PaymentService.getBaseUrl();
            const normalizedBaseUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;

            return {
                url: `${normalizedBaseUrl}/plus`,
                success: true,
            };
        }
    }

    // Removed legacy purchaseCredits method

    /**
     * Subscribe to VT+ plan
     */
    static async subscribeToVtPlus(customerEmail?: string) {
        log.info({}, 'Creating VT+ subscription checkout');

        return PaymentService.createCheckout({
            productId: PlanSlug.VT_PLUS,
            customerEmail,
            successUrl: `${typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || 'https://vtchat.io.vn'}/success?plan=${PlanSlug.VT_PLUS}`,
        });
    }

    // Removed legacy calculatePrice method

    // Removed legacy getSubscriptionPlans method (use PRODUCTS_BY_PLAN_SLUG directly if needed)

    /**
     * Get payment client instance for advanced operations
     */
    static getClient() {
        return PaymentService.client;
    }
}

// Error types
export class PaymentError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'PaymentError';
    }
}

export class CheckoutError extends PaymentError {
    constructor(message: string) {
        super(message);
        this.name = 'CheckoutError';
    }
}

// Removed legacy getSubscriptionPlans helper function

// Export the service as default for easy importing
export default PaymentService;
