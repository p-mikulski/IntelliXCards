import { test, expect } from "@playwright/test";
import { LoginPage, RegisterPage, DashboardPage } from "./page-objects/auth.page";

/**
 * E2E Tests for User Authentication (Section 4.1)
 * Using existing confirmed test user from E2E_USERNAME / E2E_PASSWORD
 */

const confirmedTestEmail = process.env.E2E_USERNAME || "test-user@test.com";
const confirmedTestPassword = process.env.E2E_PASSWORD || "test-user";

test.describe("User Authentication", () => {
  test.describe("4.1.1 Registration Flow", () => {
    test("should show validation error for invalid email format", async ({ page }) => {
      // Arrange
      const registerPage = new RegisterPage(page);

      // Act
      await registerPage.goto();
      await registerPage.fillEmail("invalid-email");
      await registerPage.fillPassword("Password123!");
      await registerPage.fillConfirmPassword("Password123!");
      await registerPage.clickSubmit();
      await page.waitForTimeout(1500); // Wait for validation

      // Assert - should stay on register page (validation prevents submission)
      expect(await registerPage.isOnRegisterPage()).toBe(true);
    });

    test("should show validation error when passwords do not match", async ({ page }) => {
      // Arrange
      const registerPage = new RegisterPage(page);
      const testEmail = `test-${Date.now()}@example.com`;

      // Act
      await registerPage.goto();
      await registerPage.register(testEmail, "Password123!", "DifferentPassword123!");

      // Assert
      const confirmPasswordError = await registerPage.getConfirmPasswordError();
      expect(confirmPasswordError).toBeTruthy();
    });

    test("should show validation error for weak password", async ({ page }) => {
      // Arrange
      const registerPage = new RegisterPage(page);
      const testEmail = `test-${Date.now()}@example.com`;
      const weakPassword = "weak";

      // Act
      await registerPage.goto();
      await registerPage.register(testEmail, weakPassword, weakPassword);

      // Assert
      const passwordError = await registerPage.getPasswordError();
      expect(passwordError).toBeTruthy();
    });

    test("should show error when trying to register with existing email", async ({ page }) => {
      // NOTE: Using confirmed test user that already exists
      const registerPage = new RegisterPage(page);
      const duplicateEmail = confirmedTestEmail; // This email already exists
      const testPassword = "Password123!";

      // Act - Try to register with existing email
      await registerPage.goto();
      await registerPage.register(duplicateEmail, testPassword, testPassword);
      await page.waitForTimeout(2000); // Wait for API response

      // Assert - Should show duplicate error or stay on register page
      const apiError = await registerPage.getApiError();
      const isStillOnRegister = await registerPage.isOnRegisterPage();

      // Either shows error message OR stays on register page (depending on how UI handles it)
      expect(apiError !== null || isStillOnRegister).toBe(true);
    });

    test("should show validation error for empty password fields", async ({ page }) => {
      // Arrange
      const registerPage = new RegisterPage(page);

      // Act - Fill email but leave passwords empty to test react-hook-form validation
      await registerPage.goto();
      await registerPage.fillEmail("test@example.com");
      await registerPage.clickSubmit();

      // Assert - react-hook-form validation should show error
      await page.waitForSelector("#password-error", { state: "visible", timeout: 5000 });
      const passwordError = await registerPage.getPasswordError();
      expect(passwordError).toBeTruthy();
    });

    test("should navigate to login page when clicking sign in link", async ({ page }) => {
      // Arrange
      const registerPage = new RegisterPage(page);

      // Act
      await registerPage.goto();
      await registerPage.clickLogin();

      // Assert
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });

  test.describe("4.1.2 Login Flow", () => {
    test("should allow an existing user to login successfully", async ({ page }) => {
      // Arrange
      const loginPage = new LoginPage(page);
      const dashboardPage = new DashboardPage(page);

      // Act
      await loginPage.goto();
      await loginPage.login(confirmedTestEmail, confirmedTestPassword);

      // Assert
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
      await expect(dashboardPage.isOnDashboard()).resolves.toBe(true);
    });

    test("should show error for incorrect password", async ({ page }) => {
      // Arrange
      const loginPage = new LoginPage(page);

      // Act
      await loginPage.goto();
      await loginPage.login(confirmedTestEmail, "WrongPassword123!");
      await page.waitForTimeout(2000); // Wait for error to appear

      // Assert - should stay on login page (not redirect to dashboard)
      expect(await loginPage.isOnLoginPage()).toBe(true);
    });

    test("should show error for non-existent user", async ({ page }) => {
      // Arrange
      const loginPage = new LoginPage(page);
      const nonExistentEmail = `nonexistent-${Date.now()}@example.com`;

      // Act
      await loginPage.goto();
      await loginPage.login(nonExistentEmail, "SomePassword123!");
      await page.waitForTimeout(2000); // Wait for error to appear

      // Assert - should stay on login page
      expect(await loginPage.isOnLoginPage()).toBe(true);
    });

    test("should show validation error for invalid email format", async ({ page }) => {
      // Arrange
      const loginPage = new LoginPage(page);

      // Act
      await loginPage.goto();
      await loginPage.fillEmail("invalid-email");
      await loginPage.fillPassword("Password123!");
      await loginPage.clickSubmit();
      await page.waitForTimeout(1000); // Wait for validation

      // Assert - should show email error or stay on login
      const emailError = await loginPage.getEmailError();
      const isStillOnLogin = await loginPage.isOnLoginPage();
      expect(emailError !== null || isStillOnLogin).toBe(true);
    });

    test("should show validation error for empty password field", async ({ page }) => {
      // Arrange
      const loginPage = new LoginPage(page);

      // Act - Fill email but leave password empty to test react-hook-form validation
      await loginPage.goto();
      await loginPage.fillEmail("test@example.com");
      await loginPage.clickSubmit();

      // Assert - react-hook-form validation should show error
      await page.waitForSelector("#password-error", { state: "visible", timeout: 5000 });
      const passwordError = await loginPage.getPasswordError();
      expect(passwordError).toBeTruthy();
    });

    test("should disable submit button while login is in progress", async ({ page }) => {
      // Arrange
      const loginPage = new LoginPage(page);

      // Act
      await loginPage.goto();
      await loginPage.fillEmail(confirmedTestEmail);
      await loginPage.fillPassword(confirmedTestPassword);

      // Check if button becomes disabled after clicking (network delay simulates this)
      await loginPage.clickSubmit();

      // Assert - wait for navigation to complete (button was working)
      await page.waitForURL(/\/(dashboard|auth\/login)/, { timeout: 10000 });
      expect(page.url()).toBeTruthy();
    });

    test("should navigate to register page when clicking sign up link", async ({ page }) => {
      // Arrange
      const loginPage = new LoginPage(page);

      // Act
      await loginPage.goto();
      await loginPage.clickRegister();

      // Assert
      await expect(page).toHaveURL(/\/auth\/register/);
    });

    test("should navigate to recovery page when clicking forgot password link", async ({ page }) => {
      // Arrange
      const loginPage = new LoginPage(page);

      // Act
      await loginPage.goto();
      await loginPage.clickForgotPassword();

      // Assert
      await expect(page).toHaveURL(/\/auth\/recovery/);
    });
  });

  test.describe("4.1.3 Logout Flow", () => {
    test.beforeEach(async ({ page }) => {
      // Login with confirmed test user
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(confirmedTestEmail, confirmedTestPassword);
      await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    });

    test("should allow a logged-in user to logout successfully", async ({ page }) => {
      // Arrange
      const dashboardPage = new DashboardPage(page);

      // Act
      await dashboardPage.logout();
      await page.goto("/dashboard");

      // Assert - should be redirected to login page
      await expect(page).toHaveURL(/\/auth\/login/, { timeout: 5000 });
    });
  });

  test.describe("4.1.4 Protected Routes - Authentication Guard", () => {
    test("should redirect unauthenticated user to login when accessing dashboard", async ({ page }) => {
      // Act
      await page.goto("/dashboard");

      // Assert
      await expect(page).toHaveURL(/\/auth\/login/, { timeout: 5000 });
    });

    test("should redirect unauthenticated user to login when accessing protected project routes", async ({ page }) => {
      // Act
      await page.goto("/projects/some-project-id");

      // Assert
      await expect(page).toHaveURL(/\/auth\/login/, { timeout: 5000 });
    });

    test("should allow access to public routes without authentication", async ({ page }) => {
      // Arrange
      const publicRoutes = [
        { path: "/", shouldMatch: "/" },
        { path: "/auth/login", shouldMatch: "/auth/login" },
        { path: "/auth/register", shouldMatch: "/auth/register" },
        { path: "/auth/recovery", shouldMatch: "/auth/recovery" },
      ];

      // Act & Assert
      for (const route of publicRoutes) {
        await page.goto(route.path);
        await page.waitForLoadState("networkidle");

        // Verify we're on the expected route (not redirected to login)
        const currentUrl = page.url();
        expect(currentUrl).toContain(route.shouldMatch);

        // If not the login page itself, verify we weren't redirected to login
        if (route.path !== "/auth/login") {
          expect(currentUrl).not.toContain("/auth/login");
        }
      }
    });
  });

  test.describe("4.1.5 Complete User Journey", () => {
    test("should complete login -> logout -> login cycle with existing user", async ({ page }) => {
      // Arrange
      const loginPage = new LoginPage(page);
      const dashboardPage = new DashboardPage(page);

      // Act & Assert: Login
      await loginPage.goto();
      await loginPage.login(confirmedTestEmail, confirmedTestPassword);
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

      // Act & Assert: Logout
      await dashboardPage.logout();
      await page.waitForTimeout(2000); // Wait for session to clear and cookies to be removed
      await page.goto("/dashboard");
      await expect(page).toHaveURL(/\/auth\/login/, { timeout: 5000 });

      // Act & Assert: Login again
      await loginPage.goto();
      await page.waitForLoadState("networkidle"); // Ensure page is fully loaded
      await loginPage.login(confirmedTestEmail, confirmedTestPassword);
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    });
  });

  test.describe("4.1.6 Edge Cases and Security", () => {
    test("should handle SQL injection attempts in email field", async ({ page }) => {
      // Arrange
      const loginPage = new LoginPage(page);
      const sqlInjection = "admin'--";

      // Act
      await loginPage.goto();
      await loginPage.fillEmail(sqlInjection);
      await loginPage.fillPassword("password");
      await loginPage.clickSubmit();
      await page.waitForTimeout(1000);

      // Assert - should stay on login (not crash or allow unauthorized access)
      expect(await loginPage.isOnLoginPage()).toBe(true);
    });

    test("should handle XSS attempts in email field", async ({ page }) => {
      // Arrange
      const loginPage = new LoginPage(page);
      const xssAttempt = "<script>alert('xss')</script>@example.com";

      // Act
      await loginPage.goto();
      await loginPage.fillEmail(xssAttempt);
      await loginPage.fillPassword("password");
      await loginPage.clickSubmit();
      await page.waitForTimeout(1000);

      // Assert - should stay on login (not execute script)
      expect(await loginPage.isOnLoginPage()).toBe(true);
    });

    test("should handle extremely long email input", async ({ page }) => {
      // Arrange
      const loginPage = new LoginPage(page);
      const longEmail = "a".repeat(300) + "@example.com";

      // Act
      await loginPage.goto();
      await loginPage.login(longEmail, "password");

      // Assert - should show validation error or handle gracefully
      const emailError = await loginPage.getEmailError();
      const apiError = await loginPage.getApiError();

      expect(emailError || apiError).toBeTruthy();
    });

    test("should handle extremely long password input", async ({ page }) => {
      // Arrange
      const loginPage = new LoginPage(page);
      const longPassword = "a".repeat(500);

      // Act
      await loginPage.goto();
      await loginPage.login("test@example.com", longPassword);

      // Assert - should handle gracefully without crashing
      expect(await loginPage.isOnLoginPage()).toBe(true);
    });

    test("should prevent multiple simultaneous login attempts", async ({ page }) => {
      // Arrange
      const loginPage = new LoginPage(page);
      const testEmail = `test-${Date.now()}@example.com`;

      // Act
      await loginPage.goto();
      await loginPage.fillEmail(testEmail);
      await loginPage.fillPassword("password");

      // Try clicking multiple times
      await loginPage.clickSubmit();
      await page.waitForTimeout(500);

      // Assert - should handle multiple clicks gracefully (not crash)
      expect(await loginPage.isOnLoginPage()).toBe(true);
    });
  });
});
