'use client';

/**
 * Creem Credits Store
 *
 * Manages user credits purchased through Creem.io
 * Integrates with existing subscription system
 */

import { CREEM_CREDIT_PACKAGES, CreemService, isDevTestMode } from '@repo/shared/utils';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface CreditTransaction {
    id: string;
    type: 'purchase' | 'usage' | 'bonus' | 'refund';
    amount: number;
    description: string;
    timestamp: Date;
    metadata?: Record<string, any>;
}

interface CreditsState {
    // Current credit balance
    balance: number;

    // Transaction history
    transactions: CreditTransaction[];

    // Loading states
    isLoading: boolean;
    isInitialized: boolean;

    // Actions
    addCredits: (amount: number, description: string, type?: CreditTransaction['type']) => void;
    useCredits: (amount: number, description: string) => boolean;
    setBalance: (balance: number) => void;
    updateFromUser: (user: any) => void;
    reset: () => void;

    // Purchase helpers
    purchaseCredits: (
        packageId: keyof typeof CREEM_CREDIT_PACKAGES,
        quantity?: number
    ) => Promise<void>;

    // Utility methods
    canAfford: (cost: number) => boolean;
    getTransactionHistory: () => CreditTransaction[];
    getTotalPurchased: () => number;
    getTotalUsed: () => number;
}

export const useCreditsStore = create<CreditsState>()(
    subscribeWithSelector((set, get) => ({
        // Initial state
        balance: 0,
        transactions: [],
        isLoading: true,
        isInitialized: false,

        // Actions
        addCredits: (amount: number, description: string, type = 'purchase') => {
            const transaction: CreditTransaction = {
                id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type,
                amount,
                description,
                timestamp: new Date(),
            };

            set(state => ({
                balance: state.balance + amount,
                transactions: [transaction, ...state.transactions],
            }));
        },

        useCredits: (amount: number, description: string) => {
            // DEV TEST MODE: Always allow credit usage
            if (isDevTestMode()) {
                console.log('🚧 DEV TEST MODE: Bypassing credit usage check - always allowing', {
                    amount,
                    description,
                });
                return true;
            }

            const { balance } = get();

            if (balance < amount) {
                return false; // Insufficient credits
            }

            const transaction: CreditTransaction = {
                id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: 'usage',
                amount: -amount, // Negative for usage
                description,
                timestamp: new Date(),
            };

            set(state => ({
                balance: state.balance - amount,
                transactions: [transaction, ...state.transactions],
            }));

            return true;
        },

        setBalance: (balance: number) => {
            set({
                balance,
                isLoading: false,
                isInitialized: true,
            });
        },

        updateFromUser: (user: any) => {
            if (!user) {
                set({
                    balance: 0,
                    transactions: [],
                    isLoading: false,
                    isInitialized: true,
                });
                return;
            }

            // Extract credits from Better Auth user data
            // Credits are now stored directly in the user's credits field
            const currentBalance = user.credits || 0;

            set({
                balance: currentBalance,
                transactions: [], // Transactions will be fetched separately if needed
                isLoading: false,
                isInitialized: true,
            });
        },

        reset: () => {
            set({
                balance: 0,
                transactions: [],
                isLoading: false,
                isInitialized: false,
            });
        },

        // Purchase helpers
        purchaseCredits: async (packageId: keyof typeof CREEM_CREDIT_PACKAGES, quantity = 1) => {
            try {
                set({ isLoading: true });

                const checkout = await CreemService.purchaseCredits(packageId, quantity);

                // Redirect to checkout
                if (checkout.url) {
                    window.location.href = checkout.url;
                }
            } catch (error) {
                console.error('Failed to purchase credits:', error);
                throw error;
            } finally {
                set({ isLoading: false });
            }
        },

        // Utility methods
        canAfford: (cost: number) => {
            // DEV TEST MODE: Always can afford
            if (isDevTestMode()) {
                console.log('🚧 DEV TEST MODE: Bypassing canAfford check - always can afford', {
                    cost,
                });
                return true;
            }

            const { balance } = get();
            return balance >= cost;
        },

        getTransactionHistory: () => {
            const { transactions } = get();
            return [...transactions].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        },

        getTotalPurchased: () => {
            const { transactions } = get();
            return transactions
                .filter(tx => tx.type === 'purchase' || tx.type === 'bonus')
                .reduce((total, tx) => total + tx.amount, 0);
        },

        getTotalUsed: () => {
            const { transactions } = get();
            return Math.abs(
                transactions
                    .filter(tx => tx.type === 'usage')
                    .reduce((total, tx) => total + tx.amount, 0)
            );
        },
    }))
);

/**
 * Hook for convenient credits access
 */
export function useCredits() {
    return useCreditsStore();
}

/**
 * Hook for credit purchasing
 */
export function useCreditPurchasing() {
    const purchaseCredits = useCreditsStore(state => state.purchaseCredits);
    const isLoading = useCreditsStore(state => state.isLoading);

    const purchasePackage = async (packageId: keyof typeof CREEM_CREDIT_PACKAGES, quantity = 1) => {
        return purchaseCredits(packageId, quantity);
    };

    const getCreditPackages = () => CreemService.getCreditPackages();
    const getSubscriptionPlans = () => CreemService.getSubscriptionPlans();

    return {
        purchasePackage,
        isLoading,
        getCreditPackages,
        getSubscriptionPlans,
        calculateCredits: CreemService.calculateCredits,
        calculatePrice: CreemService.calculatePrice,
    };
}

/**
 * Credit store selectors for optimal re-renders
 */
export const creditSelectors = {
    balance: (state: CreditsState) => state.balance,
    isLoading: (state: CreditsState) => state.isLoading,
    transactions: (state: CreditsState) => state.transactions,
    canAfford: (state: CreditsState) => state.canAfford,
};
