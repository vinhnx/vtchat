"use client";
import { initHotjar } from "@repo/shared/utils";
import { createContext, useContext, useEffect, useState } from "react";
import { log } from "../../shared/src/lib/logger";
import { useThreadAuth } from "../hooks";
import { useAppStore } from "../store/app.store";

export type RootContextType = {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isSidebarOpen: boolean) => void;
    isCommandSearchOpen: boolean;
    setIsCommandSearchOpen: (isCommandSearchOpen: boolean) => void;
    isMobileSidebarOpen: boolean;
    setIsMobileSidebarOpen: (isMobileSidebarOpen: boolean) => void;
    isClient: boolean;
};

// Create a default context value to prevent null issues during SSR
const defaultContextValue: RootContextType = {
    isSidebarOpen: false,
    setIsSidebarOpen: () => {},
    isCommandSearchOpen: false,
    setIsCommandSearchOpen: () => {},
    isMobileSidebarOpen: false,
    setIsMobileSidebarOpen: () => {},
    isClient: false,
};

export const RootContext = createContext<RootContextType>(defaultContextValue);

export const RootProvider = ({ children }: { children: React.ReactNode }) => {
    const [isClient, setIsClient] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isCommandSearchOpen, setIsCommandSearchOpen] = useState(false);

    // Use app store for sidebar state management
    const isSidebarOpen = useAppStore((state) => state.isSidebarOpen);
    const setIsSidebarOpen = useAppStore((state) => state.setIsSidebarOpen);

    // Initialize thread authentication and database switching
    useThreadAuth();

    useEffect(() => {
        setIsClient(true);

        // Sidebar state is now managed by the app store, no need to initialize here
        try {
            initHotjar();
        } catch (error) {
            log.warn({ data: error }, "Failed to initialize Hotjar");
        }
    }, []);

    // During SSR, provide a consistent initial state that matches app store defaults
    if (typeof window === "undefined") {
        return <RootContext.Provider value={defaultContextValue}>{children}</RootContext.Provider>;
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
    // Context should always exist now with default value
    return context;
};
