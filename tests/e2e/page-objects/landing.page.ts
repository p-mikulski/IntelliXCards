import { type Page } from "@playwright/test";

/**
 * Example Page Object Model for the Landing Page
 */
export class LandingPage {
  constructor(public readonly page: Page) {}

  async goto() {
    await this.page.goto("/");
  }

  async getTitle() {
    return await this.page.title();
  }

  async clickGetStarted() {
    await this.page.getByRole("link", { name: /get started/i }).click();
  }
}
