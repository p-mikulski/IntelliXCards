import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import { registerFormSchema } from "@/lib/validation/auth";
import type { z } from "zod";

type RegisterFormData = z.infer<typeof registerFormSchema>;

interface AuthErrorResponse {
  code: string;
  message: string;
  fields?: Record<string, string[]>;
}

export default function RegisterView() {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: RegisterFormData) {
    setIsLoading(true);
    setApiError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const responseData = (await response.json()) as AuthErrorResponse | { user: { id: string; email: string } };

      if (!response.ok) {
        const errorData = responseData as AuthErrorResponse;

        // Handle validation errors (422)
        if (response.status === 422 && errorData.fields) {
          Object.entries(errorData.fields).forEach(([field, messages]) => {
            form.setError(field as keyof RegisterFormData, {
              type: "manual",
              message: messages[0],
            });
          });
          toast.error("Sprawdz poprawnosc wprowadzonych danych.");
          return;
        }

        // Handle duplicate email (409)
        if (response.status === 409) {
          setApiError(errorData.message);
          return;
        }

        // Handle server errors (500)
        if (response.status === 500) {
          toast.error(errorData.message);
          return;
        }

        // Fallback for unexpected errors
        toast.error("Wystapil nieoczekiwany blad. Sprobuj ponownie.");
        return;
      }

      // Success - redirect to dashboard
      toast.success("Konto utworzone pomyslnie!");
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Nie mozna polaczyc sie z serwerem. Sprawdz polaczenie internetowe.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="mx-auto w-full max-w-lg space-y-6">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Create account</CardTitle>
            <CardDescription>Enter your details to create an account in IntelliXCards</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {apiError && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
                  {apiError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jan.kowalski@example.com"
                  aria-describedby={form.formState.errors.email ? "email-error" : undefined}
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p id="email-error" className="text-sm text-destructive" role="alert" aria-live="polite">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  aria-describedby={form.formState.errors.password ? "password-error" : undefined}
                  {...form.register("password")}
                />
                {form.formState.errors.password && (
                  <p id="password-error" className="text-sm text-destructive" role="alert" aria-live="polite">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  aria-describedby={form.formState.errors.confirmPassword ? "confirmPassword-error" : undefined}
                  {...form.register("confirmPassword")}
                />
                {form.formState.errors.confirmPassword && (
                  <p id="confirmPassword-error" className="text-sm text-destructive" role="alert" aria-live="polite">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <a href="/auth/login" className="underline hover:text-primary">
                  Sign in
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
