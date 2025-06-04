/**
 * Polar.sh Payment Service
 *
 * Handles integration with Polar.sh for payments and subscriptions
 * while maintaining compatibility with existing Clerk-based authentication
 */

// Types for Polar.sh integration
export interface PolarProduct {
    id: string;
    name: string;
    description?: string;
    prices: PolarPrice[];
}

export interface PolarPrice {
    id: string;
    price_amount: number;
    price_currency: string;
    type: 'one_time' | 'recurring';
    recurring_interval?: 'month' | 'year';
}

export interface CheckoutRequest {
    priceId: string;
    successUrl?: string;
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

// Polar Credit Purchase Options with internal price IDs (mapped to Polar UUIDs in API)
export const POLAR_CREDIT_PACKAGES = {
    SMALL: {
        id: 'credits_100', // Internal ID mapped to Polar UUID in API
        name: '100 Polar Credits',
        credits: 100,
        price: 5, // $5
        description: 'Perfect for light usage',
    },
    MEDIUM: {
        id: 'credits_500', // Internal ID mapped to Polar UUID in API
        name: '500 Polar Credits',
        credits: 500,
        price: 20, // $20 (20% discount)
        description: 'Great for regular users',
        popular: true,
    },
    LARGE: {
        id: 'credits_1000', // Internal ID mapped to Polar UUID in API
        name: '1,000 Polar Credits',
        credits: 1000,
        price: 35, // $35 (30% discount)
        description: 'Best value for power users',
    },
    PLUS_SUBSCRIPTION: {
        id: 'vt_plus_monthly', // Internal ID mapped to Polar UUID in API
        name: 'VT+ Monthly',
        credits: 1000, // Monthly allowance
        price: 19, // $19/month
        description: 'Unlimited access + 1,000 monthly credits',
        recurring: true,
        interval: 'month' as const,
    },
} as const;

/**
 * Polar.sh Service Class
 */
export class PolarService {
    private static baseUrl = '/api';

    /**
     * Create a checkout session for purchasing credits or subscriptions
     */
    static async createCheckout(request: CheckoutRequest): Promise<CheckoutResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
                credentials: 'same-origin', // Include credentials for auth cookies
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorObj;
                try {
                    errorObj = JSON.parse(errorText);
                } catch (e) {
                    console.error('Error parsing checkout error response:', errorText);
                }

                if (response.status === 401) {
                    throw new CheckoutError(
                        'Authentication required. Please sign in and try again.'
                    );
                }

                throw new CheckoutError(
                    errorObj?.error || `Failed to create checkout session (${response.status})`
                );
            }

            return response.json();
        } catch (error) {
            if (error instanceof CheckoutError) {
                throw error;
            }
            console.error('Unexpected checkout error:', error);
            throw new CheckoutError('Failed to create checkout session. Please try again later.');
        }
    }

    /**
     * Get customer portal URL for managing subscriptions
     */
    static async getPortalUrl(): Promise<PortalResponse> {
        const response = await fetch(`${this.baseUrl}/portal`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to access customer portal');
        }

        return response.json();
    }

    /**
     * Purchase credits with a specific package
     */
    static async purchaseCredits(packageId: keyof typeof POLAR_CREDIT_PACKAGES, quantity = 1) {
        const package_ = POLAR_CREDIT_PACKAGES[packageId];

        // For now, we'll use the package ID as the price ID
        // In a real implementation, you'd map these to actual Polar.sh price IDs
        const priceId = package_.id;

        return this.createCheckout({
            priceId,
            quantity,
            successUrl: `${window.location.origin}/success?package=${packageId}&quantity=${quantity}`,
        });
    }

    /**
     * Subscribe to VT+ plan
     */
    static async subscribeToVtPlus() {
        const vtPlus = POLAR_CREDIT_PACKAGES.PLUS_SUBSCRIPTION;

        return this.createCheckout({
            priceId: vtPlus.id,
            successUrl: `${window.location.origin}/success?plan=vt_plus`,
        });
    }

    /**
     * Calculate total credits for a purchase
     */
    static calculateCredits(packageId: keyof typeof POLAR_CREDIT_PACKAGES, quantity = 1): number {
        const package_ = POLAR_CREDIT_PACKAGES[packageId];
        return package_.credits * quantity;
    }

    /**
     * Calculate total price for a purchase
     */
    static calculatePrice(packageId: keyof typeof POLAR_CREDIT_PACKAGES, quantity = 1): number {
        const package_ = POLAR_CREDIT_PACKAGES[packageId];
        return package_.price * quantity;
    }

    /**
     * Get all available credit packages
     */
    static getCreditPackages() {
        return Object.entries(POLAR_CREDIT_PACKAGES)
            .filter(([key, _]) => key !== 'PLUS_SUBSCRIPTION')
            .map(([key, package_]) => ({
                packageKey: key as keyof typeof POLAR_CREDIT_PACKAGES,
                ...package_,
            }));
    }

    /**
     * Get all available subscription plans
     */
    static getSubscriptionPlans() {
        return Object.entries(POLAR_CREDIT_PACKAGES)
            .filter(([_, package_]) => 'recurring' in package_ && package_.recurring)
            .map(([key, package_]) => ({
                packageKey: key as keyof typeof POLAR_CREDIT_PACKAGES,
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
}

// Error types
export class PolarError extends Error {
    constructor(
        message: string,
        public code?: string
    ) {
        super(message);
        this.name = 'PolarError';
    }
}

export class CheckoutError extends PolarError {
    constructor(message: string) {
        super(message, 'CHECKOUT_ERROR');
        this.name = 'CheckoutError';
    }
}

export class PortalError extends PolarError {
    constructor(message: string) {
        super(message, 'PORTAL_ERROR');
        this.name = 'PortalError';
    }
}
