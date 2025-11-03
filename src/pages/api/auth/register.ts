import type { APIRoute } from "astro";
import { registerSchema } from "@/lib/validation/auth";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      return new Response(
        JSON.stringify({
          code: "VALIDATION_ERROR",
          message: "Invalid input",
          fields: fieldErrors,
        }),
        {
          status: 422,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { email, password } = validation.data;

    // Get Supabase instance from locals
    const supabase = locals.supabase;

    // Attempt to sign up
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${new URL(request.url).origin}/dashboard`,
        data: {
          email_confirmed: true, // For E2E testing
        },
      },
    });

    if (error) {
      // Handle duplicate email (user already exists)
      if (error.message.includes("User already registered")) {
        return new Response(
          JSON.stringify({
            code: "DUPLICATE_EMAIL",
            message: "Konto z tym adresem email juz istnieje.",
          }),
          {
            status: 409,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Generic error fallback
      console.error("Registration error:", error);
      return new Response(
        JSON.stringify({
          code: "AUTH_ERROR",
          message: "Wystapil blad podczas rejestracji. Sprobuj ponownie.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if email confirmation is required
    if (data.user && !data.session) {
      // User created but email confirmation required
      return new Response(
        JSON.stringify({
          user: {
            id: data.user.id,
            email: data.user.email,
          },
          emailConfirmationRequired: true,
          message: "Please check your email to confirm your account.",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Return success with minimal user data
    return new Response(
      JSON.stringify({
        user: {
          id: data.user?.id,
          email: data.user?.email,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected registration error:", error);
    return new Response(
      JSON.stringify({
        code: "SERVER_ERROR",
        message: "Wystapil nieoczekiwany blad. Sprobuj ponownie.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
