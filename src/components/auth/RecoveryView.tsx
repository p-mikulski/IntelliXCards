import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { z } from "zod";

const recoverySchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

type RecoveryFormData = z.infer<typeof recoverySchema>;

export default function RecoveryView() {
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const form = useForm<RecoveryFormData>({
    resolver: zodResolver(recoverySchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: RecoveryFormData) {
    setIsLoading(true);
    try {
      // TODO: Implement password recovery
      void data;
      setIsEmailSent(true);
    } catch (error) {
      void error;
    } finally {
      setIsLoading(false);
    }
  }

  if (isEmailSent) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="mx-auto w-md max-w-lg space-y-6">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Check your email</CardTitle>
              <CardDescription>We&apos;ve sent password reset instructions to your email address.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => setIsEmailSent(false)}>
                Send again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm space-y-6 p-6">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Recover password</CardTitle>
          <CardDescription>
            Enter your email address and we&apos;ll send you password reset instructions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="jan.kowalski@example.com" {...form.register("email")} />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send instructions"}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center">
            <a href="/auth/login" className="text-sm text-muted-foreground underline hover:text-primary">
              Back to sign in
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
