'use client';

import { useEffect, useState } from 'react';

interface User {
    id: string;
    email?: string | null;
    planSlug?: string | null;
}

interface UseSubscriptionResult {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    isVTPlus: boolean;
    refetch: () => Promise<void>;
}

/**
 * Subscription hook for VTChat (Creem.io)
 */
export function useSubscription(): UseSubscriptionResult {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUserData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Fetch user data from your API
            const response = await fetch('/api/user/profile', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch user data: ${response.status}`);
            }

            const userData = await response.json();
            setUser(userData.user);
        } catch (err) {
            console.error('Error fetching user data:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch user data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const isVTPlus = user?.planSlug === 'vt_plus';

    return {
        user,
        isLoading,
        error,
        isVTPlus,
        refetch: fetchUserData,
    };
}

export default useSubscription;
