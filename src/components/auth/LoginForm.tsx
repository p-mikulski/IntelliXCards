import { useCallback, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginSchema } from "@/lib/validation/auth";
import type { AuthCredentials } from "@/types";

import { AuthFormHeader } from "./AuthFormHeader";
import { AuthStatusMessage } from "./AuthStatusMessage";

type FormStatus = { state: "idle"; message?: undefined } | { state: "info" | "success" | "error"; message: string };

interface LoginFormProps {
  defaultEmail?: string;
  onSubmit?: (values: AuthCredentials) => Promise<void> | void;
  onSuccess?: () => void;
  successMessage?: string;
  className?: string;
}

type LoginFormValues = LoginSchema;

export function LoginForm({ defaultEmail, onSubmit, onSuccess, successMessage, className }: LoginFormProps) {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    defaultValues: {
      email: defaultEmail ?? "",
      password: "",
    },
  });

  const [status, setStatus] = useState<FormStatus>({ state: "idle" });

  const handleSubmit = useCallback(
    async (values: LoginFormValues) => {
      if (!onSubmit) {
        setStatus({ state: "info", message: "Logowanie bedzie dostepne w kolejnym kroku." });
        return;
      }

      try {
        await onSubmit(values);
        setStatus({ state: "success", message: successMessage ?? "Logowanie zakonczone powodzeniem." });
        onSuccess?.();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Nie udalo sie zalogowac. Sprobuj ponownie pozniej.";
        setStatus({ state: "error", message });
        form.setValue("password", "");
      }
    },
    [form, onSubmit, onSuccess, successMessage]
  );

  const onFormSubmit = form.handleSubmit(handleSubmit);

  return (
    <div className={className}>
      <AuthFormHeader
        eyebrow="Witamy ponownie"
        title="Zaloguj sie"
        subtitle="Uzyskaj dostep do swojej tablicy projektow i kontynuuj nauke."
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
                  <Input {...field} type="password" placeholder="********" autoComplete="current-password" />
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
            {form.formState.isSubmitting ? "Logowanie..." : "Zaloguj sie"}
          </Button>
        </form>
      </Form>

      <p className="mt-6 text-center text-sm text-white/70">
        Nie masz jeszcze konta?{" "}
        <a className="font-medium text-white transition hover:text-white/90" href="/auth/register">
          Zarejestruj sie
        </a>
      </p>

      <p className="mt-3 text-center text-xs text-white/50">
        Zapomniales hasla?{" "}
        <a className="font-medium text-white/80 transition hover:text-white" href="/auth/recovery">
          Odzyskaj dostep
        </a>
      </p>
    </div>
  );
}
