import { test, expect } from "@playwright/test";
import { LandingPage } from "./page-objects/landing.page";

test.describe("Landing Page", () => {
  test("should load successfully", async ({ page }) => {
    const landingPage = new LandingPage(page);
    await landingPage.goto();

    await expect(page).toHaveTitle(/IntelliXCards/i);
  });

  test("should have main heading", async ({ page }) => {
    await page.goto("/welcome");

    // Check for any heading (the landing page has h2, not h1)
    const heading = page.getByRole("heading").first();
    await expect(heading).toBeVisible();
  });
});
