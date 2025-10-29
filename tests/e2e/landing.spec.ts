import { test, expect } from "@playwright/test";
import { LandingPage } from "./page-objects/landing.page";

test.describe("Landing Page", () => {
  test("should load successfully", async ({ page }) => {
    const landingPage = new LandingPage(page);
    await landingPage.goto();

    await expect(page).toHaveTitle(/10x/i);
  });

  test("should have main heading", async ({ page }) => {
    await page.goto("/");

    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
  });
});
