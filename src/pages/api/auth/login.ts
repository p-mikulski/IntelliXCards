import type { APIRoute } from "astro";
import { loginSchema } from "@/lib/validation/auth";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = loginSchema.safeParse(body);

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

    // Attempt to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Handle authentication errors
      if (error.message.includes("Invalid login credentials")) {
        return new Response(
          JSON.stringify({
            code: "INVALID_CREDENTIALS",
            message: "Nieprawidlowy email lub haslo.",
          }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Generic error fallback
      console.error("Login error:", error);
      return new Response(
        JSON.stringify({
          code: "AUTH_ERROR",
          message: "An error occurred during login. Please try again.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Supabase SSR automatically handles session cookies through the client configuration
    // The createSupabaseServerInstance sets cookies via setAll() when auth state changes

    // Return success with minimal user data
    return new Response(
      JSON.stringify({
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected login error:", error);
    return new Response(
      JSON.stringify({
        code: "SERVER_ERROR",
        message: "An unexpected error occurred. Please try again.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
