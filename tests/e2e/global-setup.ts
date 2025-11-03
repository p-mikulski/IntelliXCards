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

  console.log("\n🔧 Setting up E2E test environment...");
  console.log(`📧 Test user email: ${testEmail}`);

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Try to sign in with the test user
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (signInError) {
    if (signInError.message.includes("Invalid login credentials")) {
      console.log("⚠️  Test user doesn't exist or password is incorrect");
      console.log("🔄 Attempting to create test user...");

      // Try to sign up the test user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          emailRedirectTo: undefined, // Disable email confirmation redirect
        },
      });

      if (signUpError) {
        console.error("❌ Failed to create test user:", signUpError.message);
        throw new Error(`Failed to create test user: ${signUpError.message}`);
      }

      if (signUpData.user) {
        console.log(`✅ Test user created successfully: ${signUpData.user.id}`);

        // Check if email confirmation is required
        if (signUpData.user.email_confirmed_at === null) {
          console.log("⚠️  Email confirmation is required for this Supabase project");
          console.log("📝 Please either:");
          console.log("   1. Disable email confirmation in Supabase Dashboard > Authentication > Settings");
          console.log("   2. Or manually confirm the test user email in Supabase Dashboard");
          console.log(`   3. Or set E2E_USERNAME_ID=${signUpData.user.id} in .env.test and manually confirm`);
        }
      } else {
        console.log("⚠️  User may already exist but email needs confirmation");
      }
    } else {
      console.error("❌ Authentication error:", signInError.message);
      throw signInError;
    }
  } else {
    console.log(`✅ Test user authenticated successfully: ${signInData.user.id}`);
    console.log("🎯 E2E tests are ready to run");

    // Sign out to clean up
    await supabase.auth.signOut();
  }
}

export default globalSetup;
