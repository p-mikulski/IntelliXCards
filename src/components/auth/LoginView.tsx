import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import { loginSchema } from "@/lib/validation/auth";
import type { z } from "zod";

type LoginFormData = z.infer<typeof loginSchema>;

interface AuthErrorResponse {
  code: string;
  message: string;
  fields?: Record<string, string[]>;
}

export default function LoginView() {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true);
    setApiError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = (await response.json()) as AuthErrorResponse | { user: { id: string; email: string } };

      if (!response.ok) {
        const errorData = responseData as AuthErrorResponse;

        // Handle validation errors (422)
        if (response.status === 422 && errorData.fields) {
          Object.entries(errorData.fields).forEach(([field, messages]) => {
            form.setError(field as keyof LoginFormData, {
              type: "manual",
              message: messages[0],
            });
          });
          toast.error("Please check the entered data.");
          return;
        }

        // Handle authentication errors (401)
        if (response.status === 401) {
          setApiError(errorData.message);
          form.setValue("password", "");
          return;
        }

        // Handle server errors (500)
        if (response.status === 500) {
          toast.error(errorData.message);
          return;
        }

        // Fallback for unexpected errors
        toast.error("An unexpected error occurred. Please try again.");
        return;
      }

      // Success - redirect to dashboard
      toast.success("Logged in successfully!");
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Unable to connect to the server. Please check your internet connection.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="mx-auto w-full max-w-lg space-y-6">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Sign in</CardTitle>
            <CardDescription>Enter your credentials to sign in to IntelliXCards</CardDescription>
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
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              <a href="/auth/recovery" className="text-sm text-muted-foreground underline hover:text-primary">
                Forgot your password?
              </a>
              <p className="mt-2 text-sm text-muted-foreground">
                Don&apos;t have an account yet?{" "}
                <a href="/auth/register" className="underline hover:text-primary">
                  Sign up
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
