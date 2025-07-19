/**
 * User tier constants for VT Chat
 */
export enum UserTier {
    FREE = 'FREE',
    PLUS = 'PLUS',
}

export type UserTierType = 'FREE' | 'PLUS';

// Helper functions
export const isVtPlusUser = (userTier: UserTierType): boolean => {
    return userTier === UserTier.PLUS;
};

export const isVtFreeUser = (userTier: UserTierType): boolean => {
    return userTier === UserTier.FREE;
};
