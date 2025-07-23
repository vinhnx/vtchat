"use client";
import { log } from "@repo/shared/logger";
import { initHotjar } from "@repo/shared/utils";
import { createContext, useContext, useEffect, useState } from "react";
import { useThreadAuth } from "../hooks";
import { initializeStorageCleanup } from "../utils/storage-cleanup";

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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Start with sidebar closed
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isCommandSearchOpen, setIsCommandSearchOpen] = useState(false);

    // Initialize thread authentication and database switching
    useThreadAuth();

    useEffect(() => {
        setIsClient(true);
        
        // Initialize sidebar state from localStorage if available
        if (typeof window !== "undefined") {
            try {
                const storedSidebarState = localStorage.getItem("sidebar-state");
                if (storedSidebarState) {
                    const { isOpen } = JSON.parse(storedSidebarState);
                    setIsSidebarOpen(isOpen ?? false);
                } else {
                    // Default to collapsed state if no stored state
                    setIsSidebarOpen(false);
                }
            } catch (error) {
                log.warn({ data: error }, "Failed to load sidebar state from localStorage");
                // Default to collapsed state if error
                setIsSidebarOpen(false);
            }
            
            try {
                initHotjar();
            } catch (error) {
                log.warn({ data: error }, "Failed to initialize Hotjar");
            }

            try {
                // Initialize storage cleanup to handle corrupted localStorage data
                initializeStorageCleanup();
            } catch (error) {
                log.warn({ data: error }, "Failed to initialize storage cleanup");
            }
        }
    }, []);

    // During SSR, provide a consistent initial state
    if (typeof window === "undefined") {
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
                setIsSidebarOpen: (open) => {
                    const newState = typeof open === 'function' ? open(isSidebarOpen) : open;
                    setIsSidebarOpen(newState);
                    
                    // Save to localStorage
                    if (typeof window !== 'undefined') {
                        try {
                            const currentState = localStorage.getItem("sidebar-state");
                            const parsedState = currentState ? JSON.parse(currentState) : { animationDisabled: false };
                            localStorage.setItem(
                                "sidebar-state",
                                JSON.stringify({
                                    ...parsedState,
                                    isOpen: newState,
                                })
                            );
                        } catch (error) {
                            log.warn({ data: error }, "Failed to save sidebar state to localStorage");
                        }
                    }
                },
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
        throw new Error("useRootContext must be used within a RootProvider");
    }
    return context;
};
