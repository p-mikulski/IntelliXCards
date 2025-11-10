import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

/**
 * Global setup for E2E tests
 * Ensures the test user exists before running tests
 */
async function globalSetup() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  const testEmail = process.env.E2E_USERNAME;
  const testPassword = process.env.E2E_PASSWORD;

  if (!supabaseUrl || !supabaseKey || !testEmail || !testPassword) {
    throw new Error("Missing required environment variables for E2E tests");
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Try to sign in with the test user
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (signInError) {
    if (signInError.message.includes("Invalid login credentials")) {
      // Try to sign up the test user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          emailRedirectTo: undefined, // Disable email confirmation redirect
        },
      });

      // Handle "User already registered" error - this means the user exists but password is wrong
      if (signUpError && signUpError.message.includes("already registered")) {
        throw new Error(
          "Test user exists but password is incorrect. Please verify E2E_PASSWORD in .env.test or reset the test user password in Supabase Dashboard."
        );
      }

      if (signUpError) {
        throw new Error(`Failed to create test user: ${signUpError.message}`);
      }

      if (signUpData.user) {
        // Check if email confirmation is required
        if (signUpData.user.email_confirmed_at === null) {
          throw new Error(
            "Email confirmation is required. Please either:\n" +
              "  1. Disable email confirmation in Supabase Dashboard > Authentication > Settings\n" +
              "  2. Manually confirm the test user email in Supabase Dashboard"
          );
        }
      }
    } else {
      throw new Error(`Authentication error: ${signInError.message}`);
    }
  } else {
    // Successfully authenticated - sign out to clean up
    await supabase.auth.signOut();
  }
}

export default globalSetup;
