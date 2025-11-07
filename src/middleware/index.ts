import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.client.ts";

// Public paths - Auth API endpoints & Server-Rendered Astro Pages
const PUBLIC_PATHS = [
  // Server-Rendered Astro Pages
  "/",
  "/welcome",
  "/auth/login",
  "/auth/register",
  "/auth/recovery",
  // Auth API endpoints
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/recovery",
  "/api/auth/logout",
];

export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  // Get environment variables from Cloudflare runtime (if available)
  const env = locals.runtime?.env;

  // Create Supabase server instance
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
    env,
  });

  // Store supabase instance in locals for use in API routes
  locals.supabase = supabase;

  // IMPORTANT: Always get user session first before any other operations
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    locals.user = {
      email: user.email ?? "",
      id: user.id,
    };
  }

  // Skip auth check for public paths (they will handle their own redirects)
  if (PUBLIC_PATHS.includes(url.pathname)) {
    return next();
  }

  // Redirect to login for protected routes if not authenticated
  if (!user) {
    return redirect("/auth/login");
  }

  return next();
});
