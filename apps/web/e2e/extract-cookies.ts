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

    console.log("🌐 Opening VT Chat...");
    await page.goto("http://localhost:3000");

    console.log("📝 Please manually log in through OAuth in the opened browser window...");
    console.log("⏳ After login, press any key in this terminal to continue...");

    // Wait for user input
    process.stdin.setRawMode(true);
    process.stdin.resume();
    await new Promise((resolve) => process.stdin.once("data", resolve));
    process.stdin.setRawMode(false);
    process.stdin.pause();

    // Extract cookies
    const cookies = await context.cookies();
    const storageState = await context.storageState();

    // Save to auth file
    const authDir = path.join(__dirname, "playwright", ".auth");
    if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
    }

    const authFile = path.join(authDir, "manual-user.json");
    fs.writeFileSync(authFile, JSON.stringify(storageState, null, 2));

    console.log("✅ Cookies extracted and saved to:", authFile);
    console.log("🍪 Found cookies:", cookies.map((c) => c.name).join(", "));

    await browser.close();
}

extractCookies().catch(console.error);
