#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

// Test if Tailwind v4 utilities are generated correctly
function testTailwindV4() {
    console.log("🧪 Testing Tailwind v4 upgrade...\n");

    const cssFile = path.join(
        __dirname,
        "../../packages/tailwind-config/test-output-with-source.css",
    );

    if (!fs.existsSync(cssFile)) {
        console.error("❌ CSS file not found:", cssFile);
        process.exit(1);
    }

    const css = fs.readFileSync(cssFile, "utf8");

    // Test cases for Tailwind v4 utilities
    const tests = [
        {
            name: "shadow-xs (new v4 utility)",
            selector: ".shadow-xs",
            expected: "--tw-shadow: 0 1px 2px 0 var(--tw-shadow-color, rgb(0 0 0 / 0.05))",
            breaking: false,
        },
        {
            name: "shadow-sm (v4 equivalent of v3 shadow)",
            selector: ".shadow-sm",
            expected: "--tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, rgb(0 0 0 / 0.1))",
            breaking: false,
        },
        {
            name: "ring-3 (v4 equivalent of v3 ring)",
            selector: ".ring-3",
            expected:
                "--tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(3px + var(--tw-ring-offset-width))",
            breaking: false,
        },
        {
            name: "rounded-xs (new v4 utility)",
            selector: ".rounded-xs",
            expected: "border-radius: var(--radius-xs)",
            breaking: false,
        },
        {
            name: "outline-hidden (v4 equivalent of v3 outline-none)",
            selector: ".outline-hidden",
            expected: "outline: 2px solid transparent",
            breaking: false,
        },
    ];

    let passed = 0;
    let failed = 0;

    tests.forEach((test) => {
        const found = css.includes(test.selector) && css.includes(test.expected);

        if (found) {
            console.log(`✅ ${test.name}`);
            passed++;
        } else {
            console.log(`❌ ${test.name}`);
            console.log(`   Expected: ${test.expected}`);

            // Show what we found instead
            const selectorMatch = css.match(
                new RegExp(`${test.selector.replace(".", "\\.")}\\s*{[^}]+}`, "g"),
            );
            if (selectorMatch) {
                console.log(`   Found: ${selectorMatch[0].replace(/\s+/g, " ").trim()}`);
            } else {
                console.log(`   Selector ${test.selector} not found in CSS`);
            }
            failed++;
        }
    });

    console.log("\n📊 Test Results:");
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📈 Success Rate: ${Math.round((passed / tests.length) * 100)}%`);

    if (failed === 0) {
        console.log("\n🎉 All Tailwind v4 utilities are working correctly!");
        console.log("\n📋 Breaking Changes Summary:");
        console.log("   • shadow-sm → shadow-xs (for smallest shadow)");
        console.log("   • shadow → shadow-sm (default shadow is now smaller)");
        console.log("   • rounded-sm → rounded-xs (for smallest radius)");
        console.log("   • rounded → rounded-sm (default radius is now smaller)");
        console.log("   • outline-none → outline-hidden");
        console.log("   • ring → ring-3 (default ring width is now 3px)");

        return true;
    } else {
        console.log(
            "\n⚠️  Some utilities are not working correctly. Please check the configuration.",
        );
        return false;
    }
}

// Run the test
const success = testTailwindV4();
process.exit(success ? 0 : 1);
