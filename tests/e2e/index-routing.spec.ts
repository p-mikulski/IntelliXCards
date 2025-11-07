import { test, expect } from "@playwright/test";

test.describe("Index Page Routing", () => {
  test("should redirect unauthenticated users to /welcome", async ({ page }) => {
    await page.goto("/");

    // Should be redirected to welcome page
    await expect(page).toHaveURL("/welcome");
    await expect(page).toHaveTitle(/IntelliXCards/i);
  });

  test("should redirect authenticated users to /dashboard", async ({ page }) => {
    // This test requires authentication setup from global-setup.ts
    // Using stored auth state
    await page.goto("/");

    // Should be redirected to dashboard
    await expect(page).toHaveURL("/dashboard");
  });
});
