'use client';
import { initHotjar } from '@repo/shared/utils';
import { createContext, useContext, useEffect, useState } from 'react';
import { useThreadAuth } from '../hooks';
import { initializeStorageCleanup } from '../utils/storage-cleanup';
import { log } from '@repo/shared/logger';

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
                log.warn({ data: error }, 'Failed to initialize Hotjar');
            }

            try {
                // Initialize storage cleanup to handle corrupted localStorage data
                initializeStorageCleanup();
            } catch (error) {
                log.warn({ data: error }, 'Failed to initialize storage cleanup');
            }
        }
    }, []);

    // During SSR, provide a consistent initial state
    if (typeof window === 'undefined') {
        const ssrContextValue: RootContextType = {
            isSidebarOpen: true,
            setIsSidebarOpen: () => {},
            isCommandSearchOpen: false,
            setIsCommandSearchOpen: () => {},
            isMobileSidebarOpen: false,
            setIsMobileSidebarOpen: () => {},
            isClient: false,
        };

        return <RootContext.Provider value={ssrContextValue}>{children}</RootContext.Provider>;
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
