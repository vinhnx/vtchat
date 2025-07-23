// Reset sidebar state in localStorage
if (typeof localStorage !== "undefined") {
    try {
        localStorage.setItem(
            "sidebar-state",
            JSON.stringify({ isOpen: false, animationDisabled: false }),
        );
        console.log("Sidebar state reset to closed");
    } catch (error) {
        console.error("Failed to reset sidebar state:", error);
    }
}
