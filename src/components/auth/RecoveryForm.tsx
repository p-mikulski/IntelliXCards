import { useCallback, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { recoverySchema, type RecoverySchema } from "@/lib/validation/auth";
import type { AuthRecoveryCommand } from "@/types";

import { AuthFormHeader } from "./AuthFormHeader";
import { AuthStatusMessage } from "./AuthStatusMessage";

type FormStatus = { state: "idle"; message?: undefined } | { state: "info" | "success" | "error"; message: string };

interface RecoveryFormProps {
  onSubmit?: (payload: AuthRecoveryCommand) => Promise<void> | void;
  onSuccess?: () => void;
  successMessage?: string;
  className?: string;
}

type RecoveryFormValues = RecoverySchema;

export function RecoveryForm({ onSubmit, onSuccess, successMessage, className }: RecoveryFormProps) {
  const form = useForm<RecoveryFormValues>({
    resolver: zodResolver(recoverySchema),
    mode: "onSubmit",
    defaultValues: {
      email: "",
    },
  });

  const [status, setStatus] = useState<FormStatus>({ state: "idle" });

  const handleSubmit = useCallback(
    async (values: RecoveryFormValues) => {
      if (!onSubmit) {
        setStatus({ state: "info", message: "Instrukcje resetowania hasla beda dostepne w nastepnym etapie." });
        return;
      }

      try {
        await onSubmit(values);
        setStatus({
          state: "success",
          message: successMessage ?? "Jesli konto istnieje, przeslalismy instrukcje resetu.",
        });
        form.reset();
        onSuccess?.();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Nie udalo sie wyslac wiadomosci. Sprobuj ponownie.";
        setStatus({ state: "error", message });
      }
    },
    [form, onSubmit, onSuccess, successMessage]
  );

  const onFormSubmit = form.handleSubmit(handleSubmit);

  return (
    <div className={className}>
      <AuthFormHeader
        eyebrow="Odzyskiwanie dostepu"
        title="Zresetuj haslo"
        subtitle="Podaj adres email, a wyslemy instrukcje ustawienia nowego hasla."
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

          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
            aria-busy={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Wysylamy instrukcje..." : "Przyslij link resetujacy"}
          </Button>
        </form>
      </Form>

      <p className="mt-6 text-center text-sm text-white/70">
        Wroc do{" "}
        <a className="font-medium text-white transition hover:text-white/90" href="/auth/login">
          logowania
        </a>
        .
      </p>
    </div>
  );
}
