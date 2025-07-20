#!/usr/bin/env node

const fs = require("node:fs");
const _path = require("node:path");
const { execSync } = require("node:child_process");

// Test UI components for Tailwind v4 compatibility
function testUIComponentsV4() {
    console.log("🧪 Testing UI components for Tailwind v4 compatibility...\n");

    // Define breaking changes mapping
    const breakingChanges = {
        "shadow-sm": "shadow-xs",
        "shadow(?!-)": "shadow-sm", // shadow but not shadow-sm, shadow-lg, etc.
        "rounded-sm": "rounded-xs",
        "rounded(?!-)": "rounded-sm", // rounded but not rounded-sm, rounded-lg, etc.
        "outline-none": "outline-hidden",
        "ring(?!-)": "ring-3", // ring but not ring-1, ring-2, etc.
    };

    // Find all component files using find command
    let allFiles = [];
    try {
        const findCommand =
            'find packages/ui/src packages/common/src apps/web/app -name "*.tsx" -o -name "*.ts" 2>/dev/null';
        const output = execSync(findCommand, { encoding: "utf8" });
        allFiles = output
            .trim()
            .split("\n")
            .filter((file) => file.length > 0);
    } catch (_error) {
        console.log("⚠️  Could not find component files. Checking current directory...");
        // Fallback to manual file discovery
        const checkDirs = ["packages/ui/src", "packages/common/src", "apps/web/app"];
        checkDirs.forEach((dir) => {
            if (fs.existsSync(dir)) {
                try {
                    const findCmd = `find ${dir} -name "*.tsx" -o -name "*.ts" 2>/dev/null`;
                    const files = execSync(findCmd, { encoding: "utf8" })
                        .trim()
                        .split("\n")
                        .filter((f) => f);
                    allFiles = allFiles.concat(files);
                } catch (_e) {
                    // Directory might not exist
                }
            }
        });
    }

    console.log(`📁 Found ${allFiles.length} component files to check\n`);

    let totalIssues = 0;
    let filesWithIssues = 0;
    const issuesByFile = {};

    allFiles.forEach((filePath) => {
        if (!fs.existsSync(filePath)) return;

        const content = fs.readFileSync(filePath, "utf8");
        const fileIssues = [];

        // Check for each breaking change
        Object.entries(breakingChanges).forEach(([oldPattern, newUtility]) => {
            // Create regex to match the old utility in className strings
            const regex = new RegExp(`className="[^"]*\\b${oldPattern}\\b[^"]*"`, "g");
            const matches = content.match(regex);

            if (matches) {
                matches.forEach((match) => {
                    // Extract line number
                    const lines = content.substring(0, content.indexOf(match)).split("\n");
                    const lineNumber = lines.length;

                    fileIssues.push({
                        line: lineNumber,
                        match: match.trim(),
                        oldUtility: oldPattern,
                        newUtility: newUtility,
                    });
                });
            }
        });

        if (fileIssues.length > 0) {
            issuesByFile[filePath] = fileIssues;
            filesWithIssues++;
            totalIssues += fileIssues.length;
        }
    });

    // Report results
    if (totalIssues === 0) {
        console.log("✅ All UI components are compatible with Tailwind v4!");
        console.log("🎉 No breaking changes detected in component files.");
        return true;
    } else {
        console.log(`⚠️  Found ${totalIssues} potential issues in ${filesWithIssues} files:\n`);

        Object.entries(issuesByFile).forEach(([filePath, issues]) => {
            console.log(`📄 ${filePath}:`);
            issues.forEach((issue) => {
                console.log(`   Line ${issue.line}: ${issue.match}`);
                console.log(
                    `   → Suggestion: Replace '${issue.oldUtility}' with '${issue.newUtility}'`,
                );
                console.log("");
            });
        });

        console.log("📋 Summary of required changes:");
        Object.entries(breakingChanges).forEach(([old, newUtil]) => {
            console.log(`   • ${old} → ${newUtil}`);
        });

        return false;
    }
}

// No external dependencies needed

// Run the test
const success = testUIComponentsV4();
process.exit(success ? 0 : 1);
