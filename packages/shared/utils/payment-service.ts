/**
 * Creem.io Payment Service
 *
 * Handles integration with Creem.io for payments and subscriptions
 * while maintaining compatibility with Better Auth authentication
 */

import { log } from '@repo/shared/logger';
import { Creem } from 'creem';
import { PlanSlug } from '../types/subscription';
import { isProductionEnvironment } from './env';

// Types for Creem.io integration
export const PriceType = {
    ONE_TIME: 'one_time',
    RECURRING: 'recurring',
} as const;

export type PriceType = (typeof PriceType)[keyof typeof PriceType];

export const RecurringInterval = {
    MONTH: 'month',
    YEAR: 'year',
    DAY: 'day',
    WEEK: 'week',
} as const;

export type RecurringInterval = (typeof RecurringInterval)[keyof typeof RecurringInterval];

export interface CreemProduct {
    id: string;
    name: string;
    description?: string;
    prices: CreemPrice[];
}

export interface CreemPrice {
    id: string;
    productId: string;
    active: boolean;
    currency: string;
    description: string | null;
    type: PriceType;
    unitAmount: number | null;
    recurring_interval: RecurringInterval | null;
    recurring_interval_count: number | null;
    trial_period_days: number | null;
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

/**
 * Creem.io Service Class
 */
export class CreemService {
    // Configure Creem client based on environment
    // serverIdx: 0 - Production (https://api.creem.io)
    // serverIdx: 1 - Sandbox (https://test-api.creem.io)
    private static client = new Creem({
        serverIdx: isProductionEnvironment() ? 0 : 1,
    });

    // API Key from environment - MUST be a sandbox API key for development
    // Sandbox API keys usually start with 'creem_test_'
    private static readonly API_KEY = process.env.CREEM_API_KEY;

    // Product ID from environment - configurable for different environments
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
            if (!CreemService.API_KEY) {
                throw new Error('CREEM_API_KEY not configured');
            }

            log.info('[CreemService] Creating checkout session with:', {
                productId: request.productId,
                quantity: request.quantity || 1,
                email: request.customerEmail,
                successUrl: request.successUrl,
            });

            // Determine if this is for VT+ subscription based on our internal mapping
            const _isSubscription =
                request.productId === PlanSlug.VT_PLUS || // Changed from 'vt_plus_monthly'
                request.successUrl?.includes(`plan=${PlanSlug.VT_PLUS}`); // Used PlanSlug

            // Get the base URL for success redirect
            const baseUrl = CreemService.getBaseUrl();
            const normalizedBaseUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;

            // Ensure success URL is properly formatted for redirect - must be absolute URL
            const successUrl = request.successUrl
                ? request.successUrl.startsWith('http')
                    ? request.successUrl
                    : `${normalizedBaseUrl}${request.successUrl}`
                : `${normalizedBaseUrl}/success?plan=${PlanSlug.VT_PLUS}`; // Used PlanSlug

            log.info('[CreemService] Using success URL:', { data: successUrl });

            const result = await CreemService.client.createCheckout({
                xApiKey: CreemService.API_KEY,
                createCheckoutRequest: {
                    productId: CreemService.PRODUCT_ID || '', // Use configured product ID with fallback
                    units: request.quantity || 1,
                    successUrl,
                    customer: request.customerEmail
                        ? {
                              email: request.customerEmail,
                          }
                        : undefined,
                    metadata: {
                        packageId: request.productId || '', // Store the internal package ID for webhook processing
                        successUrl,
                        source: 'vtchat-app',
                        timestamp: new Date().toISOString(),
                    },
                },
            });

            log.info('[CreemService] Checkout session created successfully:', {
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
            log.error('[CreemService] Checkout creation failed:', { data: error });
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
            if (!CreemService.API_KEY) {
                throw new Error('CREEM_API_KEY not configured');
            }

            // If we have a userId, try to get the customer ID from the database
            let customerId: string | null = null;

            if (userId && typeof require !== 'undefined') {
                try {
                    // Import database modules only on server side
                    const { db } = require('@/lib/database');
                    const { users } = require('@/lib/database/schema');
                    const { eq } = require('drizzle-orm');

                    const userResults = await db
                        .select()
                        .from(users)
                        .where(eq(users.id, userId))
                        .limit(1);
                    if (userResults.length > 0 && userResults[0].creemCustomerId) {
                        customerId = userResults[0].creemCustomerId;
                        log.info({ userId }, '[CreemService] Found customer ID for user');
                    }
                } catch (_dbError) {
                    log.info('[CreemService] Database lookup failed, proceeding with fallback');
                }
            }

            // If we have a customer ID, use the proper Creem SDK method
            if (customerId) {
                try {
                    const result = await CreemService.client.generateCustomerLinks({
                        xApiKey: CreemService.API_KEY!,
                        createCustomerPortalLinkRequestEntity: {
                            customerId,
                        },
                    });

                    // Handle the CustomerLinksEntity response properly
                    if (result && typeof result === 'object') {
                        // The response should contain a portal URL - check different possible properties
                        const portalUrl =
                            (result as any).portalUrl ||
                            (result as any).url ||
                            (result as any).link;

                        if (portalUrl) {
                            log.info('[CreemService] Generated customer portal URL successfully');
                            return {
                                url: portalUrl,
                                success: true,
                            };
                        }
                    }
                } catch (sdkError) {
                    log.error(
                        { error: sdkError },
                        '[CreemService] Creem SDK generateCustomerLinks failed'
                    );
                    // Fall through to fallback logic
                }
            }

            // Fallback logic for when customer ID is not available or SDK call fails
            const baseUrl = CreemService.getBaseUrl();
            const normalizedBaseUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;

            // If not in production, return the Creem.io sandbox customer portal
            if (!isProductionEnvironment()) {
                return {
                    url: `https://www.creem.io/test/billing?product=${CreemService.PRODUCT_ID || ''}`,
                    success: true,
                };
            }

            // For production without customer ID, redirect to subscription management page
            return {
                url: `${normalizedBaseUrl}/plus`,
                success: true,
            };
        } catch (error) {
            log.error('Creem portal error:', { data: error });
            // Return fallback URL instead of throwing
            const baseUrl = CreemService.getBaseUrl();
            const normalizedBaseUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;

            return {
                url: `${normalizedBaseUrl}/plus`,
                success: true,
            };
        }
    }

    /**
     * Subscribe to VT+ plan
     */
    static async subscribeToVtPlus(customerEmail?: string) {
        log.info('[CreemService] Creating VT+ subscription checkout');

        return CreemService.createCheckout({
            productId: CreemService.PRODUCT_ID || '', // Use the actual Creem product ID, not our internal ID
            customerEmail,
            successUrl: `${typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || 'https://vtchat.io.vn'}/success?plan=${PlanSlug.VT_PLUS}`, // Used PlanSlug
        });
    }

    /**
     * Get Creem client instance for advanced operations
     */
    static getClient() {
        return CreemService.client;
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
