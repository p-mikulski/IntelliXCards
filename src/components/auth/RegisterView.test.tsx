import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterView from "./RegisterView";

// Mock the toast notifications
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("RegisterView Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location.href
    Object.defineProperty(window, "location", {
      writable: true,
      value: { href: "" },
    });
  });

  describe("Rendering", () => {
    it("should render registration form with all required fields", () => {
      render(<RegisterView />);

      expect(screen.getByText(/create an account/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
    });

    it("should render link to login page", () => {
      render(<RegisterView />);

      const loginLink = screen.getByRole("link", { name: /sign in/i });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute("href", "/auth/login");
    });
  });

  describe("Form Validation", () => {
    it("should show validation error for weak password", async () => {
      const user = userEvent.setup();
      render(<RegisterView />);

      const emailInput = screen.getByLabelText(/^email$/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole("button", { name: /create account/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "weak");
      await user.click(submitButton);

      await waitFor(() => {
        const alerts = screen.getAllByRole("alert");
        const passwordError = alerts.find((alert) => alert.textContent?.match(/at least 8 characters/i));
        expect(passwordError).toBeDefined();
      });
    });

    it("should show validation error for password without letters", async () => {
      const user = userEvent.setup();
      render(<RegisterView />);

      const emailInput = screen.getByLabelText(/^email$/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole("button", { name: /create account/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "12345678");
      await user.click(submitButton);

      await waitFor(() => {
        const alerts = screen.getAllByRole("alert");
        const passwordError = alerts.find((alert) => alert.textContent?.match(/at least one letter/i));
        expect(passwordError).toBeDefined();
      });
    });

    it("should show validation error for password without digits", async () => {
      const user = userEvent.setup();
      render(<RegisterView />);

      const emailInput = screen.getByLabelText(/^email$/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole("button", { name: /create account/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "PasswordOnly");
      await user.click(submitButton);

      await waitFor(() => {
        const alerts = screen.getAllByRole("alert");
        const passwordError = alerts.find((alert) => alert.textContent?.match(/at least one digit/i));
        expect(passwordError).toBeDefined();
      });
    });

    it("should show validation error when passwords do not match", async () => {
      const user = userEvent.setup();
      render(<RegisterView />);

      const emailInput = screen.getByLabelText(/^email$/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole("button", { name: /create account/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "Password123");
      await user.type(confirmPasswordInput, "DifferentPass123");
      await user.click(submitButton);

      await waitFor(() => {
        const alerts = screen.getAllByRole("alert");
        const confirmError = alerts.find((alert) => alert.textContent?.match(/passwords must match/i));
        expect(confirmError).toBeDefined();
      });
    });

    it("should show validation error for empty confirm password", async () => {
      const user = userEvent.setup();
      render(<RegisterView />);

      const emailInput = screen.getByLabelText(/^email$/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole("button", { name: /create account/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "Password123");
      await user.click(submitButton);

      await waitFor(() => {
        const alerts = screen.getAllByRole("alert");
        const confirmError = alerts.find((alert) => alert.textContent?.match(/confirm your password/i));
        expect(confirmError).toBeDefined();
      });
    });
  });

  describe("Form Submission - Success", () => {
    it("should successfully register with valid data", async () => {
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

      render(<RegisterView />);

      const emailInput = screen.getByLabelText(/^email$/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole("button", { name: /create account/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "Password123");
      await user.type(confirmPasswordInput, "Password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/auth/register", {
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

    it("should not send confirmPassword to API", async () => {
      const user = userEvent.setup();

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          user: { id: "123", email: "test@example.com" },
        }),
      });

      render(<RegisterView />);

      const emailInput = screen.getByLabelText(/^email$/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole("button", { name: /create account/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "Password123");
      await user.type(confirmPasswordInput, "Password123");
      await user.click(submitButton);

      await waitFor(() => {
        const callBody = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
        expect(callBody).not.toHaveProperty("confirmPassword");
        expect(callBody).toEqual({
          email: "test@example.com",
          password: "Password123",
        });
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

      render(<RegisterView />);

      const emailInput = screen.getByLabelText(/^email$/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole("button", { name: /create account/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "Password123");
      await user.type(confirmPasswordInput, "Password123");
      await user.click(submitButton);

      // Button should be disabled during submission
      expect(submitButton).toBeDisabled();

      await waitFor(() => {
        expect(window.location.href).toBe("/dashboard");
      });
    });
  });

  describe("Form Submission - Error Handling", () => {
    it("should display error message for duplicate email (409)", async () => {
      const user = userEvent.setup();

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        json: async () => ({
          code: "DUPLICATE_EMAIL",
          message: "Konto z tym adresem email juz istnieje.",
        }),
      });

      render(<RegisterView />);

      const emailInput = screen.getByLabelText(/^email$/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole("button", { name: /create account/i });

      await user.type(emailInput, "existing@example.com");
      await user.type(passwordInput, "Password123");
      await user.type(confirmPasswordInput, "Password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/konto z tym adresem email juz istnieje/i)).toBeInTheDocument();
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
            password: ["Password must be at least 8 characters long."],
          },
        }),
      });

      render(<RegisterView />);

      const emailInput = screen.getByLabelText(/^email$/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole("button", { name: /create account/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "Pass1");
      await user.type(confirmPasswordInput, "Pass1");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
      });
    });

    it("should handle network errors gracefully", async () => {
      const user = userEvent.setup();
      const { toast } = await import("sonner");

      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      render(<RegisterView />);

      const emailInput = screen.getByLabelText(/^email$/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole("button", { name: /create account/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "Password123");
      await user.type(confirmPasswordInput, "Password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/nie mozna polaczyc sie z serwerem/i));
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
          message: "Wystapil nieoczekiwany blad.",
        }),
      });

      render(<RegisterView />);

      const emailInput = screen.getByLabelText(/^email$/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole("button", { name: /create account/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "Password123");
      await user.type(confirmPasswordInput, "Password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper form labels associated with inputs", () => {
      render(<RegisterView />);

      const emailInput = screen.getByLabelText(/^email$/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      expect(emailInput).toHaveAttribute("type", "email");
      expect(passwordInput).toHaveAttribute("type", "password");
      expect(confirmPasswordInput).toHaveAttribute("type", "password");
    });

    it("should be keyboard navigable", async () => {
      const user = userEvent.setup();
      render(<RegisterView />);

      const emailInput = screen.getByLabelText(/^email$/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole("button", { name: /create account/i });

      // Tab through form elements
      await user.tab();
      expect(emailInput).toHaveFocus();

      await user.tab();
      expect(passwordInput).toHaveFocus();

      await user.tab();
      expect(confirmPasswordInput).toHaveFocus();

      await user.tab();
      expect(submitButton).toHaveFocus();
    });
  });
});
