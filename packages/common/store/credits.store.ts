'use client';

/**
 * Polar Credits Store
 *
 * Manages user credits purchased through Polar.sh
 * Integrates with existing subscription system
 */

import { POLAR_CREDIT_PACKAGES, PolarService } from '@repo/shared/utils/polar';
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
        packageId: keyof typeof POLAR_CREDIT_PACKAGES,
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

            // Extract credits and transactions from user data
            // Handle different versions of Clerk API safely
            const privateMetadata = (user.privateMetadata as any) || {};
            const currentBalance = (privateMetadata.credits as number) || 0;

            // Convert stored transactions to our local format
            const storedTransactions = privateMetadata?.transactions || [];
            const formattedTransactions = storedTransactions.map((tx: any) => ({
                id: tx.id || `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: tx.type || 'purchase',
                amount: tx.type === 'usage' ? -tx.amount : tx.amount,
                description: tx.productName || tx.mode || 'Transaction',
                timestamp: new Date(tx.timestamp || Date.now()),
                metadata: {
                    checkoutId: tx.checkoutId,
                    mode: tx.mode,
                },
            }));

            set({
                balance: currentBalance,
                transactions: formattedTransactions,
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
        purchaseCredits: async (packageId: keyof typeof POLAR_CREDIT_PACKAGES, quantity = 1) => {
            try {
                set({ isLoading: true });

                const checkout = await PolarService.purchaseCredits(packageId, quantity);

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

    const purchasePackage = async (packageId: keyof typeof POLAR_CREDIT_PACKAGES, quantity = 1) => {
        return purchaseCredits(packageId, quantity);
    };

    const getCreditPackages = () => PolarService.getCreditPackages();
    const getSubscriptionPlans = () => PolarService.getSubscriptionPlans();

    return {
        purchasePackage,
        isLoading,
        getCreditPackages,
        getSubscriptionPlans,
        calculateCredits: PolarService.calculateCredits,
        calculatePrice: PolarService.calculatePrice,
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
