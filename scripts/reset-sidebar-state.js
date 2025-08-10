import { log } from "@repo/shared/logger";

// Reset sidebar state in localStorage
if (typeof localStorage !== "undefined") {
    try {
        localStorage.setItem(
            "sidebar-state",
            JSON.stringify({ isOpen: false, animationDisabled: false }),
        );
        log.info("Sidebar state reset to closed");
    } catch (error) {
        log.error("Failed to reset sidebar state:", error);
    }
}
