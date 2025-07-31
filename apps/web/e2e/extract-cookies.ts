import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

/**
 * Script to extract cookies from your current browser session
 * Run this after manually logging in to get your auth cookies
 */
async function extractCookies() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto("http://localhost:3000");

    // Wait for user input
    process.stdin.setRawMode(true);
    process.stdin.resume();
    await new Promise((resolve) => process.stdin.once("data", resolve));
    process.stdin.setRawMode(false);
    process.stdin.pause();

    const storageState = await context.storageState();

    // Save to auth file
    const authDir = path.join(__dirname, "playwright", ".auth");
    if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
    }

    const authFile = path.join(authDir, "manual-user.json");
    fs.writeFileSync(authFile, JSON.stringify(storageState, null, 2));

    await browser.close();
}

extractCookies();
