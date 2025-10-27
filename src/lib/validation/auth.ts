import { z } from "zod";

const emailMessage = "Podaj poprawny adres email.";
const passwordMinLength = 8;
const passwordMaxLength = 64;

export const authEmailSchema = z
  .string({ required_error: "Adres email jest wymagany." })
  .trim()
  .min(1, "Adres email jest wymagany.")
  .max(254, "Adres email jest zbyt dlugi.")
  .email(emailMessage);

export const authPasswordSchema = z
  .string({ required_error: "Haslo jest wymagane." })
  .min(passwordMinLength, `Haslo musi miec co najmniej ${passwordMinLength} znakow.`)
  .max(passwordMaxLength, `Haslo moze miec maksymalnie ${passwordMaxLength} znakow.`)
  .regex(/[a-zA-Z]/, "Haslo musi zawierac co najmniej jedna litere.")
  .regex(/\d/, "Haslo musi zawierac co najmniej jedna cyfre.");

export const registerSchema = z.object({
  email: authEmailSchema,
  password: authPasswordSchema,
});

export const registerFormSchema = registerSchema
  .extend({
    confirmPassword: z.string({ required_error: "Potwierdz haslo." }).min(passwordMinLength, "Potwierdz haslo."),
  })
  .superRefine((values, ctx) => {
    if (values.password !== values.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Hasla musza byc identyczne.",
      });
    }
  });

export const loginSchema = z.object({
  email: authEmailSchema,
  password: z.string({ required_error: "Haslo jest wymagane." }).min(1, "Haslo jest wymagane."),
});

export const recoverySchema = z.object({
  email: authEmailSchema,
});

export type RegisterSchema = z.infer<typeof registerSchema>;
export type RegisterFormSchema = z.infer<typeof registerFormSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type RecoverySchema = z.infer<typeof recoverySchema>;
