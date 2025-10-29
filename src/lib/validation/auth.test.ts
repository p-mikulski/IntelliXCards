import { describe, it, expect } from "vitest";
import {
  authEmailSchema,
  authPasswordSchema,
  registerSchema,
  registerFormSchema,
  loginSchema,
  recoverySchema,
} from "./auth";

describe("Auth Validation Schemas", () => {
  describe("authEmailSchema", () => {
    it("should accept valid email addresses", () => {
      const validEmails = ["test@example.com", "user.name@domain.co.uk", "user+tag@example.com"];

      validEmails.forEach((email) => {
        const result = authEmailSchema.safeParse(email);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid email formats", () => {
      const invalidEmails = ["", "notanemail", "@example.com", "user@", "user @example.com"];

      invalidEmails.forEach((email) => {
        const result = authEmailSchema.safeParse(email);
        expect(result.success).toBe(false);
      });
    });

    it("should trim whitespace from email", () => {
      const result = authEmailSchema.safeParse("  test@example.com  ");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("test@example.com");
      }
    });

    it("should reject email addresses longer than 254 characters", () => {
      const longEmail = "a".repeat(250) + "@test.com";
      const result = authEmailSchema.safeParse(longEmail);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Email address is too long.");
      }
    });

    it("should require email to be provided", () => {
      const result = authEmailSchema.safeParse(undefined);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Email address is required.");
      }
    });
  });

  describe("authPasswordSchema", () => {
    it("should accept valid passwords with letters and digits", () => {
      const validPasswords = ["Password1", "StrongPass123", "MyP@ssw0rd", "abcDEF123"];

      validPasswords.forEach((password) => {
        const result = authPasswordSchema.safeParse(password);
        expect(result.success).toBe(true);
      });
    });

    it("should reject passwords shorter than 8 characters", () => {
      const result = authPasswordSchema.safeParse("Pass1");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain("at least 8 characters");
      }
    });

    it("should reject passwords longer than 64 characters", () => {
      const longPassword = "Password1" + "a".repeat(60);
      const result = authPasswordSchema.safeParse(longPassword);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain("at most 64 characters");
      }
    });

    it("should reject passwords without letters", () => {
      const result = authPasswordSchema.safeParse("12345678");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some((e) => e.message.includes("letter"))).toBe(true);
      }
    });

    it("should reject passwords without digits", () => {
      const result = authPasswordSchema.safeParse("Password");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some((e) => e.message.includes("digit"))).toBe(true);
      }
    });

    it("should require password to be provided", () => {
      const result = authPasswordSchema.safeParse(undefined);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Password is required.");
      }
    });
  });

  describe("registerSchema", () => {
    it("should accept valid registration data", () => {
      const validData = {
        email: "test@example.com",
        password: "Password123",
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email in registration", () => {
      const invalidData = {
        email: "invalid-email",
        password: "Password123",
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject invalid password in registration", () => {
      const invalidData = {
        email: "test@example.com",
        password: "weak",
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("registerFormSchema", () => {
    it("should accept valid registration form data with matching passwords", () => {
      const validData = {
        email: "test@example.com",
        password: "Password123",
        confirmPassword: "Password123",
      };

      const result = registerFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject when passwords do not match", () => {
      const invalidData = {
        email: "test@example.com",
        password: "Password123",
        confirmPassword: "DifferentPass123",
      };

      const result = registerFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const confirmPasswordError = result.error.errors.find((e) => e.path.includes("confirmPassword"));
        expect(confirmPasswordError?.message).toBe("Passwords must match.");
      }
    });

    it("should require confirmPassword field", () => {
      const invalidData = {
        email: "test@example.com",
        password: "Password123",
      };

      const result = registerFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject confirmPassword shorter than 8 characters", () => {
      const invalidData = {
        email: "test@example.com",
        password: "Password123",
        confirmPassword: "Pass1",
      };

      const result = registerFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some((e) => e.message.includes("confirm your password"))).toBe(true);
      }
    });
  });

  describe("loginSchema", () => {
    it("should accept valid login data", () => {
      const validData = {
        email: "test@example.com",
        password: "anyPassword",
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email in login", () => {
      const invalidData = {
        email: "not-an-email",
        password: "anyPassword",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject empty password in login", () => {
      const invalidData = {
        email: "test@example.com",
        password: "",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Password is required.");
      }
    });

    it("should not validate password strength on login (only required)", () => {
      const validData = {
        email: "test@example.com",
        password: "weak", // Weak password is accepted on login
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("recoverySchema", () => {
    it("should accept valid email for recovery", () => {
      const validData = {
        email: "test@example.com",
      };

      const result = recoverySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email for recovery", () => {
      const invalidData = {
        email: "invalid-email",
      };

      const result = recoverySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should require email field", () => {
      const invalidData = {};

      const result = recoverySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
