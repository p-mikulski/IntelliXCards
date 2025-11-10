import { type Page, type Locator } from "@playwright/test";

/**
 * Base class for authentication pages
 */
abstract class AuthBasePage {
  protected readonly apiErrorAlert: Locator;

  constructor(public readonly page: Page) {
    this.apiErrorAlert = page.locator('[role="alert"]').first();
  }

  async getApiError(): Promise<string | null> {
    if (await this.apiErrorAlert.isVisible()) {
      return await this.apiErrorAlert.textContent();
    }
    return null;
  }
}

/**
 * Page Object Model for Login Page
 */
export class LoginPage extends AuthBasePage {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly submitButton: Locator;
  private readonly forgotPasswordLink: Locator;
  private readonly registerLink: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByLabel(/email/i);
    this.passwordInput = page.getByLabel(/^password$/i);
    this.submitButton = page.getByRole("button", { name: /sign in/i });
    this.forgotPasswordLink = page.getByRole("link", { name: /forgot/i });
    this.registerLink = page.getByRole("link", { name: /sign up/i });
  }

  async goto() {
    await this.page.goto("/auth/login");
    // Wait for React to hydrate
    await this.page.waitForLoadState("networkidle");
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async clickSubmit() {
    await this.submitButton.click();
  }

  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    // Wait for navigation after clicking submit - the JS redirects to dashboard on success
    await Promise.all([this.page.waitForURL(/\/(dashboard|auth\/login)/, { timeout: 10000 }), this.clickSubmit()]);
  }

  async getEmailError(): Promise<string | null> {
    const errorElement = this.page.locator("#email-error");
    if (await errorElement.isVisible()) {
      return await errorElement.textContent();
    }
    return null;
  }

  async getPasswordError(): Promise<string | null> {
    const errorElement = this.page.locator("#password-error");
    if (await errorElement.isVisible()) {
      return await errorElement.textContent();
    }
    return null;
  }

  async clickForgotPassword() {
    await this.forgotPasswordLink.click();
  }

  async clickRegister() {
    await this.registerLink.click();
  }

  async waitForLoadingState() {
    await this.page.waitForFunction(
      () => {
        const button = document.querySelector('button[type="submit"]');
        return button?.textContent?.includes("Signing in");
      },
      { timeout: 2000 }
    );
  }

  async isSubmitButtonDisabled(): Promise<boolean> {
    return await this.submitButton.isDisabled();
  }

  async isOnLoginPage(): Promise<boolean> {
    return this.page.url().includes("/auth/login");
  }
}

/**
 * Page Object Model for Register Page
 */
export class RegisterPage extends AuthBasePage {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly confirmPasswordInput: Locator;
  private readonly submitButton: Locator;
  private readonly loginLink: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByLabel(/^email$/i);
    this.passwordInput = page.getByLabel(/^password$/i);
    this.confirmPasswordInput = page.getByLabel(/confirm password/i);
    this.submitButton = page.getByRole("button", { name: /create account/i });
    this.loginLink = page.getByRole("link", { name: /sign in/i });
  }

  async goto() {
    await this.page.goto("/auth/register");
    // Wait for React to hydrate
    await this.page.waitForLoadState("networkidle");
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async fillConfirmPassword(password: string) {
    await this.confirmPasswordInput.fill(password);
  }

  async clickSubmit() {
    await this.submitButton.click();
  }

  async register(email: string, password: string, confirmPassword: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.fillConfirmPassword(confirmPassword);
    await this.clickSubmit();
  }

  async getEmailError(): Promise<string | null> {
    const errorElement = this.page.locator("#email-error");
    if (await errorElement.isVisible()) {
      return await errorElement.textContent();
    }
    return null;
  }

  async getPasswordError(): Promise<string | null> {
    const errorElement = this.page.locator("#password-error");
    if (await errorElement.isVisible()) {
      return await errorElement.textContent();
    }
    return null;
  }

  async getConfirmPasswordError(): Promise<string | null> {
    const errorElement = this.page.locator("#confirmPassword-error");
    if (await errorElement.isVisible()) {
      return await errorElement.textContent();
    }
    return null;
  }

  async clickLogin() {
    await this.loginLink.click();
  }

  async isOnRegisterPage(): Promise<boolean> {
    return this.page.url().includes("/auth/register");
  }
}

/**
 * Page Object Model for Dashboard Page
 */
export class DashboardPage {
  constructor(public readonly page: Page) {}

  async goto() {
    await this.page.goto("/dashboard");
  }

  async isOnDashboard(): Promise<boolean> {
    return this.page.url().includes("/dashboard");
  }

  async waitForLoad() {
    await this.page.waitForLoadState("networkidle");
  }

  async logout() {
    // Mock logout by calling the API directly
    await this.page.evaluate(async () => {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
    });
  }
}
