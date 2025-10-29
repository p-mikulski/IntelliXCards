import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginView from "./LoginView";

// Mock the toast notifications
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("LoginView Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location.href
    Object.defineProperty(window, "location", {
      writable: true,
      value: { href: "" },
    });
  });

  describe("Rendering", () => {
    it("should render login form with all required fields", () => {
      render(<LoginView />);

      expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it("should render link to registration page", () => {
      render(<LoginView />);

      const registerLink = screen.getByRole("link", { name: /sign up/i });
      expect(registerLink).toBeInTheDocument();
      expect(registerLink).toHaveAttribute("href", "/auth/register");
    });

    it("should render link to password recovery page", () => {
      render(<LoginView />);

      const recoveryLink = screen.getByRole("link", { name: /forgot your password\?/i });
      expect(recoveryLink).toBeInTheDocument();
      expect(recoveryLink).toHaveAttribute("href", "/auth/recovery");
    });
  });

  describe("Form Validation", () => {
    it("should show validation error for empty email", async () => {
      const user = userEvent.setup();
      render(<LoginView />);

      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await user.type(passwordInput, "somePassword");
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByRole("alert");
        expect(errorMessage).toHaveTextContent(/email address is required/i);
      });
    });

    it("should show validation error for empty password", async () => {
      const user = userEvent.setup();
      render(<LoginView />);

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await user.type(emailInput, "test@example.com");
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByRole("alert");
        expect(errorMessage).toHaveTextContent(/password is required/i);
      });
    });
  });

  describe("Form Submission - Success", () => {
    it("should successfully login with valid credentials", async () => {
      const user = userEvent.setup();

      // Mock successful API response
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          user: {
            id: "123",
            email: "test@example.com",
          },
        }),
      });

      render(<LoginView />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "Password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "test@example.com",
            password: "Password123",
          }),
        });
      });

      await waitFor(() => {
        expect(window.location.href).toBe("/dashboard");
      });
    });

    it("should disable form during submission", async () => {
      const user = userEvent.setup();

      // Mock API response with delay
      global.fetch = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                json: async () => ({
                  user: { id: "123", email: "test@example.com" },
                }),
              });
            }, 100);
          })
      );

      render(<LoginView />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "Password123");
      await user.click(submitButton);

      // Button should be disabled during submission
      expect(submitButton).toBeDisabled();

      await waitFor(() => {
        expect(window.location.href).toBe("/dashboard");
      });
    });
  });

  describe("Form Submission - Error Handling", () => {
    it("should display error message for invalid credentials (401)", async () => {
      const user = userEvent.setup();

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password.",
        }),
      });

      render(<LoginView />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "wrongPassword");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      });
    });

    it("should clear password field on authentication error", async () => {
      const user = userEvent.setup();

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password.",
        }),
      });

      render(<LoginView />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "wrongPassword");
      await user.click(submitButton);

      await waitFor(() => {
        expect(passwordInput.value).toBe("");
      });
    });

    it("should handle validation errors from server (422)", async () => {
      const user = userEvent.setup();

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        json: async () => ({
          code: "VALIDATION_ERROR",
          message: "Invalid input",
          fields: {
            email: ["Email address is required."],
          },
        }),
      });

      render(<LoginView />);

      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await user.type(passwordInput, "Password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email address is required/i)).toBeInTheDocument();
      });
    });

    it("should handle network errors gracefully", async () => {
      const user = userEvent.setup();
      const { toast } = await import("sonner");

      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      render(<LoginView />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "Password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/unable to connect to the server/i));
      });
    });

    it("should handle server errors (500)", async () => {
      const user = userEvent.setup();
      const { toast } = await import("sonner");

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({
          code: "SERVER_ERROR",
          message: "An unexpected error occurred.",
        }),
      });

      render(<LoginView />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "Password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper form labels associated with inputs", () => {
      render(<LoginView />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(emailInput).toHaveAttribute("type", "email");
      expect(passwordInput).toHaveAttribute("type", "password");
    });

    it("should be keyboard navigable", async () => {
      const user = userEvent.setup();
      render(<LoginView />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      // Tab through form elements
      await user.tab();
      expect(emailInput).toHaveFocus();

      await user.tab();
      expect(passwordInput).toHaveFocus();

      await user.tab();
      expect(submitButton).toHaveFocus();
    });
  });
});
