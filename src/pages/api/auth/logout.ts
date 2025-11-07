import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ locals, cookies }) => {
  try {
    // Get Supabase instance from locals
    const supabase = locals.supabase;

    // Sign out the user
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      return new Response(
        JSON.stringify({
          code: "LOGOUT_ERROR",
          message: "An error occurred during logout.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Clear all auth cookies
    const cookieNames = ["sb-access-token", "sb-refresh-token"];
    cookieNames.forEach((name) => {
      cookies.delete(name, { path: "/" });
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected logout error:", error);
    return new Response(
      JSON.stringify({
        code: "SERVER_ERROR",
        message: "An unexpected error occurred.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
