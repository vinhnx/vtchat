import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

/**
 * Interactive script to extract your real authentication cookies
 * This will open a browser where you can log in with your OAuth
 */
async function extractMyCookies() {
    const browser = await chromium.launch({
        headless: false,
        slowMo: 1000, // Slow down for better interaction
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto("http://localhost:3000");

    // Wait for user input
    await new Promise((resolve) => {
        process.stdin.resume();
        process.stdin.once("data", resolve);
    });

    // Extract all authentication data
    const storageState = await context.storageState();
    const allCookies = await context.cookies();

    // Filter for important cookies
    const authCookies = allCookies.filter(
        (cookie) =>
            cookie.name.includes("session") ||
            cookie.name.includes("auth") ||
            cookie.name.includes("csrf") ||
            cookie.name.includes("token") ||
            cookie.name.includes("better"),
    );

    // Save complete storage state (recommended)
    const authDir = path.join(__dirname, "playwright", ".auth");
    if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
    }

    const authFile = path.join(authDir, "my-real-session.json");
    fs.writeFileSync(authFile, JSON.stringify(storageState, null, 2));

    // Save just the auth cookies for manual use
    const cookieFile = path.join(authDir, "my-auth-cookies.json");
    fs.writeFileSync(cookieFile, JSON.stringify(authCookies, null, 2));

    await browser.close();
    process.exit(0);
}

extractMyCookies().catch(() => {});
