#!/usr/bin/env node

const fs = require("node:fs");
const _path = require("node:path");
const { execSync } = require("node:child_process");

// Fix UI components for Tailwind v4 compatibility
function fixUIComponentsV4() {
    // Define breaking changes mapping (more precise patterns)
    const breakingChanges = [
        {
            pattern: /\bshadow-sm\b/g,
            replacement: "shadow-xs",
            description: "shadow-sm → shadow-xs",
        },
        {
            pattern: /\bshadow\b(?!-)/g,
            replacement: "shadow-sm",
            description: "shadow → shadow-sm",
        },
        {
            pattern: /\brounded-sm\b/g,
            replacement: "rounded-xs",
            description: "rounded-sm → rounded-xs",
        },
        {
            pattern: /\brounded\b(?!-)/g,
            replacement: "rounded-sm",
            description: "rounded → rounded-sm",
        },
        {
            pattern: /\boutline-none\b/g,
            replacement: "outline-hidden",
            description: "outline-none → outline-hidden",
        },
        {
            pattern: /\bring\b(?!-)/g,
            replacement: "ring-3",
            description: "ring → ring-3",
        },
    ];

    // Find all component files
    let allFiles = [];
    try {
        const findCommand =
            'find packages/ui/src packages/common/src apps/web/app -name "*.tsx" -o -name "*.ts" 2>/dev/null';
        const output = execSync(findCommand, { encoding: "utf8" });
        allFiles = output
            .trim()
            .split("\n")
            .filter((file) => file.length > 0);
    } catch {
        process.exit(1);
    }

    let totalChanges = 0;
    const changesByFile = {};

    allFiles.forEach((filePath) => {
        if (!fs.existsSync(filePath)) return;

        let content = fs.readFileSync(filePath, "utf8");
        const originalContent = content;
        const fileChanges = [];

        // Apply each breaking change fix
        breakingChanges.forEach((change) => {
            const matches = content.match(change.pattern);
            if (matches) {
                const changeCount = matches.length;
                content = content.replace(change.pattern, change.replacement);
                fileChanges.push({
                    description: change.description,
                    count: changeCount,
                });
                totalChanges += changeCount;
            }
        });

        // Write back if changes were made
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, "utf8");
            changesByFile[filePath] = fileChanges;
        }
    });

    // Report results
    if (totalChanges === 0) {
        return true;
    } else {
        Object.entries(changesByFile).forEach(([_, changes]) => {
            changes.forEach((_change) => {});
        });

        return true;
    }
}

// Run the fix
const success = fixUIComponentsV4();
process.exit(success ? 0 : 1);
