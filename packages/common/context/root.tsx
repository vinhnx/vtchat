'use client';
import { initHotjar } from '@repo/shared/utils';
import { createContext, useContext, useEffect, useState } from 'react';
import { useThreadAuth } from '../hooks';
import { initializeStorageCleanup } from '../utils/storage-cleanup';

export type RootContextType = {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isSidebarOpen: boolean) => void;
    isCommandSearchOpen: boolean;
    setIsCommandSearchOpen: (isCommandSearchOpen: boolean) => void;
    isMobileSidebarOpen: boolean;
    setIsMobileSidebarOpen: (isMobileSidebarOpen: boolean) => void;
    isClient: boolean;
};

export const RootContext = createContext<RootContextType | null>(null);

export const RootProvider = ({ children }: { children: React.ReactNode }) => {
    const [isClient, setIsClient] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isCommandSearchOpen, setIsCommandSearchOpen] = useState(false);

    // Initialize thread authentication and database switching
    useThreadAuth();

    useEffect(() => {
        setIsClient(true);
        // Only initialize Hotjar on client side and after component has mounted
        if (typeof window !== 'undefined') {
            try {
                initHotjar();
            } catch (error) {
                console.warn('Failed to initialize Hotjar:', error);
            }

            try {
                // Initialize storage cleanup to handle corrupted localStorage data
                initializeStorageCleanup();
            } catch (error) {
                console.warn('Failed to initialize storage cleanup:', error);
            }
        }
    }, []);

    // During SSR, don't render children that depend on client-side context
    if (typeof window === 'undefined') {
        return <>{children}</>;
    }

    return (
        <RootContext.Provider
            value={{
                isSidebarOpen,
                setIsSidebarOpen,
                isCommandSearchOpen,
                setIsCommandSearchOpen,
                isMobileSidebarOpen,
                setIsMobileSidebarOpen,
                isClient,
            }}
        >
            {children}
        </RootContext.Provider>
    );
};

export const useRootContext = () => {
    const context = useContext(RootContext);
    if (!context) {
        throw new Error('useRootContext must be used within a RootProvider');
    }
    return context;
};
