import { useCallback, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { registerFormSchema, type RegisterFormSchema } from "@/lib/validation/auth";
import type { AuthCredentials } from "@/types";

import { AuthFormHeader } from "./AuthFormHeader";
import { AuthStatusMessage } from "./AuthStatusMessage";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";

type FormStatus = { state: "idle"; message?: undefined } | { state: "info" | "success" | "error"; message: string };

interface RegisterFormProps {
  onSubmit?: (values: AuthCredentials) => Promise<void> | void;
  onSuccess?: () => void;
  successMessage?: string;
  className?: string;
}

type RegisterFormValues = RegisterFormSchema;

export function RegisterForm({ onSubmit, onSuccess, successMessage, className }: RegisterFormProps) {
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    mode: "onSubmit",
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [status, setStatus] = useState<FormStatus>({ state: "idle" });

  const handleSubmit = useCallback(
    async (values: RegisterFormValues) => {
      if (!onSubmit) {
        setStatus({ state: "info", message: "Rejestracja bedzie dostepna w kolejnym kroku." });
        return;
      }

      try {
        const payload: AuthCredentials = { email: values.email, password: values.password };
        await onSubmit(payload);
        setStatus({ state: "success", message: successMessage ?? "Konto zostalo utworzone." });
        onSuccess?.();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Nie udalo sie utworzyc konta. Sprobuj ponownie.";
        setStatus({ state: "error", message });
      }
    },
    [onSubmit, onSuccess, successMessage]
  );

  const onFormSubmit = form.handleSubmit(handleSubmit);
  const passwordValue = form.watch("password");
  const passwordHint = useMemo(() => (passwordValue ? undefined : "Haslo musi miec 8-64 znaki."), [passwordValue]);

  return (
    <div className={className}>
      <AuthFormHeader
        eyebrow="Dolacz do IntelliXCards"
        title="Utworz konto"
        subtitle="Zarejestruj sie, aby tworzyc projekty i budowac swoje talie fiszek."
      />

      {status.state !== "idle" ? (
        <AuthStatusMessage variant={status.state === "error" ? "error" : status.state}>
          {status.message}
        </AuthStatusMessage>
      ) : null}

      <Form {...form}>
        <form onSubmit={onFormSubmit} noValidate className="mt-8 space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adres email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="jan.kowalski@example.com" autoComplete="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Haslo</FormLabel>
                <FormControl>
                  <Input {...field} type="password" placeholder="********" autoComplete="new-password" />
                </FormControl>
                {passwordHint ? <FormDescription>{passwordHint}</FormDescription> : null}
                <PasswordStrengthMeter password={field.value} className="mt-3" />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Potwierdz haslo</FormLabel>
                <FormControl>
                  <Input {...field} type="password" placeholder="********" autoComplete="new-password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
            aria-busy={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Trwa zakladanie konta..." : "Zarejestruj sie"}
          </Button>
        </form>
      </Form>

      <p className="mt-6 text-center text-sm text-white/70">
        Masz juz konto?{" "}
        <a className="font-medium text-white transition hover:text-white/90" href="/auth/login">
          Zaloguj sie
        </a>
      </p>

      <p className="mt-3 text-center text-xs text-white/50">
        Tworzac konto, akceptujesz{" "}
        <a className="font-medium text-white/80 transition hover:text-white" href="#terms">
          regulamin platformy
        </a>
        .
      </p>
    </div>
  );
}
