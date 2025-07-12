import { expect, type Page } from '@playwright/test';

export class LoginPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // Locators
    get heading() {
        return this.page.getByRole('heading', { name: 'Welcome to VT!' });
    }

    get googleButton() {
        return this.page.getByRole('button', { name: 'Google' });
    }

    get githubButton() {
        return this.page.getByRole('button', { name: 'GitHub' });
    }

    get twitterButton() {
        return this.page.getByRole('button', { name: 'Twitter' });
    }

    // Actions
    async goto() {
        await this.page.goto('/login');
    }

    async clickGoogleLogin() {
        await this.googleButton.click();
    }

    async clickGithubLogin() {
        await this.githubButton.click();
    }

    async clickTwitterLogin() {
        await this.twitterButton.click();
    }

    // Assertions
    async expectToBeVisible() {
        await expect(this.heading).toBeVisible();
    }

    async expectGoogleButtonToBeVisible() {
        await expect(this.googleButton).toBeVisible();
    }

    async expectToRedirectToGoogle() {
        await this.page.waitForURL(/accounts\.google\.com/, { timeout: 5000 });
    }
}
