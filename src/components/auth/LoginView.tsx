import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Form } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email({ message: "Nieprawidłowy adres email" }),
  password: z.string().min(8, { message: "Hasło musi mieć minimum 8 znaków" }),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginView() {
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true)
    try {
      // TODO: Implement authentication
      console.log(data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm space-y-6 p-6">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Zaloguj się</CardTitle>
          <CardDescription>
            Wprowadź swoje dane aby się zalogować do IntelliXCards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jan.kowalski@example.com"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Hasło</Label>
                <Input
                  id="password"
                  type="password"
                  {...form.register("password")}
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Logowanie..." : "Zaloguj się"}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            <a 
              href="/auth/recovery" 
              className="text-sm text-muted-foreground underline hover:text-primary"
            >
              Zapomniałeś hasła?
            </a>
            <p className="mt-2 text-sm text-muted-foreground">
              Nie masz jeszcze konta?{" "}
              <a 
                href="/auth/register" 
                className="underline hover:text-primary"
              >
                Zarejestruj się
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
