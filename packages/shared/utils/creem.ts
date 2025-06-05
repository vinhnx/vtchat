/**
 * Creem.io Payment Service
 *
 * Handles integration with Creem.io for payments and subscriptions
 * while maintaining compatibility with existing Clerk-based authentication
 */

import { Creem } from 'creem';

// Types for Creem.io integration
export interface CreemProduct {
    id: string;
    name: string;
    description?: string;
    prices: CreemPrice[];
}

export interface CreemPrice {
    id: string;
    price_amount: number;
    price_currency: string;
    type: 'one_time' | 'recurring';
    recurring_interval?: 'month' | 'year';
}

export interface CheckoutRequest {
    productId: string;
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

// Define package interface to properly type the credit packages
export interface CreditPackage {
    id: string;
    name: string;
    credits: number;
    price: number;
    description: string;
    popular?: boolean;
    recurring?: boolean;
    interval?: 'month' | 'year';
}

// Creem Credit Purchase Options - using the provided product ID
export const CREEM_CREDIT_PACKAGES = {
    SMALL: {
        id: 'credits_100', // Internal ID for 100 credits
        name: '100 Credits',
        credits: 100,
        price: 5, // $5
        description: 'Perfect for light usage',
    },
    MEDIUM: {
        id: 'credits_500', // Internal ID for 500 credits
        name: '500 Credits',
        credits: 500,
        price: 20, // $20 (20% discount)
        description: 'Great for regular users',
        popular: true,
    },
    LARGE: {
        id: 'credits_1000', // Internal ID for 1000 credits
        name: '1,000 Credits',
        credits: 1000,
        price: 35, // $35 (30% discount)
        description: 'Best value for power users',
    },
    PLUS_SUBSCRIPTION: {
        id: 'vt_plus_monthly', // Internal ID for VT+ subscription
        name: 'VT+ Monthly',
        credits: 1000, // Monthly allowance
        price: 19, // $19/month
        description: 'Unlimited access + 1,000 monthly credits',
        recurring: true,
        interval: 'month' as const,
    },
} as const;

/**
 * Creem.io Service Class
 */
export class CreemService {
    // Configure Creem client to use sandbox mode (serverIdx: 1) for development
    // serverIdx: 0 - Production (https://api.creem.io)
    // serverIdx: 1 - Sandbox (https://test-api.creem.io)
    private static client = new Creem({
        serverIdx: process.env.NODE_ENV === 'production' ? 0 : 1, // Use sandbox API for development
    });

    // API Key from environment - MUST be a sandbox API key for development
    // Sandbox API keys usually start with 'creem_test_'
    private static readonly API_KEY =
        process.env.CREEM_API_KEY || 'creem_test_5cCavUDzJjNrmU2z9iaKUa';

    // Use the provided product ID for all Creem transactions
    private static readonly PRODUCT_ID = 'prod_1XIVxekQ92QfjjOqbDVQk6';

    /**
     * Create a checkout session for purchasing credits or subscriptions
     */
    static async createCheckout(request: CheckoutRequest): Promise<CheckoutResponse> {
        try {
            console.log('[CreemService] Creating checkout session with:', {
                productId: request.productId,
                quantity: request.quantity || 1,
                email: request.customerEmail,
                successUrl: request.successUrl,
            });

            // Determine if this is for VT+ subscription based on our internal mapping
            const isSubscription =
                request.productId === 'vt_plus_monthly' ||
                (request.successUrl && request.successUrl.includes('plan=vt_plus'));

            // Get the base URL for success redirect - prioritize explicit app URL
            const baseUrl =
                process.env.NEXT_PUBLIC_APP_URL ||
                process.env.NEXTAUTH_URL ||
                process.env.VERCEL_URL ||
                (typeof window !== 'undefined' ? window.location.origin : null) ||
                'http://localhost:3000';

            // Ensure base URL has protocol
            const normalizedBaseUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;

            // Ensure success URL is properly formatted for redirect - must be absolute URL
            const successUrl = request.successUrl
                ? request.successUrl.startsWith('http')
                    ? request.successUrl
                    : `${normalizedBaseUrl}${request.successUrl}`
                : isSubscription
                  ? `${normalizedBaseUrl}/success?plan=vt_plus`
                  : `${normalizedBaseUrl}/success?package=${request.productId}&quantity=${request.quantity || 1}`;

            console.log('[CreemService] Using success URL:', successUrl);

            const result = await this.client.createCheckout({
                xApiKey: this.API_KEY,
                createCheckoutRequest: {
                    productId: this.PRODUCT_ID, // Always use our configured Creem product ID
                    units: request.quantity || 1,
                    successUrl: successUrl, // Add the success URL for redirect
                    customer: request.customerEmail
                        ? {
                              email: request.customerEmail,
                          }
                        : undefined,
                    metadata: {
                        packageId: request.productId, // Store the internal package ID for webhook processing
                        successUrl: successUrl,
                        isSubscription: isSubscription ? 'true' : 'false',
                        source: 'vtchat-app',
                        timestamp: new Date().toISOString(),
                    },
                },
            });

            console.log('[CreemService] Checkout session created successfully:', {
                checkoutId: result.id,
                checkoutUrl: result.checkoutUrl,
            });

            // The result should contain the checkout entity with the checkout URL
            if (result && typeof result === 'object' && 'checkoutUrl' in result) {
                return {
                    checkoutId: result.id || '',
                    url: result.checkoutUrl || '',
                    success: true,
                };
            }

            throw new Error('Invalid checkout response - missing checkout URL');
        } catch (error: any) {
            console.error('[CreemService] Checkout creation failed:', error);
            throw new CheckoutError(
                `Failed to create checkout session: ${error.message || 'Unknown error'}`
            );
        }
    }

    /**
     * Get customer portal URL for managing subscriptions
     */
    static async getPortalUrl(customerEmail?: string): Promise<PortalResponse> {
        try {
            // Get base URL for fallback
            const baseUrl =
                process.env.NEXT_PUBLIC_APP_URL ||
                process.env.NEXTAUTH_URL ||
                process.env.VERCEL_URL ||
                'https://www.creem.io';

            const normalizedBaseUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;

            // If in sandbox mode, return the Creem.io sandbox customer portal
            // In production, we would need proper customer ID management
            if (process.env.NODE_ENV !== 'production') {
                return {
                    url: `https://www.creem.io/test/billing?product=${this.PRODUCT_ID}`,
                    success: true,
                };
            }

            // For production, we would need customer ID lookup from user metadata
            // For now, provide a reasonable fallback that allows subscription management
            return {
                url: `${normalizedBaseUrl}/plus`,
                success: true,
            };
        } catch (error) {
            console.error('Creem portal error:', error);
            // Return fallback URL instead of throwing
            const baseUrl =
                process.env.NEXT_PUBLIC_APP_URL ||
                process.env.NEXTAUTH_URL ||
                process.env.VERCEL_URL ||
                'https://www.creem.io';

            const normalizedBaseUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;

            return {
                url: `${normalizedBaseUrl}/plus`,
                success: true,
            };
        }
    }

    /**
     * Purchase credits with a specific package
     */
    static async purchaseCredits(
        packageId: keyof typeof CREEM_CREDIT_PACKAGES,
        quantity = 1,
        customerEmail?: string
    ) {
        const package_ = CREEM_CREDIT_PACKAGES[packageId];
        console.log('[CreemService] Creating credit purchase checkout for:', {
            packageId,
            packageName: package_.name,
            quantity,
            customerEmail,
        });

        return this.createCheckout({
            productId: this.PRODUCT_ID, // Use the actual Creem product ID
            quantity,
            customerEmail,
            successUrl: `${typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/success?package=${packageId}&quantity=${quantity}`,
        });
    }

    /**
     * Subscribe to VT+ plan
     */
    static async subscribeToVtPlus(customerEmail?: string) {
        console.log('[CreemService] Creating VT+ subscription checkout for:', customerEmail);

        return this.createCheckout({
            productId: this.PRODUCT_ID, // Use the actual Creem product ID, not our internal ID
            customerEmail,
            successUrl: `${typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/success?plan=vt_plus`,
        });
    }

    /**
     * Calculate total credits for a purchase
     */
    static calculateCredits(packageId: keyof typeof CREEM_CREDIT_PACKAGES, quantity = 1): number {
        const package_ = CREEM_CREDIT_PACKAGES[packageId];
        return package_.credits * quantity;
    }

    /**
     * Calculate total price for a purchase
     */
    static calculatePrice(packageId: keyof typeof CREEM_CREDIT_PACKAGES, quantity = 1): number {
        const package_ = CREEM_CREDIT_PACKAGES[packageId];
        return package_.price * quantity;
    }

    /**
     * Get all available credit packages
     */
    static getCreditPackages() {
        return Object.entries(CREEM_CREDIT_PACKAGES)
            .filter(([key, _]) => key !== 'PLUS_SUBSCRIPTION')
            .map(([key, package_]) => ({
                packageKey: key as keyof typeof CREEM_CREDIT_PACKAGES,
                ...package_,
            }));
    }

    /**
     * Get all available subscription plans
     */
    static getSubscriptionPlans() {
        return Object.entries(CREEM_CREDIT_PACKAGES)
            .filter(([_, package_]) => 'recurring' in package_ && package_.recurring)
            .map(([key, package_]) => ({
                packageKey: key as keyof typeof CREEM_CREDIT_PACKAGES,
                ...package_,
            }));
    }

    /**
     * Check if user can afford a specific chat mode based on their current credit balance
     */
    static canAffordChatMode(
        credits: number,
        chatMode: string,
        creditCosts: Record<string, number>
    ): boolean {
        const cost = creditCosts[chatMode] || 0;
        return credits >= cost;
    }

    /**
     * Calculate how many sessions of a specific chat mode a user can afford
     */
    static calculateAffordableSessions(
        credits: number,
        chatMode: string,
        creditCosts: Record<string, number>
    ): number {
        const cost = creditCosts[chatMode] || 0;
        if (cost === 0) return Infinity;
        return Math.floor(credits / cost);
    }

    /**
     * Get Creem client instance for advanced operations
     */
    static getClient() {
        return this.client;
    }
}

// Error types
export class CreemError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CreemError';
    }
}

export class CheckoutError extends CreemError {
    constructor(message: string) {
        super(message);
        this.name = 'CheckoutError';
    }
}

// No longer exporting backward compatibility aliases
