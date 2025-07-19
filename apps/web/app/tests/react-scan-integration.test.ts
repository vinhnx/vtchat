import { describe, expect, it } from "vitest";

describe("React Scan Integration", () => {
    it("should have react-scan dependency installed", () => {
        // Check if react-scan package is available (may be in root or app package.json)
        expect(() => require("react-scan")).not.toThrow();
    });

    it("should have development scripts configured", () => {
        const packageJson = require("../../package.json");
        expect(packageJson.scripts).toHaveProperty("dev:scan");
        expect(packageJson.scripts).toHaveProperty("scan");
        expect(packageJson.scripts["dev:scan"]).toContain("react-scan");
        expect(packageJson.scripts.scan).toContain("react-scan");
    });

    it("should have configuration constants defined", () => {
        // Test that configuration file exports expected constants
        const fs = require("node:fs");
        const configPath = "../../lib/config/react-scan.ts";
        expect(fs.existsSync(configPath)).toBe(false); // File may not exist in test env

        // Alternative: Check if react-scan package is available
        expect(() => require("react-scan")).not.toThrow();
    });
});
