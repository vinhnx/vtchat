/**
 * Creem.io Payment Service
 *
 * Handles integration with Creem.io for payments and subscriptions
 * while maintaining compatibility with Better Auth authentication
 */

import { Creem } from 'creem';
import { PlanSlug } from '../types/subscription';
import { isProductionEnvironment } from './env';
import { logger } from '@repo/shared/logger';

// Types for Creem.io integration
export enum PriceType {
    ONE_TIME = 'one_time',
    RECURRING = 'recurring',
}

export enum RecurringInterval {
    MONTH = 'month',
    YEAR = 'year',
    DAY = 'day',
    WEEK = 'week',
}

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
            'http://localhost:3000'
        );
    }

    /**
     * Create a checkout session for VT+ subscriptions
     */
    static async createCheckout(request: CheckoutRequest): Promise<CheckoutResponse> {
        try {
            if (!this.API_KEY) {
                throw new Error('CREEM_API_KEY not configured');
            }

            logger.info('[CreemService] Creating checkout session with:', {
                productId: request.productId,
                quantity: request.quantity || 1,
                email: request.customerEmail,
                successUrl: request.successUrl,
            });

            // Determine if this is for VT+ subscription based on our internal mapping
            const isSubscription =
                request.productId === PlanSlug.VT_PLUS || // Changed from 'vt_plus_monthly'
                (request.successUrl && request.successUrl.includes(`plan=${PlanSlug.VT_PLUS}`)); // Used PlanSlug

            // Get the base URL for success redirect
            const baseUrl = this.getBaseUrl();
            const normalizedBaseUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;

            // Ensure success URL is properly formatted for redirect - must be absolute URL
            const successUrl = request.successUrl
                ? request.successUrl.startsWith('http')
                    ? request.successUrl
                    : `${normalizedBaseUrl}${request.successUrl}`
                : `${normalizedBaseUrl}/success?plan=${PlanSlug.VT_PLUS}`; // Used PlanSlug

            logger.info('[CreemService] Using success URL:', { data: successUrl });

            const result = await this.client.createCheckout({
                xApiKey: this.API_KEY,
                createCheckoutRequest: {
                    productId: this.PRODUCT_ID || '', // Use configured product ID with fallback
                    units: request.quantity || 1,
                    successUrl: successUrl,
                    customer: request.customerEmail
                        ? {
                              email: request.customerEmail,
                          }
                        : undefined,
                    metadata: {
                        packageId: request.productId || '', // Store the internal package ID for webhook processing
                        successUrl: successUrl,
                        source: 'vtchat-app',
                        timestamp: new Date().toISOString(),
                    },
                },
            });

            logger.info('[CreemService] Checkout session created successfully:', {
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
            logger.error('[CreemService] Checkout creation failed:', { data: error });
            throw new CheckoutError(
                `Failed to create checkout session: ${error.message || 'Unknown error'}`
            );
        }
    }

    /**
     * Get customer portal URL for managing subscriptions
     */
    static async getPortalUrl(customerEmail?: string, userId?: string): Promise<PortalResponse> {
        try {
            if (!this.API_KEY) {
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
                        console.log(
                            '[CreemService] Found customer ID for user:',
                            userId,
                            customerId
                        );
                    }
                } catch (dbError) {
                    logger.info('[CreemService] Database lookup failed, proceeding with fallback');
                }
            }

            // If we have a customer ID, use the proper Creem SDK method
            if (customerId) {
                try {
                    const result = await this.client.generateCustomerLinks({
                        xApiKey: this.API_KEY!,
                        createCustomerPortalLinkRequestEntity: {
                            customerId: customerId,
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
                            console.log(
                                '[CreemService] Generated customer portal URL successfully'
                            );
                            return {
                                url: portalUrl,
                                success: true,
                            };
                        }
                    }
                } catch (sdkError) {
                    console.error(
                        '[CreemService] Creem SDK generateCustomerLinks failed:',
                        sdkError
                    );
                    // Fall through to fallback logic
                }
            }

            // Fallback logic for when customer ID is not available or SDK call fails
            const baseUrl = this.getBaseUrl();
            const normalizedBaseUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;

            // If not in production, return the Creem.io sandbox customer portal
            if (!isProductionEnvironment()) {
                return {
                    url: `https://www.creem.io/test/billing?product=${this.PRODUCT_ID || ''}`,
                    success: true,
                };
            }

            // For production without customer ID, redirect to subscription management page
            return {
                url: `${normalizedBaseUrl}/plus`,
                success: true,
            };
        } catch (error) {
            logger.error('Creem portal error:', { data: error });
            // Return fallback URL instead of throwing
            const baseUrl = this.getBaseUrl();
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
        logger.info('[CreemService] Creating VT+ subscription checkout for:', { data: customerEmail });

        return this.createCheckout({
            productId: this.PRODUCT_ID || '', // Use the actual Creem product ID, not our internal ID
            customerEmail,
            successUrl: `${typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/success?plan=${PlanSlug.VT_PLUS}`, // Used PlanSlug
        });
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
