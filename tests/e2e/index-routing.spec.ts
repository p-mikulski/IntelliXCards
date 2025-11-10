import { test, expect } from "@playwright/test";
import { LoginPage } from "./page-objects/auth.page";

const confirmedTestEmail = process.env.E2E_USERNAME || "test-playwright@example.com";
const confirmedTestPassword = process.env.E2E_PASSWORD || "TestPassword123!";

test.describe("Index Page Routing", () => {
  test("should redirect unauthenticated users to /welcome", async ({ page }) => {
    await page.goto("/");

    // Should be redirected to welcome page
    await expect(page).toHaveURL("/welcome");
    await expect(page).toHaveTitle(/IntelliXCards/i);
  });

  test("should redirect authenticated users to /dashboard", async ({ page }) => {
    // First, log in to establish authenticated session
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(confirmedTestEmail, confirmedTestPassword);

    // Wait for dashboard to load after login
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // Now test the redirect: visiting / should redirect to dashboard
    await page.goto("/");

    // Should be redirected to dashboard since user is authenticated
    await expect(page).toHaveURL("/dashboard");
  });
});
