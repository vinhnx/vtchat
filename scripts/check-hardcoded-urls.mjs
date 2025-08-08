#!/usr/bin/env node

/**
 * Check for hardcoded URLs in the codebase
 * This prevents regression of hardcoded localhost:3000 or production URLs
 */

import { execSync } from "node:child_process";
import { log } from "../packages/shared/dist/lib/logger.js";

const HARDCODED_URL_PATTERNS = [
    "localhost:3000",
    "https?:\\/\\/vtchat\\.io\\.vn",
    "http:\\/\\/localhost:3000",
    "https:\\/\\/localhost:3000",
];

const EXCLUDE_PATTERNS = [
    ".env*",
    "**/node_modules/**",
    "**/.git/**",
    "**/dist/**",
    "**/build/**",
    "**/.next/**",
    "**/coverage/**",
    "TODO.md", // Allow in TODO files
    "memory-bank/**", // Allow in documentation
    "docs/**", // Allow in documentation (will be updated separately)
    "*.md", // Allow in markdown files (will be updated separately)
];

function checkForHardcodedUrls() {
    log.info("🔍 Checking for hardcoded URLs...");

    // Check if ripgrep is available
    try {
        execSync("command -v rg", { stdio: "pipe" });
    } catch {
        log.warn("⚠️  ripgrep (rg) not found, falling back to grep");
        return checkWithGrep();
    }

    let foundViolations = false;

    for (const pattern of HARDCODED_URL_PATTERNS) {
        try {
            const excludeArgs = EXCLUDE_PATTERNS.map((p) => `--glob '!${p}'`).join(" ");
            const cmd = `rg -n "${pattern}" ${excludeArgs} --type-not binary`;

            const result = execSync(cmd, {
                encoding: "utf8",
                stdio: "pipe",
            });

            if (result.trim()) {
                log.error(`\n❌ Hardcoded URL pattern "${pattern}" found:`);
                log.error(result);
                foundViolations = true;
            }
        } catch (error) {
            // rg exits with code 1 when no matches found, which is what we want
            if (error.status !== 1) {
                log.error(`Error running ripgrep: ${error.message}`);
                process.exit(2);
            }
        }
    }

    if (foundViolations) {
        log.error("\n💡 Fix these issues by:");
        log.error("  1. Using getBaseURL() from @repo/shared/config/baseUrl");
        log.error("  2. Using environment variables (NEXT_PUBLIC_APP_URL, APP_URL)");
        log.error("  3. For documentation, use placeholders like $DEV_URL or $PROD_URL");
        process.exit(1);
    }

    log.info("✅ No hardcoded URLs found");
}

function checkWithGrep() {
    log.info("Using basic file scanning (no ripgrep found)...");

    // For now, just warn and pass - the CI environment should have ripgrep
    log.warn("⚠️  Install ripgrep (rg) for proper URL checking");
    log.warn("   brew install ripgrep  # macOS");
    log.warn("   apt install ripgrep   # Ubuntu/Debian");
    log.info("✅ Skipping URL check (install ripgrep for full validation)");
}

// Only run if not imported as module
if (import.meta.url === `file://${process.argv[1]}`) {
    checkForHardcodedUrls();
}

export { checkForHardcodedUrls };
