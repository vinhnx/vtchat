/**
 * @jest-environment jsdom
 */

import { PlanSlug } from "@repo/shared/types/subscription";
import { renderHook } from "@testing-library/react";
import { useLogout } from "../use-logout";

// Mock dependencies
jest.mock("next-themes", () => ({
    useTheme: () => ({
        setTheme: jest.fn(),
    }),
}));

jest.mock("../store/api-keys.store", () => ({
    useApiKeysStore: (selector: any) =>
        selector({
            clearAllKeys: jest.fn(),
        }),
}));

jest.mock("../store/chat.store", () => ({
    useChatStore: (selector: any) =>
        selector({
            clearAllThreads: jest.fn(),
        }),
}));

jest.mock("../store/app.store", () => ({
    useAppStore: (selector: any) =>
        selector({
            resetUserState: jest.fn(),
        }),
}));

jest.mock("@repo/shared/lib/auth-client", () => ({
    signOut: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe("useLogout", () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        jest.clearAllMocks();

        // Mock successful API responses
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({}),
        });
    });

    it("should clear all premium cache on logout", async () => {
        // Set up localStorage with premium feature data
        localStorage.setItem("theme", "dark");
        localStorage.setItem(
            "subscription_status_user123",
            JSON.stringify({ plan: PlanSlug.VT_PLUS }),
        );
        localStorage.setItem("creem_token", "token123");
        localStorage.setItem("vt_plus_feature_cache", JSON.stringify({ darkMode: true }));
        localStorage.setItem("vtchat-preferences", JSON.stringify({ showExamplePrompts: false }));
        localStorage.setItem("premium_cache", JSON.stringify({ enabled: true }));
        localStorage.setItem("plus_features", JSON.stringify({ advanced: true }));

        const { result } = renderHook(() => useLogout());

        // Execute logout
        await result.current.logout();

        // Verify all premium-related cache is cleared
        expect(localStorage.getItem("theme")).toBeNull();
        expect(localStorage.getItem("subscription_status_user123")).toBeNull();
        expect(localStorage.getItem("creem_token")).toBeNull();
        expect(localStorage.getItem("vt_plus_feature_cache")).toBeNull();
        expect(localStorage.getItem("vtchat-preferences")).toBeNull();
        expect(localStorage.getItem("premium_cache")).toBeNull();
        expect(localStorage.getItem("plus_features")).toBeNull();
    });

    it("should clear dark theme related cache", async () => {
        // Set up dark theme related data
        localStorage.setItem("theme", "dark");
        localStorage.setItem("dark-mode-preference", "enabled");
        localStorage.setItem("theme-settings", JSON.stringify({ mode: "dark" }));

        const { result } = renderHook(() => useLogout());
        await result.current.logout();

        // Verify dark theme cache is cleared
        expect(localStorage.getItem("theme")).toBeNull();
        expect(localStorage.getItem("dark-mode-preference")).toBeNull();
        expect(localStorage.getItem("theme-settings")).toBeNull();
    });

    it("should clear VT+ specific cache keys", async () => {
        // Set up VT+ specific data
        localStorage.setItem("vt+_advanced_features", JSON.stringify({ enabled: true }));
        localStorage.setItem("vtplus_subscription", JSON.stringify({ active: true }));
        localStorage.setItem("vt_plus_cache", JSON.stringify({ premium: true }));

        const { result } = renderHook(() => useLogout());
        await result.current.logout();

        // Verify VT+ cache is cleared
        expect(localStorage.getItem("vt+_advanced_features")).toBeNull();
        expect(localStorage.getItem("vtplus_subscription")).toBeNull();
        expect(localStorage.getItem("vt_plus_cache")).toBeNull();
    });

    it("should preserve non-premium localStorage data", async () => {
        // Set up mix of premium and non-premium data
        localStorage.setItem("theme", "dark"); // Premium
        localStorage.setItem("language-preference", "en"); // Non-premium
        localStorage.setItem("vt_plus_cache", JSON.stringify({ premium: true })); // Premium
        localStorage.setItem("user-id", "user123"); // Non-premium

        const { result } = renderHook(() => useLogout());
        await result.current.logout();

        // Verify premium data is cleared but non-premium is preserved
        expect(localStorage.getItem("theme")).toBeNull();
        expect(localStorage.getItem("vt_plus_cache")).toBeNull();
        expect(localStorage.getItem("language-preference")).toBe("en");
        expect(localStorage.getItem("user-id")).toBe("user123");
    });

    it("should call server-side cache invalidation", async () => {
        const { result } = renderHook(() => useLogout());
        await result.current.logout();

        // Verify fetch was called to invalidate server cache
        expect(global.fetch).toHaveBeenCalledWith("/api/subscription/invalidate-cache", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
        });
    });

    it("should handle server cache invalidation failure gracefully", async () => {
        // Mock fetch to fail
        (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

        const { result } = renderHook(() => useLogout());

        // Should not throw error even if server cache invalidation fails
        await expect(result.current.logout()).resolves.not.toThrow();
    });
});
