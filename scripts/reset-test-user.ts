import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "node:path";

/* eslint-disable no-console */

dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

async function resetTestUser() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  const testEmail = process.env.E2E_USERNAME;
  const testPassword = process.env.E2E_PASSWORD;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_KEY in .env.test");
  }

  if (!testEmail || !testPassword) {
    throw new Error("Missing E2E_USERNAME or E2E_PASSWORD in .env.test");
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("🔄 Creating/updating test user...");

  // Try to sign up
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      emailRedirectTo: undefined,
    },
  });

  if (signUpError && !signUpError.message.includes("already registered")) {
    console.error("❌ Error:", signUpError.message);
    return;
  }

  if (signUpData.user) {
    console.log(`✅ User ID: ${signUpData.user.id}`);
    console.log(`✅ Email confirmed: ${signUpData.user.email_confirmed_at !== null}`);
  }

  // Try to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (signInError) {
    console.error("❌ Sign in error:", signInError.message);
  } else {
    console.log("✅ Sign in successful!");
    await supabase.auth.signOut();
  }

  console.log("\n📝 Test user credentials are stored in .env.test");
}

resetTestUser();
