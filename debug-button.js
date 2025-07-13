// Simple test to check Button import from @repo/ui
try {
    console.log("Testing @repo/ui import...");
    const ui = require("./packages/ui");
    console.log("Available exports:", Object.keys(ui));
    console.log("Button:", ui.Button);
    console.log("Button type:", typeof ui.Button);
} catch (error) {
    console.error("Import failed:", error.message);
}
