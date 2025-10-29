import { z } from "zod";

const emailMessage = "Please provide a valid email address.";
const passwordMinLength = 8;
const passwordMaxLength = 64;

export const authEmailSchema = z
  .string({ required_error: "Email address is required." })
  .trim()
  .min(1, "Email address is required.")
  .max(254, "Email address is too long.")
  .email(emailMessage);

export const authPasswordSchema = z
  .string({ required_error: "Password is required." })
  .min(passwordMinLength, `Password must be at least ${passwordMinLength} characters long.`)
  .max(passwordMaxLength, `Password can be at most ${passwordMaxLength} characters long.`)
  .regex(/[a-zA-Z]/, "Password must contain at least one letter.")
  .regex(/\d/, "Password must contain at least one digit.");

export const registerSchema = z.object({
  email: authEmailSchema,
  password: authPasswordSchema,
});

export const registerFormSchema = registerSchema
  .extend({
    confirmPassword: z
      .string({ required_error: "Please confirm your password." })
      .min(passwordMinLength, "Please confirm your password."),
  })
  .superRefine((values, ctx) => {
    if (values.password !== values.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords must match.",
      });
    }
  });

export const loginSchema = z.object({
  email: authEmailSchema,
  password: z.string({ required_error: "Password is required." }).min(1, "Password is required."),
});

export const recoverySchema = z.object({
  email: authEmailSchema,
});

export type RegisterSchema = z.infer<typeof registerSchema>;
export type RegisterFormSchema = z.infer<typeof registerFormSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type RecoverySchema = z.infer<typeof recoverySchema>;
